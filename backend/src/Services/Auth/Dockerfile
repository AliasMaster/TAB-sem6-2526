# Etap 1: Budowanie aplikacji (SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Kopiujemy plik projektu i przywracamy zależności (nuget)
COPY ["AuthService.csproj", "./"]
RUN dotnet restore

# Kopiujemy resztę kodu i budujemy
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Etap 2: Uruchamianie aplikacji (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Domyślny port dla .NET 8+ to 8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "AuthService.dll"]