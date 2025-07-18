# Use a Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript application
RUN npm run build

COPY proxy.txt ./build/

# Expose the application port
EXPOSE 5000

# Command to run the compiled application
CMD ["npm", "run", "serve"]
