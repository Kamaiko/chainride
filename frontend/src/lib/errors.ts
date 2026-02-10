/** Map contract custom error names to user-friendly French messages */
const ERROR_MESSAGES: Record<string, string> = {
  CarNotFound: "Voiture introuvable.",
  ReservationNotFound: "Reservation introuvable.",
  NotCarOwner: "Vous n'etes pas le proprietaire de cette voiture.",
  NotRenter: "Vous n'etes pas le locataire de cette reservation.",
  CarNotActive: "Cette voiture n'est plus disponible.",
  ReservationOverlap: "Cette periode chevauche une reservation existante.",
  InsufficientPayment: "Le montant envoye est insuffisant.",
  InvalidDates: "Les dates sont invalides (debut doit preceder la fin).",
  DatesNotDayAligned: "Les dates doivent etre alignees a minuit UTC.",
  StartDateInPast: "La date de debut est dans le passe.",
  ReservationNotActive: "Cette reservation n'est plus active.",
  ReservationAlreadyStarted: "Impossible d'annuler : la reservation a deja commence.",
  CannotRentOwnCar: "Vous ne pouvez pas louer votre propre voiture.",
  NoEarningsToWithdraw: "Aucun gain a retirer.",
  TransferFailed: "Le transfert ETH a echoue.",
  DepositRequired: "Un depot de garantie est requis pour cette voiture.",
  DepositAlreadyRefunded: "Le depot a deja ete rembourse.",
  InvalidFeePercent: "Le pourcentage de frais est invalide (max 20%).",
};

/** Extract a user-friendly error message from a contract error */
export function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "Une erreur est survenue.";

  const err = error as Record<string, unknown>;

  // wagmi/viem contract revert errors
  if (err.cause && typeof err.cause === "object") {
    const cause = err.cause as Record<string, unknown>;
    if (cause.name === "ContractFunctionRevertedError" && cause.data) {
      const data = cause.data as Record<string, unknown>;
      const errorName = data.errorName as string;
      if (errorName && ERROR_MESSAGES[errorName]) {
        return ERROR_MESSAGES[errorName];
      }
    }
  }

  // User rejected
  if (err.name === "UserRejectedRequestError" || (err.message as string)?.includes("User rejected")) {
    return "Transaction annulee par l'utilisateur.";
  }

  // Fallback
  const message = (err.shortMessage || err.message || "Une erreur est survenue.") as string;
  return message;
}
