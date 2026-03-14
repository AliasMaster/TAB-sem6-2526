# ETAP 1: Budowanie aplikacji (SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Kopiujemy plik projektu i przywracamy zależności NuGet
COPY ["ApiGateway.csproj", "./"]
RUN dotnet restore "ApiGateway.csproj"

# Kopiujemy resztę plików źródłowych i budujemy projekt
COPY . .
RUN dotnet build "ApiGateway.csproj" -c Release -o /app/build

# ETAP 2: Publikacja aplikacji
FROM build AS publish
RUN dotnet publish "ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ETAP 3: Obraz finalny (Runtime) - bardzo lekki
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# .NET 8 domyślnie nasłuchuje na porcie 8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ApiGateway.dll"]