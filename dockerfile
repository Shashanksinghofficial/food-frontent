# ---------- Build Stage ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/Foodime-backend/Foodime_Backend.csproj ./backend/Foodime-backend/
RUN dotnet restore backend/Foodime-backend/Foodime_Backend.csproj

COPY backend/Foodime-backend/. ./backend/Foodime-backend/
WORKDIR /src/backend/Foodime-backend
RUN dotnet publish -c Release -o /app/publish

# ---------- Runtime Stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:$PORT
EXPOSE 8080

ENTRYPOINT ["dotnet", "Foodime_Backend.dll"]