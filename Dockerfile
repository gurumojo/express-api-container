FROM node:slim

LABEL gurumojo.service=express-api

EXPOSE 8000

COPY healthcheck.sh /usr/local/bin/container-healthcheck
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
	CMD ["container-healthcheck"]

WORKDIR /opt/gurumojo
COPY install.sh package.json yarn.lock /opt/gurumojo/
ADD library /opt/gurumojo/library
RUN /opt/gurumojo/install.sh
COPY . /opt/gurumojo/

USER node
CMD ["node", "service.js"]
