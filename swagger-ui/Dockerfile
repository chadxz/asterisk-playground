FROM alpine:3.4

ENV NGINX_VERSION=1.10.1-r1
ENV SWAGGER_UI_VERSION=2.2.6

RUN apk add --update nginx=${NGINX_VERSION} tar curl py-pip && \
    pip install pip j2cli --upgrade && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /run/nginx && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
	  ln -sf /dev/stderr /var/log/nginx/error.log

RUN mkdir -p /usr/src/swagger-ui && \
    cd /usr/src/swagger-ui && \
    curl -vsL https://github.com/swagger-api/swagger-ui/archive/v${SWAGGER_UI_VERSION}.tar.gz | \
      tar --strip-components 1 -xz && \
    cp nginx.conf /etc/nginx/ && \
    cp -rf dist/* /var/lib/nginx/html

ADD index.html.j2 /var/lib/nginx/html/
ADD swagger-ui-entrypoint.sh /

EXPOSE 8080

ENTRYPOINT ["./swagger-ui-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
