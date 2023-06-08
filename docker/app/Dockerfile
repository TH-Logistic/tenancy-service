FROM --platform=linux/amd64 node:18-alpine

WORKDIR /code

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

EXPOSE 3000

RUN npm run build
CMD [ "npm", "run", "start:prod" ]