// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CarRentalV1.sol";

/// @title CarRentalV2 - Ajout du depot de garantie et penalites de retard
/// @notice V2 ajoute : depot de garantie par voiture, penalites de retard,
///         frais de plateforme, et une fonction getVersion()
/// @dev Herite de CarRentalV1, utilise reinitializer(2) et consomme des slots du __gap
contract CarRentalV2 is CarRentalV1 {
    // ─────────────── NEW V2 STATE ───────────────

    /// @notice Montant du depot de garantie par voiture (0 = pas de depot)
    mapping(uint256 => uint256) public carDepositAmounts;

    /// @notice Depot paye par reservation
    mapping(uint256 => uint256) public reservationDeposits;

    /// @notice Si le depot a deja ete rembourse pour une reservation
    mapping(uint256 => bool) public depositRefunded;

    /// @notice Penalite par jour de retard (en wei)
    uint256 public latePenaltyPerDay;

    /// @notice Pourcentage de frais de plateforme (ex: 5 = 5%)
    uint256 public platformFeePercent;

    /// @notice Frais de plateforme accumules
    uint256 public accumulatedPlatformFees;

    /// @dev Gap reduit pour V2 (6 slots consommes depuis V1)
    uint256[38] private __gapV2;

    // ─────────────── NEW V2 EVENTS ───────────────

    event DepositPaid(uint256 indexed reservationId, uint256 amount);
    event DepositRefunded(
        uint256 indexed reservationId,
        uint256 refundAmount,
        uint256 penaltyAmount
    );
    event LateReturn(
        uint256 indexed reservationId,
        uint256 daysLate,
        uint256 penaltyAmount
    );
    event PlatformFeesWithdrawn(address indexed recipient, uint256 amount);

    // ─────────────── NEW V2 ERRORS ───────────────

    error DepositRequired(uint256 carId, uint256 required);
    error DepositAlreadyRefunded(uint256 reservationId);
    error InvalidFeePercent();

    // ─────────────── REINITIALIZER ───────────────

    function initializeV2(
        uint256 _latePenaltyPerDay,
        uint256 _platformFeePercent
    ) public reinitializer(2) {
        if (_platformFeePercent > 20) revert InvalidFeePercent();
        latePenaltyPerDay = _latePenaltyPerDay;
        platformFeePercent = _platformFeePercent;
    }

    // ─────────────── NEW V2 FUNCTIONS ───────────────

    /// @notice Definir le depot de garantie pour une voiture
    function setCarDeposit(uint256 carId, uint256 depositAmount) external {
        Car memory car = this.getCar(carId);
        if (car.owner != msg.sender) revert NotCarOwner(carId, msg.sender);
        carDepositAmounts[carId] = depositAmount;
    }

    /// @notice Modifier la penalite de retard (owner uniquement)
    function setLatePenaltyPerDay(uint256 _penalty) external onlyOwner {
        latePenaltyPerDay = _penalty;
    }

    /// @notice Modifier les frais de plateforme (owner uniquement, max 20%)
    function setPlatformFeePercent(uint256 _percent) external onlyOwner {
        if (_percent > 20) revert InvalidFeePercent();
        platformFeePercent = _percent;
    }

    /// @notice Louer une voiture avec depot de garantie (V2)
    function rentCarWithDeposit(
        uint256 carId,
        uint64 startDate,
        uint64 endDate
    ) external payable nonReentrant returns (uint256 reservationId) {
        Car memory car = this.getCar(carId);
        if (!car.isActive) revert CarNotActive(carId);
        if (car.owner == msg.sender) revert CannotRentOwnCar();
        if (startDate >= endDate) revert InvalidDates(startDate, endDate);
        if (startDate < uint64(block.timestamp)) revert StartDateInPast();
        if (startDate % 1 days != 0 || endDate % 1 days != 0)
            revert DatesNotDayAligned();

        _checkNoOverlap(carId, startDate, endDate);

        uint256 numberOfDays = (endDate - startDate) / 1 days;
        uint256 rentalPrice = numberOfDays * car.dailyPrice;
        uint256 platformFee = (rentalPrice * platformFeePercent) / 100;
        uint256 depositRequired = carDepositAmounts[carId];
        uint256 totalRequired = rentalPrice + depositRequired;

        if (msg.value < totalRequired)
            revert InsufficientPayment(totalRequired, msg.value);

        // Creer la reservation
        reservationId = _createReservation(
            carId,
            msg.sender,
            startDate,
            endDate,
            rentalPrice
        );

        // Stocker le depot
        reservationDeposits[reservationId] = depositRequired;

        // Crediter le proprietaire (moins les frais de plateforme)
        _creditEarnings(car.owner, rentalPrice - platformFee);
        accumulatedPlatformFees += platformFee;

        // Rembourser l'exces
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            if (!success) revert TransferFailed();
        }

        emit DepositPaid(reservationId, depositRequired);
        emit CarRented(
            reservationId,
            carId,
            msg.sender,
            startDate,
            endDate,
            rentalPrice
        );
    }

    /// @notice Retourner une voiture avec gestion du depot et penalites (V2)
    function returnCarWithDeposit(
        uint256 reservationId
    ) external nonReentrant {
        Reservation memory reservation = this.getReservation(reservationId);
        if (reservation.renter != msg.sender)
            revert NotRenter(reservationId, msg.sender);
        if (!reservation.isActive)
            revert ReservationNotActive(reservationId);
        if (depositRefunded[reservationId])
            revert DepositAlreadyRefunded(reservationId);

        _markReturned(reservationId);
        depositRefunded[reservationId] = true;

        uint256 deposit = reservationDeposits[reservationId];
        uint256 penalty = 0;
        uint256 refund = deposit;

        // Calculer la penalite de retard
        if (block.timestamp > reservation.endDate && latePenaltyPerDay > 0) {
            uint256 daysLate = (block.timestamp -
                reservation.endDate +
                1 days -
                1) / 1 days;
            penalty = daysLate * latePenaltyPerDay;
            if (penalty > deposit) penalty = deposit;
            refund = deposit - penalty;

            // La penalite va au proprietaire
            Car memory car = this.getCar(reservation.carId);
            _creditEarnings(car.owner, penalty);

            emit LateReturn(reservationId, daysLate, penalty);
        }

        // Rembourser le depot restant
        if (refund > 0) {
            (bool success, ) = payable(reservation.renter).call{value: refund}(
                ""
            );
            if (!success) revert TransferFailed();
        }

        emit DepositRefunded(reservationId, refund, penalty);
        emit CarReturned(reservationId, reservation.carId, msg.sender);
    }

    /// @notice Retirer les frais de plateforme accumules (owner uniquement)
    function withdrawPlatformFees() external onlyOwner nonReentrant {
        uint256 fees = accumulatedPlatformFees;
        require(fees > 0, "No fees");
        accumulatedPlatformFees = 0;
        (bool success, ) = payable(owner()).call{value: fees}("");
        if (!success) revert TransferFailed();
        emit PlatformFeesWithdrawn(owner(), fees);
    }

    /// @notice Retourne la version du contrat (preuve d'upgrade)
    function getVersion() external pure returns (string memory) {
        return "2.0.0";
    }
}
