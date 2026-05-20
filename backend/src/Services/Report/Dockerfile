FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Services/Report/Report.API/Report.API.csproj", "src/Services/Report/Report.API/"]
COPY ["src/Services/Report/Report.Domain/Report.Domain.csproj", "src/Services/Report/Report.Domain/"]
COPY ["src/Services/Report/Report.Application/Report.Application.csproj", "src/Services/Report/Report.Application/"]
COPY ["src/Services/Report/Report.Infrastructure/Report.Infrastructure.csproj", "src/Services/Report/Report.Infrastructure/"]

RUN dotnet restore "src/Services/Report/Report.API/Report.API.csproj"

COPY . .

WORKDIR "/src/src/Services/Report/Report.API"
RUN dotnet build "Report.API.csproj" -c Release -o /app/build
RUN dotnet publish "Report.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Report.API.dll"]