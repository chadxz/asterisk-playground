FROM debian:stretch
MAINTAINER Chad McElligott <chad.mcelligott@gmail.com>

RUN useradd --system asterisk

RUN apt-get update -qq && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --no-install-recommends \
            autoconf \
            build-essential \
            ca-certificates \
            curl \
            libcurl4-openssl-dev \
            libedit-dev \
            libgsm1-dev \
            libjansson-dev \
            libogg-dev \
            libsqlite3-dev \
            libsrtp0-dev \
            libspeex-dev \
            libspeexdsp-dev \
            libssl-dev \
            libxml2-dev \
            libxslt1-dev \
            uuid \
            uuid-dev \
            binutils-dev \
            libpopt-dev \
            libspandsp-dev \
            libvorbis-dev \
            libresample1-dev \
            portaudio19-dev \
            xmlstarlet \
            vim \
            && \
    apt-get purge -y --auto-remove && rm -rf /var/lib/apt/lists/*

ENV ASTERISK_VERSION=15.3.0
COPY build-asterisk.sh /build-asterisk
RUN /build-asterisk && rm -f /build-asterisk
COPY conf/ /etc/asterisk/
CMD ["/usr/sbin/asterisk", "-f"]
