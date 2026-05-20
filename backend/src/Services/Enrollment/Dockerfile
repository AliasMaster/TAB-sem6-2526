FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Services/Enrollment/Enrollment.API/Enrollment.API.csproj", "src/Services/Enrollment/Enrollment.API/"]
COPY ["src/Services/Enrollment/Enrollment.Domain/Enrollment.Domain.csproj", "src/Services/Enrollment/Enrollment.Domain/"]
COPY ["src/Services/Enrollment/Enrollment.Application/Enrollment.Application.csproj", "src/Services/Enrollment/Enrollment.Application/"]
COPY ["src/Services/Enrollment/Enrollment.Infrastructure/Enrollment.Infrastructure.csproj", "src/Services/Enrollment/Enrollment.Infrastructure/"]
COPY ["src/Shared/Shared.Events/Shared.Events.csproj", "src/Shared/Shared.Events/"]

RUN dotnet restore "src/Services/Enrollment/Enrollment.API/Enrollment.API.csproj"

COPY . .

WORKDIR "/src/src/Services/Enrollment/Enrollment.API"
RUN dotnet build "Enrollment.API.csproj" -c Release -o /app/build
RUN dotnet publish "Enrollment.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Enrollment.API.dll"]