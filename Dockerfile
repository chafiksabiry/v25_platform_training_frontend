# Use a lightweight Node.js base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code and serve configuration
COPY . .

# Build argument for API URL (can be overridden at build time)
ARG VITE_API_BASE_URL=https://api-training.harx.ai

# Set environment variable for API URL (default for standalone deployment)
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_REGISTRATION_API_URL=https://api-registration.harx.ai/api
# Build the app with environment variables

RUN npm run build

# Install a lightweight HTTP server to serve the build
RUN npm install -g serve

# Expose the port for the HTTP server
EXPOSE 5190

# Command to serve the app with the correct path and configuration
CMD ["serve", "-s", "dist", "-l", "5190"]

