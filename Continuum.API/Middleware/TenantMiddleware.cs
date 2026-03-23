namespace Continuum.API.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var claimCountyId = context.User.FindFirst("county_id")?.Value;
            var role = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Admins can access any county
            if (role != "Admin")
            {
                var queryCountyId = context.Request.Query["countyId"].ToString();

                if (!string.IsNullOrEmpty(queryCountyId) &&
                    !string.IsNullOrEmpty(claimCountyId) &&
                    queryCountyId != claimCountyId)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        error = "Access to this county's data is not permitted."
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}
