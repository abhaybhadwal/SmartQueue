# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the backend code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Define environment variables (should be overridden by App Runner)
ENV NODE_ENV=production
ENV PORT=3001

# Command to run the application
CMD ["npm", "start"]
