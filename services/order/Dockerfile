FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY src/ ./src/

EXPOSE 3003
CMD ["npm", "start"]
