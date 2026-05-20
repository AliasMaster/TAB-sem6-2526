using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Community.Application.Common.Interfaces;
using Community.Domain.Entities;

namespace Community.API.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    private readonly IWeatherService _weatherService;

    public WeatherForecastController(IWeatherService weatherService)
    {
        _weatherService = weatherService;
    }

    [HttpGet(Name = "GetWeatherForecast")]
    public async Task<ActionResult<WeatherForecast[]>> Get(CancellationToken ct)
    {
        var forecast = await _weatherService.GetForecastsAsync(ct);
        return Ok(forecast);
    }
}
