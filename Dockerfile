# Use the official Node.js 18 image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all app files into the container (except those in .dockerignore)
COPY . .

# Expose port 3000
EXPOSE 3000

# Default command to run when starting the container
CMD ["npm", "run", "dev"]
