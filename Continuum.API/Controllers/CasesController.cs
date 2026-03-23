using Continuum.API.DTOs;
using Continuum.API.Services;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace Continuum.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CasesController : ControllerBase
{
    private readonly ICaseService _caseService;

    public CasesController(ICaseService caseService) => _caseService = caseService;

    [HttpGet]
    public async Task<ActionResult<PagedResult<CaseListItemDto>>> GetCases([FromQuery] CaseQueryParams query)
    {
        var countyId = GetCountyId();
        if (!countyId.HasValue) return Forbid();

        var result = await _caseService.GetCasesAsync(query with { CountyId = countyId });
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CaseDetailDto>> GetCase(int id)
    {
        var countyId = GetCountyId();
        if (!countyId.HasValue) return Forbid();

        var result = await _caseService.GetCaseByIdAsync(id, countyId.Value);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("import")]
    public async Task<ActionResult> ImportCases(IFormFile file)
    {
        var countyId = GetCountyId();
        if (!countyId.HasValue) return Forbid();

        if (file is null || file.Length == 0)
            return BadRequest(new { error = "File is empty or not provided." });

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HeaderValidated = null,
            MissingFieldFound = null
        };

        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, config);

        List<CaseImportDto> records;
        try
        {
            records = csv.GetRecords<CaseImportDto>().ToList();
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"CSV parse error: {ex.Message}" });
        }

        var imported = await _caseService.ImportCasesAsync(countyId.Value, records);
        return Ok(new { Imported = imported, Total = records.Count });
    }

    private int? GetCountyId()
    {
        var claim = User.FindFirst("county_id")?.Value;
        return int.TryParse(claim, out var id) ? id : null;
    }
}
