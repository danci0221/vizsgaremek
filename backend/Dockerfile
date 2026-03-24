# =========================
# BUILD STAGE
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Másoljuk a projektfájlokat
COPY . .

# Restore + build + publish
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

# =========================
# RUNTIME STAGE
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish ./

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# ⚠️ IDE ÍRD A SAJÁT DLL NEVED!
# pl.: TargyiEszkoz.Api.dll
ENTRYPOINT ["dotnet", "TargyiEszkoz.Api.dll"]
