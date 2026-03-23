namespace Continuum.API.DTOs;

public record SarFormDto(
    string CaseNumber,
    string ClientFirstName,
    string ClientLastName,
    DateTime SarDueDate,
    int DaysUntilDue,
    string PreferredLanguage
);

public record SarSubmitRequest(
    string HouseholdComposition,
    string IncomeDetails,
    string ExpensesDetails,
    string AddressConfirmation,
    bool HasChanges,
    string? ChangesDescription,
    string? AdditionalNotes
);

public record SarSubmitResponse(
    bool Success,
    string ConfirmationNumber,
    DateTime SubmittedAt
);
