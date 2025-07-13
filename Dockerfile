FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -D nodemon

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
