FROM node:slim
EXPOSE 8000
LABEL gurumojo.environment=development gurumojo.service=example
HEALTHCHECK --interval=10s \
	--timeout=3s \
	--retries=3 \
	CMD curl -f http://localhost:8000/
WORKDIR /opt/gurumojo
COPY package.json yarn.lock /opt/gurumojo/
RUN npm install yarn && yarn \
	&& yarn cache clean \
	&& rm -rf node_modules/yarn
COPY . /opt/gurumojo/
USER node
CMD ["node", "service.js"]
