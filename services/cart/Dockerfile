# 1. Base image
FROM node:18-alpine

# 2. Create app directory
WORKDIR /app

# 3. Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --production

# 4. Copy source
COPY src/ ./src/

# 5. Expose port & start
EXPOSE 3001
CMD ["npm", "start"]
