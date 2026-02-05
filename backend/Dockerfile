# 1. SDK Image එකම පාවිච්චි කරනවා (මේකේ තමයි Build කරන්නයි Watch කරන්නයි ඔක්කොම Tools තියෙන්නේ)
FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app

# 2. .csproj ෆයිල් එක කොපි කරලා ලයිබ්‍රරි ටික දාගන්නවා
COPY *.csproj ./
RUN dotnet restore

# 3. ඉතිරි කෝඩ් ඔක්කොම කොපි කරනවා
COPY . .

# 4. Port එක විවෘත කරනවා (Container එක ඇතුළේ 8080)
EXPOSE 8080

# 5. මෙන්න මැජික් එක - කෝඩ් එක වෙනස් වෙද්දී ඔටෝ බිල්ඩ් වෙන විධානය
CMD ["dotnet", "watch", "run", "--urls", "http://+:8080"]