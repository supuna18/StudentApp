FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app

# Copy csproj and restore dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy everything else
COPY . .

# Expose port 5005
EXPOSE 5005

# Command to run with hot reload
CMD ["dotnet", "watch", "run", "--urls", "http://+:5005"]