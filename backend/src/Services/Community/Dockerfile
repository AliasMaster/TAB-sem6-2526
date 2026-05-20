FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Services/Community/Community.API/Community.API.csproj", "src/Services/Community/Community.API/"]
COPY ["src/Services/Community/Community.Domain/Community.Domain.csproj", "src/Services/Community/Community.Domain/"]
COPY ["src/Services/Community/Community.Application/Community.Application.csproj", "src/Services/Community/Community.Application/"]
COPY ["src/Services/Community/Community.Infrastructure/Community.Infrastructure.csproj", "src/Services/Community/Community.Infrastructure/"]

RUN dotnet restore "src/Services/Community/Community.API/Community.API.csproj"

COPY . .

WORKDIR "/src/src/Services/Community/Community.API"
RUN dotnet build "Community.API.csproj" -c Release -o /app/build
RUN dotnet publish "Community.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Community.API.dll"]