# Node.js alap (könnyű verzió)
FROM node:20-alpine

# Munkamappa beállítása a konténeren belül
WORKDIR /app

# Függőségek másolása és telepítése
COPY package*.json ./
RUN npm install

# A teljes forráskód másolása
COPY . .

# Port megnyitása
EXPOSE 5000

# Indítás
CMD ["node", "server.js"]