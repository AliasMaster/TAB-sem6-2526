using System.Net.Http.Json;

namespace EnrollmentService.Clients;

public class CatalogApiClient
{
    private readonly HttpClient _httpClient;

    public CatalogApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<CourseMaterialDto>?> GetCourseMaterialsAsync(Guid courseId, IHeaderDictionary incomingHeaders)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/courses/{courseId}/materials");
        
        // Forward X-User-* headers
        foreach (var header in incomingHeaders)
        {
            if (header.Key.StartsWith("X-User-", StringComparison.OrdinalIgnoreCase))
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            return null; // Lub rzucenie wyjątku z zależności od strategii błędu
        }

        return await response.Content.ReadFromJsonAsync<List<CourseMaterialDto>>();
    }
}

public record CourseMaterialDto(Guid Id, string Title, string ContentUrl, int Order);
