namespace Continuum.API.DTOs;

public record OutreachLogDto(
    int Id,
    string Channel,
    string Status,
    string MessageTemplate,
    int DaysBeforeDue,
    DateTime SentAt,
    DateTime? DeliveredAt,
    string? ErrorMessage
);

public record SendOutreachRequest(
    int CaseId,
    string Channel,
    string? TemplateOverride
);
