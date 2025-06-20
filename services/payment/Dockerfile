# 1. Use a lightweight Node image
FROM node:18-alpine

# 2. Create app directory
WORKDIR /app

# 3. Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --production

# 4. Copy the source code
COPY src/ ./src/

# 5. Expose the port and start
EXPOSE 3004
CMD ["npm", "start"]
