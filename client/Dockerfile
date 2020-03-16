FROM node:lts-alpine

WORKDIR '/app'

COPY package.json .
RUN npm install
RUN npm install -g serve

COPY . .
RUN npm run build --silent
CMD ["serve", "-s", "build"]