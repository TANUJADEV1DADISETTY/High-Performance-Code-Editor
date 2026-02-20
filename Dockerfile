FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Install curl for healthcheck
RUN apk --no-cache add curl

CMD ["npm", "run", "dev"]
