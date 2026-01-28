# Stage 1: Build the Angular application
FROM node:16-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build-prod

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy built artifacts from the build stage
COPY --from=build /app/dist/form-pay-fibex /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
