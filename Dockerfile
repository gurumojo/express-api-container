FROM node:slim
EXPOSE 80
LABEL gurumojo.environment=development gurumojo.service=example
HEALTHCHECK --interval=10s \
	--timeout=3s \
	--retries=3 \
	CMD curl -f http://localhost:80/
WORKDIR /opt/gurumojo
COPY install.sh package.json yarn.lock /opt/gurumojo/
ADD library /opt/gurumojo/library
RUN /opt/gurumojo/install.sh
COPY . /opt/gurumojo/
USER node
CMD ["node", "service.js"]
