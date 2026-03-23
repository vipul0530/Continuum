namespace Continuum.API.DTOs;

public record ReportSummaryDto(
    int CountyId,
    string CountyName,
    int TotalActiveCases,
    int TotalRedCases,
    int TotalYellowCases,
    int TotalGreenCases,
    int TotalSubmittedThisMonth,
    int TotalTerminatedThisMonth,
    int TotalOutreachSentThisMonth,
    double ComplianceRate,
    double EstimatedCostSavings
);
