### Development

Using Docker:

1. Clone the repository and `cd` to it
1. Make sure you have [yarn](https://yarnpkg.com/) installed
1. Install project dependencies: `yarn install --pure-lockfile`
1. Start the "watch" task: `yarn watch`
1. Run a local Grafana instance with the development version of the plugin: `docker run -p 3000:3000 -d --name grafana-plugin-dev --env GF_AUTH_ANONYMOUS_ORG_ROLE="Admin" --env GF_AUTH_ANONYMOUS_ENABLED="true" --env GF_AUTH_BASIC_ENABLED="false" --env GF_DEFAULT_APP_MODE="development" --volume $(pwd)/dist:/var/lib/grafana/plugins/clock-panel grafana/grafana`
1. Check the logs to see that Grafana has started up: `docker logs -f grafana-plugin-dev`
1. Open Grafana at http://localhost:3000/
1. Log in with username "admin" and password "admin"
1. Create new dashboard and add the plugin

To build a production build with minification: `yarn build`
