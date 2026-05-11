# ETAP 1: Budowanie (SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Kopiujemy pliki projektów, aby przyśpieszyć cache'owanie warstw (restore)
COPY ["Auth.API/Auth.API.csproj", "Auth.API/"]
COPY ["Auth.Domain/Auth.Domain.csproj", "Auth.Domain/"]
COPY ["Auth.Application/Auth.Application.csproj", "Auth.Application/"]
COPY ["Auth.Infrastructure/Auth.Infrastructure.csproj", "Auth.Infrastructure/"]

# Przywracamy zależności
RUN dotnet restore "Auth.API/Auth.API.csproj"

# Kopiujemy całą resztę kodu źródłowego
COPY . .

# Kompilujemy i publikujemy projekt
WORKDIR "/src/Auth.API"
RUN dotnet build "Auth.API.csproj" -c Release -o /app/build
RUN dotnet publish "Auth.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ETAP 2: Uruchamianie (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Kopiujemy tylko gotowe pliki binarne z etapu budowania
COPY --from=build /app/publish .

# Ustawiamy punkt startowy
ENTRYPOINT ["dotnet", "Auth.API.dll"]