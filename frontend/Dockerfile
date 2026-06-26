# Stage 1: Build compilation
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

# Build production compiled bundle
RUN npm run build

# Stage 2: Production runtime web server
FROM nginx:alpine

# Copy compiled assets from build container to nginx path
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
