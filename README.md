# express-api-container

Docker Container for Express API Service

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fgurumojo%2Fexpress-api-container.svg?type=small)](https://app.fossa.io/projects/git%2Bgithub.com%2Fgurumojo%2Fexpress-api-container?ref=badge_small)


## About

This project is intended as the base layer in a Docker container collection.
Extending from this core service framework requires:

* creating a new service repository
* declaring a Dockerfile that builds from an image created by this package
* copying in any necessary filesystem changes (e.g. route definitions, db patches)
* starting up a container instance

In order to take full advantage of the union file system layers in the Docker
build cache, only the most minimal changes need to be copied over into the
container runtime by services extending from this framework. Provided out of
the box is a functional HTTP API, complete with a system for adding application
constants, environment configurations, automatic filesystem discovery and
import, safe JSON manipulation utilities, recursive object freezing, request
and response logging including redaction of sensitive data, container health
checks which poll the running system, database connection handling and patch
migrations, pubsub channel subscriptions for responding to system events other
than direct user agent requests, token based authentication, role based access
control, unit / functional / chaos test coverage, and a whole lot of love.

On startup a cluster of worker processes (one per cpu core by default) on a
round robin port (managed via IPC messaging) each spin up a server instance.
The number of workers the master process keeps alive is tunable via
`docker run ...  -e CPU_COUNT=<int> ...` command flags.

Chaos agents may be dispatched at random intervals to disrupt happy path
operations, tunable via runtime flags for max and min timeout as needed.
The initial implementation is rather simplistic, merely throwing an uncaught
exception within a given worker to show the master reacting by starting a new
worker process. Nevertheless, hooks into this class of testing are available
for development and help is welcome.  :)


## Usage

Precondition: both `postgres` and `redis` services need to be available to start
the HTTP API and pubsub event handlers. Providing connection details is fully
configurable via static JSON and dynamic environment variable input.

```bash

  docker build . --force-rm -t gurumojo/express-api-container

  docker run -d --rm -p 8001:8000 \
     --name awesome-api-001 gurumojo/express-api-container

  docker run -d --rm -p 8002:8000 \
     -e POSTGRES_HOST=172.17.0.2 -e REDIS_HOST=172.17.0.3 \
     -e CHAOS_TIMEOUT_MIN_MS=2000 -e CHAOS_TIMEOUT_MAX_MS=20000 \
     --name awesome-api-002 gurumojo/express-api-container

```

See `./lib/constant/index.js` for dynamic `runtimeConfig` options available.
Static configuration options are detailed in `./lib/constant/*.js`.
 


## Testing

```bash

  # To list available testing configurations:
  npx intern showConfigs

  # To print out active runtime configuration details:
  npx intern showConfig

  # To print out runtime configuration details per config:
  npx intern showConfig config=@dev

```


### Invoke a test run

```bash

  npx intern

```


### WebDriver speed boost

```bash

  npx intern coverage=

```

Or set `{coverage: false}` in `./intern.json` in addition to disabling browser
feature tests:

```javascript

  ...
  "environments": [
    {
      "browserName": "chrome",
      "fixSessionCapabilities": <false || "no-detect">,
  ...

```

