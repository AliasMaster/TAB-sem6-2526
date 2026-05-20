using Microsoft.Extensions.DependencyInjection;
using FileStorage.Application.Common.Interfaces;
using FileStorage.Application.Services;

namespace FileStorage.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<IVideoProcessingManager, VideoProcessingManager>();
        return services;
    }
}
