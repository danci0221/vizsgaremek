# 1. fázis: Buildelés (Node.js segítségével)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. fázis: Kiszolgálás (Nginx webszerverrel)
FROM nginx:alpine

# A 'dist' mappa tartalmát átmásoljuk az Nginx-nek
COPY --from=build /app/dist /usr/share/nginx/html

# --- EZT A SORT ADTAM HOZZÁ: ---
# Bemásoljuk a saját nginx konfigurációnkat, ami kezeli a React routingot (admin 404 hiba ellen)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# -----------------------------

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]