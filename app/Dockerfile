FROM node:26.12.1

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

CMD ["node", "app.js"]

EXPOSE 3000