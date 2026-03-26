FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Vite එකට host එක ඕනේ වෙනවා Docker ඇතුළේ දුවද්දී
CMD ["npm", "run", "dev", "--", "--host"]