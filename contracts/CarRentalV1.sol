// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/// @title CarRentalV1 - Location de voitures decentralisee
/// @notice Permet de lister des voitures, les louer, et gerer les reservations
/// @dev Utilise le pattern UUPS pour les mises a niveau
contract CarRentalV1 is
    Initializable,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    // ─────────────── STRUCTS ───────────────

    struct Car {
        uint256 id;
        address owner;
        string brand;
        string model;
        uint16 year;
        uint256 dailyPrice; // prix par jour en wei
        bool isActive;
        string metadataURI; // lien optionnel (ex: image IPFS)
    }

    struct Reservation {
        uint256 id;
        uint256 carId;
        address renter;
        uint64 startDate; // timestamp UTC minuit du premier jour
        uint64 endDate; // timestamp UTC minuit du jour APRES le dernier jour
        uint256 totalPrice;
        bool isActive;
    }

    // ─────────────── STATE ───────────────

    uint256 private _nextCarId;
    uint256 private _nextReservationId;

    mapping(uint256 => Car) private _cars;
    mapping(uint256 => Reservation) private _reservations;
    mapping(uint256 => uint256[]) private _carReservationIds;
    mapping(address => uint256) private _earnings;

    /// @dev Reserve des slots de storage pour les futures versions
    uint256[44] private __gap;

    // ─────────────── CUSTOM ERRORS ───────────────

    error CarNotFound(uint256 carId);
    error ReservationNotFound(uint256 reservationId);
    error NotCarOwner(uint256 carId, address caller);
    error NotRenter(uint256 reservationId, address caller);
    error CarNotActive(uint256 carId);
    error ReservationOverlap(uint256 carId, uint256 existingReservationId);
    error InsufficientPayment(uint256 required, uint256 sent);
    error InvalidDates(uint64 startDate, uint64 endDate);
    error DatesNotDayAligned();
    error StartDateInPast();
    error ReservationNotActive(uint256 reservationId);
    error ReservationAlreadyStarted(uint256 reservationId);
    error CannotRentOwnCar();
    error NoEarningsToWithdraw();
    error TransferFailed();

    // ─────────────── EVENTS ───────────────

    event CarListed(
        uint256 indexed carId,
        address indexed owner,
        string brand,
        string model,
        uint256 dailyPrice
    );
    event CarUpdated(uint256 indexed carId, uint256 dailyPrice, bool isActive);
    event CarRented(
        uint256 indexed reservationId,
        uint256 indexed carId,
        address indexed renter,
        uint64 startDate,
        uint64 endDate,
        uint256 totalPrice
    );
    event CarReturned(
        uint256 indexed reservationId,
        uint256 indexed carId,
        address indexed renter
    );
    event ReservationCancelled(
        uint256 indexed reservationId,
        uint256 refundAmount
    );
    event EarningsWithdrawn(address indexed owner, uint256 amount);

    // ─────────────── INITIALIZER ───────────────

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        _nextCarId = 1;
        _nextReservationId = 1;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // ─────────────── CAR MANAGEMENT ───────────────

    /// @notice Lister une voiture a louer
    function listCar(
        string calldata brand,
        string calldata model,
        uint16 year,
        uint256 dailyPrice,
        string calldata metadataURI
    ) external returns (uint256 carId) {
        require(bytes(brand).length > 0, "Brand required");
        require(bytes(model).length > 0, "Model required");
        require(dailyPrice > 0, "Price must be > 0");
        require(year >= 1900 && year <= 2100, "Invalid year");

        carId = _nextCarId++;
        _cars[carId] = Car({
            id: carId,
            owner: msg.sender,
            brand: brand,
            model: model,
            year: year,
            dailyPrice: dailyPrice,
            isActive: true,
            metadataURI: metadataURI
        });

        emit CarListed(carId, msg.sender, brand, model, dailyPrice);
    }

    /// @notice Modifier le prix ou le statut d'une voiture
    function updateCar(
        uint256 carId,
        uint256 newDailyPrice,
        bool isActive
    ) external {
        Car storage car = _cars[carId];
        if (car.owner == address(0)) revert CarNotFound(carId);
        if (car.owner != msg.sender) revert NotCarOwner(carId, msg.sender);
        require(newDailyPrice > 0, "Price must be > 0");

        car.dailyPrice = newDailyPrice;
        car.isActive = isActive;

        emit CarUpdated(carId, newDailyPrice, isActive);
    }

    // ─────────────── RENTAL OPERATIONS ───────────────

    /// @notice Louer une voiture pour une periode donnee
    function rentCar(
        uint256 carId,
        uint64 startDate,
        uint64 endDate
    ) external payable nonReentrant returns (uint256 reservationId) {
        Car storage car = _cars[carId];
        if (car.owner == address(0)) revert CarNotFound(carId);
        if (!car.isActive) revert CarNotActive(carId);
        if (car.owner == msg.sender) revert CannotRentOwnCar();
        if (startDate >= endDate) revert InvalidDates(startDate, endDate);
        if (startDate < uint64(block.timestamp))
            revert StartDateInPast();
        if (startDate % 1 days != 0 || endDate % 1 days != 0)
            revert DatesNotDayAligned();

        uint256 numberOfDays = (endDate - startDate) / 1 days;
        uint256 totalPrice = numberOfDays * car.dailyPrice;

        if (msg.value < totalPrice)
            revert InsufficientPayment(totalPrice, msg.value);

        _checkNoOverlap(carId, startDate, endDate);

        reservationId = _createReservation(
            carId,
            msg.sender,
            startDate,
            endDate,
            totalPrice
        );

        _creditEarnings(car.owner, totalPrice);

        // Rembourser l'exces
        uint256 excess = msg.value - totalPrice;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            if (!success) revert TransferFailed();
        }

        emit CarRented(
            reservationId,
            carId,
            msg.sender,
            startDate,
            endDate,
            totalPrice
        );
    }

    /// @notice Retourner une voiture louee
    function returnCar(uint256 reservationId) external {
        Reservation storage reservation = _reservations[reservationId];
        if (reservation.renter == address(0))
            revert ReservationNotFound(reservationId);
        if (reservation.renter != msg.sender)
            revert NotRenter(reservationId, msg.sender);
        if (!reservation.isActive)
            revert ReservationNotActive(reservationId);

        _markReturned(reservationId);

        emit CarReturned(
            reservationId,
            reservation.carId,
            msg.sender
        );
    }

    /// @notice Annuler une reservation avant son debut (remboursement complet)
    function cancelReservation(
        uint256 reservationId
    ) external nonReentrant {
        Reservation storage reservation = _reservations[reservationId];
        if (reservation.renter == address(0))
            revert ReservationNotFound(reservationId);
        if (!reservation.isActive)
            revert ReservationNotActive(reservationId);

        Car storage car = _cars[reservation.carId];
        if (msg.sender != reservation.renter && msg.sender != car.owner) {
            revert NotRenter(reservationId, msg.sender);
        }

        if (uint64(block.timestamp) >= reservation.startDate) {
            revert ReservationAlreadyStarted(reservationId);
        }

        // Effects
        reservation.isActive = false;
        _earnings[car.owner] -= reservation.totalPrice;
        uint256 refundAmount = reservation.totalPrice;

        // Interactions
        (bool success, ) = payable(reservation.renter).call{
            value: refundAmount
        }("");
        if (!success) revert TransferFailed();

        emit ReservationCancelled(reservationId, refundAmount);
    }

    // ─────────────── WITHDRAWAL ───────────────

    /// @notice Retirer les gains accumules
    function withdrawEarnings() external nonReentrant {
        uint256 amount = _earnings[msg.sender];
        if (amount == 0) revert NoEarningsToWithdraw();

        // Effects (CEI pattern)
        _earnings[msg.sender] = 0;

        // Interactions
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit EarningsWithdrawn(msg.sender, amount);
    }

    // ─────────────── INTERNAL HELPERS ───────────────

    /// @dev Verifie qu'il n'y a pas de chevauchement avec les reservations actives
    function _checkNoOverlap(
        uint256 carId,
        uint64 startDate,
        uint64 endDate
    ) internal view {
        uint256[] storage reservationIds = _carReservationIds[carId];
        for (uint256 i = 0; i < reservationIds.length; i++) {
            Reservation storage existing = _reservations[reservationIds[i]];
            if (!existing.isActive) continue;

            // Chevauchement si : newStart < existEnd ET newEnd > existStart
            if (startDate < existing.endDate && endDate > existing.startDate) {
                revert ReservationOverlap(carId, reservationIds[i]);
            }
        }
    }

    /// @dev Cree une reservation et met a jour les mappings
    function _createReservation(
        uint256 carId,
        address renter,
        uint64 startDate,
        uint64 endDate,
        uint256 totalPrice
    ) internal returns (uint256 reservationId) {
        reservationId = _nextReservationId++;
        _reservations[reservationId] = Reservation({
            id: reservationId,
            carId: carId,
            renter: renter,
            startDate: startDate,
            endDate: endDate,
            totalPrice: totalPrice,
            isActive: true
        });
        _carReservationIds[carId].push(reservationId);
    }

    /// @dev Marque une reservation comme retournee
    function _markReturned(uint256 reservationId) internal {
        _reservations[reservationId].isActive = false;
    }

    /// @dev Credite les gains d'un proprietaire
    function _creditEarnings(address carOwner, uint256 amount) internal {
        _earnings[carOwner] += amount;
    }

    // ─────────────── VIEW FUNCTIONS ───────────────

    function getCar(uint256 carId) external view returns (Car memory) {
        if (_cars[carId].owner == address(0)) revert CarNotFound(carId);
        return _cars[carId];
    }

    function getReservation(
        uint256 reservationId
    ) external view returns (Reservation memory) {
        if (_reservations[reservationId].renter == address(0))
            revert ReservationNotFound(reservationId);
        return _reservations[reservationId];
    }

    function getCarReservations(
        uint256 carId
    ) external view returns (uint256[] memory) {
        return _carReservationIds[carId];
    }

    function getCarCount() external view returns (uint256) {
        return _nextCarId - 1;
    }

    function getReservationCount() external view returns (uint256) {
        return _nextReservationId - 1;
    }

    function isCarAvailable(
        uint256 carId,
        uint64 startDate,
        uint64 endDate
    ) external view returns (bool) {
        uint256[] storage reservationIds = _carReservationIds[carId];
        for (uint256 i = 0; i < reservationIds.length; i++) {
            Reservation storage existing = _reservations[reservationIds[i]];
            if (!existing.isActive) continue;
            if (startDate < existing.endDate && endDate > existing.startDate) {
                return false;
            }
        }
        return true;
    }

    function calculateRentalPrice(
        uint256 carId,
        uint64 startDate,
        uint64 endDate
    ) external view returns (uint256) {
        Car storage car = _cars[carId];
        if (car.owner == address(0)) revert CarNotFound(carId);
        uint256 numberOfDays = (endDate - startDate) / 1 days;
        return numberOfDays * car.dailyPrice;
    }

    function getOwnerEarnings(
        address carOwner
    ) external view returns (uint256) {
        return _earnings[carOwner];
    }
}
