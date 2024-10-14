# 1. Use an official Node.js runtime as the base image
FROM node:20

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# 4. Install dependencies
RUN npm ci

# 5. Copy the rest of the application code to the container
COPY . .

# 6. Compile TypeScript to JavaScript
RUN npm run build

# 7. Expose the port the app runs on
EXPOSE 3000

# 8. Set the command to run the app
CMD ["npm", "run", "start"]
