FROM node:latest

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]