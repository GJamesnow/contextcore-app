FROM node:18-alpine

WORKDIR /app

# Install dependencies first (Caching layer)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 3001

# Start using the script defined in package.json
CMD ["npm", "start"]