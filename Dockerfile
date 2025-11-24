FROM node:18

WORKDIR /var/www/auth

COPY package*.json ./

RUN npm install

RUN npm install -g npm@10.7.0 nodemon dotenv dotenv-cli

COPY . .

EXPOSE 9343

CMD ["npm", "start"]
