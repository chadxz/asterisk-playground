#!/bin/sh
PROGNAME=$(basename $0)
set -e

if test -z ${SWAGGER_URL}; then
  echo "${PROGNAME}: SWAGGER_URL environment variable required" >&2
  exit 1
fi

if test -z ${ARI_USERNAME}; then
  echo "${PROGNAME}: ARI_USERNAME environment variable required" >&2
  exit 1
fi

if test -z ${ARI_PASSWORD}; then
  echo "${PROGNAME}: ARI_PASSWORD environment variable required" >&2
  exit 1
fi

j2 /usr/share/nginx/html/index.html.j2 > /usr/share/nginx/html/index.html
rm -f /usr/share/nginx/html/index.html.j2

set -x
exec "$@"
