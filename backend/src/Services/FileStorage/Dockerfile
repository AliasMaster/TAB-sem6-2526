FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Services/FileStorage/FileStorage.API/FileStorage.API.csproj", "src/Services/FileStorage/FileStorage.API/"]
COPY ["src/Services/FileStorage/FileStorage.Domain/FileStorage.Domain.csproj", "src/Services/FileStorage/FileStorage.Domain/"]
COPY ["src/Services/FileStorage/FileStorage.Application/FileStorage.Application.csproj", "src/Services/FileStorage/FileStorage.Application/"]
COPY ["src/Services/FileStorage/FileStorage.Infrastructure/FileStorage.Infrastructure.csproj", "src/Services/FileStorage/FileStorage.Infrastructure/"]
COPY ["src/Shared/Shared.Events/Shared.Events.csproj", "src/Shared/Shared.Events/"]

RUN dotnet restore "src/Services/FileStorage/FileStorage.API/FileStorage.API.csproj"

COPY . .

WORKDIR "/src/src/Services/FileStorage/FileStorage.API"
RUN dotnet build "FileStorage.API.csproj" -c Release -o /app/build
RUN dotnet publish "FileStorage.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["dotnet", "FileStorage.API.dll"]
