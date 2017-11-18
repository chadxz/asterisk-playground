FROM nginx:1.13.6

ENV SWAGGER_UI_VERSION=2.2.6

RUN apt-get update -qq && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --no-install-recommends \
      tar \
      curl \
      python-pip \
      && \
    apt-get purge -y --auto-remove && \
    rm -rf /var/lib/apt/lists/*

RUN pip install setuptools wheel && \
    pip install pip j2cli --upgrade

RUN mkdir -p /run/nginx && \
    ln -sf /dev/stdout /var/log/nginx/access.log && \
	  ln -sf /dev/stderr /var/log/nginx/error.log

RUN mkdir -p /usr/src/swagger-ui && \
    cd /usr/src/swagger-ui && \
    curl -vsL https://github.com/swagger-api/swagger-ui/archive/v${SWAGGER_UI_VERSION}.tar.gz | \
      tar --strip-components 1 -xz && \
    cp nginx.conf /etc/nginx/ && \
    cp -rf dist/* /usr/share/nginx/html

ADD index.html.j2 /usr/share/nginx/html/
ADD swagger-ui-entrypoint.sh /

EXPOSE 8080

ENTRYPOINT ["./swagger-ui-entrypoint.sh"]
