namespace Continuum.API.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string Token,
    string TokenType,
    int ExpiresIn,
    WorkerProfileDto Worker
);

public record WorkerProfileDto(
    int Id,
    int CountyId,
    string CountyName,
    string Email,
    string FullName,
    string Role
);
