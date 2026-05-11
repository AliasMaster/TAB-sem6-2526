FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["FileStorageService.csproj", "./"]
RUN dotnet restore "FileStorageService.csproj"
COPY . .
RUN dotnet build "FileStorageService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FileStorageService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY --from=publish /app/publish .
RUN mkdir -p /app/uploads
ENTRYPOINT ["dotnet", "FileStorageService.dll"]
