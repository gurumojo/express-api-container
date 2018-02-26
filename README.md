# express-api-container

Docker Container for Express API Service



## About

This project is intended as the base layer in a Docker container collection.
Extending from this core service framework requires:

* declaring a Dockerfile that builds from an image created by this package
* copying in any necessary filesystem changes (e.g. route definitions, db patches)
* starting up a container instance

In order to take full advantage of the union file system layers in the Docker
build cache, only the most minimal changes need to be copied over into the
container runtime by services extending from this framework. Provided out of
the box is a functional HTTP API, complete with a system for adding application
constants, environment configurations, automatic filesystem discovery and
import, safe JSON manipulation utilities, recursive object freezing, request
and response logging including redaction of sensitive data, container
healthchecks which poll the running system, database connection handling and
patch migrations, pubsub channel subscriptions for responding to system events
other than direct user agent requests, token based authentication, role based
access control, unit and functional test coverage, and a whole lot of love.



## Usage

Precondition: both Postgres and Redis services need to be available to start
this Express API with pubsub handlers. Providing connection details is fully
configurable via static JSON and dynamic environment variable input.

> docker build . --force-rm -t gurumojo/express-api-container

> docker run -d --rm -p 8000:8000 \
	-e POSTGRES_HOST=172.17.0.2 -e REDIS_HOST=172.17.0.3 \
	--name awesome-api-001 gurumojo/express-api-container

See `./library/constant/index.js` for dynamic `runtimeConfig` options available.
Static configuration options are detailed in `./library/constant/*.js`.
 


## Testing

To list available testing configurations:

> npx intern showConfigs


To print out active runtime configuration details:

> npx intern showConfig


To print out runtime configuration details per config:

> npx intern showConfig config=@dev


### Invoke a test run

> npx intern


### WebDriver speed boost

> npx intern coverage=

Or set `{coverage: false}` in `./intern.json` in addition to disabling browser
feature tests:
`...
  "environments": [
    {
      "browserName": "chrome",
      "fixSessionCapabilities": <false || "no-detect">,
 ...
`
