# Use lighter Node LTS base image
FROM node:20-alpine

# Set environment
ENV NODE_ENV=production

# App working directory
WORKDIR /usr/src/app

# Install dependency catalogs
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy backend codebase
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
