namespace Continuum.API.DTOs;

public record CaseListItemDto(
    int Id,
    string CaseNumber,
    string ClientFullName,
    string? ClientPhone,
    string? ClientEmail,
    DateTime SarDueDate,
    int DaysUntilDue,
    string Status,
    string UrgencyLevel,
    bool IsAtRisk,
    int OutreachAttempts,
    DateTime? LastOutreachAt,
    DateTime? SubmittedAt
);

public record CaseDetailDto(
    int Id,
    string CaseNumber,
    int ClientId,
    string ClientFullName,
    string? ClientPhone,
    string? ClientEmail,
    string PreferredLanguage,
    DateTime SarDueDate,
    int DaysUntilDue,
    string Status,
    string UrgencyLevel,
    bool IsAtRisk,
    int OutreachAttempts,
    DateTime? LastOutreachAt,
    DateTime? SubmittedAt,
    IEnumerable<OutreachLogDto> OutreachHistory
);

public record CaseImportDto(
    string CaseNumber,
    string ClientFirstName,
    string ClientLastName,
    string? ClientPhone,
    string? ClientEmail,
    DateTime SarDueDate,
    string? CalSawsId,
    string? PreferredLanguage
);

public record CaseQueryParams(
    int? CountyId = null,
    string? Status = null,
    string? UrgencyLevel = null,
    DateTime? DueDateFrom = null,
    DateTime? DueDateTo = null,
    bool? IsAtRisk = null,
    int Page = 1,
    int PageSize = 25
);

public record PagedResult<T>(
    IEnumerable<T> Items,
    int Total,
    int Page,
    int PageSize
);
