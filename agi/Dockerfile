FROM node:6

RUN addgroup --gid 200 node && \
    adduser --system --home /home/node --uid 200 --gid 200 node && \
    mkdir -p /usr/src/app && \
    chown -R node:node /usr/src/app

USER node
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 4573

CMD [ "node", "server.js" ]
