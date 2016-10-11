FROM node:6

RUN addgroup --gid 200 node && \
    adduser --system --home /home/node --uid 200 --gid 200 node && \
    mkdir -p /usr/src/app && \
    chown -R node:node /usr/src/app && \
    wget -O /usr/local/bin/dumb-init \
      https://github.com/Yelp/dumb-init/releases/download/v1.1.3/dumb-init_1.1.3_amd64 && \
    chmod +x /usr/local/bin/dumb-init

USER node
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 4573

ENTRYPOINT [ "/usr/local/bin/dumb-init", "--"]
CMD [ "node", "server.js" ]
