FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PokemonTeamBuilder.Api/PokemonTeamBuilder.Api.csproj", "PokemonTeamBuilder.Api/"]
RUN dotnet restore "PokemonTeamBuilder.Api/PokemonTeamBuilder.Api.csproj"
COPY . .
WORKDIR "/src/PokemonTeamBuilder.Api"
RUN dotnet build "PokemonTeamBuilder.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PokemonTeamBuilder.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PokemonTeamBuilder.Api.dll"]
