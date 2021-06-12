# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:13-alpine as build
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json /home/node/app/

RUN npm install
COPY ./ /home/node/app/

RUN npm run build

FROM nginx:1.17-alpine
COPY --from=build /home/node/app/build /usr/share/nginx/html
COPY nginx/* /etc/nginx/
