using System.Diagnostics;

namespace Continuum.API.DevTools;

/// <summary>
/// Automatically starts `npm run dev` in Continuum.Web when the API launches in
/// Development mode. This lets a single F5 press in Visual Studio bring up both
/// the ASP.NET Core API and the Vite dev server without needing the VS Node.js
/// workload or the .esproj SDK.
/// </summary>
public sealed class ReactDevServerService : IHostedService
{
    private readonly ILogger<ReactDevServerService> _logger;
    private Process? _process;

    public ReactDevServerService(ILogger<ReactDevServerService> logger)
    {
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        var webRoot = Path.GetFullPath(
            Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Continuum.Web"));

        if (!Directory.Exists(webRoot))
        {
            _logger.LogWarning("ReactDevServerService: Continuum.Web not found at {Path} — skipping.", webRoot);
            return Task.CompletedTask;
        }

        var nodeModules = Path.Combine(webRoot, "node_modules");
        if (!Directory.Exists(nodeModules))
        {
            _logger.LogWarning("ReactDevServerService: node_modules missing in {Path}. Run `npm install` first.", webRoot);
            return Task.CompletedTask;
        }

        _logger.LogInformation("ReactDevServerService: Starting Vite dev server in {Path}", webRoot);

        _process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName               = "cmd.exe",
                Arguments              = "/c npm run dev",
                WorkingDirectory       = webRoot,
                UseShellExecute        = false,
                CreateNoWindow         = true,
                RedirectStandardOutput = true,
                RedirectStandardError  = true,
            }
        };

        _process.OutputDataReceived += (_, e) =>
        {
            if (!string.IsNullOrEmpty(e.Data))
                _logger.LogInformation("[Vite] {Line}", e.Data);
        };
        _process.ErrorDataReceived += (_, e) =>
        {
            if (!string.IsNullOrEmpty(e.Data))
                _logger.LogWarning("[Vite] {Line}", e.Data);
        };

        try
        {
            _process.Start();
            _process.BeginOutputReadLine();
            _process.BeginErrorReadLine();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ReactDevServerService: Failed to start npm.");
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        if (_process is { HasExited: false })
        {
            try
            {
                // Kill the entire process tree so cmd.exe and node both exit
                _process.Kill(entireProcessTree: true);
                _logger.LogInformation("ReactDevServerService: Vite dev server stopped.");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "ReactDevServerService: Error stopping Vite process.");
            }
        }

        _process?.Dispose();
        return Task.CompletedTask;
    }
}
