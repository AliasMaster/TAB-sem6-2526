using System.Threading;
using System.Threading.Tasks;
using Community.Domain.Entities;

namespace Community.Application.Common.Interfaces;

public interface IWeatherService
{
    Task<WeatherForecast[]> GetForecastsAsync(CancellationToken ct = default);
}
