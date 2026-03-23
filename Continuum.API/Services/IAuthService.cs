using Continuum.API.DTOs;

namespace Continuum.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<WorkerProfileDto?> GetWorkerProfileAsync(int workerId);
}
