## Clock Panel Plugin for Grafana

The Clock Panel can show the current time or a countdown and updates every second.

Show the time in another office or show a countdown to an important event.

### Plugin options

#### Options

- **Mode**:

  Default is time. If countdown is chosen then set the Countdown Deadline to start the countdown.

- **12 or 24 hour**:

  Show time in the 12/24 hour format.

- **Offset from UTC**:

  This is a simple way to get the time for different time zones. Default is empty and that means local time (whatever that is on your computer). -5 would be UTC -5 (New York or central US)

- **Countdown Deadline**:

  Used in conjuction with the mode being set to countdown. Choose a date and time to count down to.

- **Countdown End Text**:

  The text to show when the countdown ends. E.g. LIFTOFF

- **Date/Time formatting options**:

  The font size, weight and date/time formatting can be customized here. If the seconds ticking annoys you then change the time format to HH:mm for the 24 hour clock or h:mm A for the 12 hour clock, or see the [full list of formatting options](https://momentjs.com/docs/#/displaying/).

- **Bg Color**:

  Choose a background color for the clock with the color picker.

#### Refresh
  
- **Sync**:

  The clock is paused and only updated when the dashboard refreshes - the clock will show the timestamp for the last refresh.

### Screenshots

- [Screenshot of two clocks and a countdown](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clocks.png)
- [Screenshot of the options screen](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clock-options.png)

### Development

Using Docker:

1. Clone the repository and `cd` to it
1. The build steps work with either [yarn]( https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
1. install project dependencies: `yarn install --pure-lockfile` || `npm ci`
1. Start the "watch" task: `yarn watch` || `npm run-script watch`
1. Run a local Grafana instance with the development version of the plugin: `docker run -p 3000:3000 -d --name grafana-plugin-dev --volume $(pwd)/dist:/var/lib/grafana/plugins/clock-panel grafana/grafana`
1. Check the logs to see that Grafana has started up: `docker logs -f grafana-plugin-dev`
1. Open Grafana at http://localhost:3000/
1. Log in with username "admin" and password "admin"
1. Create new dashboard and add the plugin

To build a production build with minification: `yarn build` || `npm run-script build`

#### Changelog

##### v1.0.1

- Updates Lodash dependency to fix security warning

##### v1.0.0

- Dashboard sync/refresh feature - can show timestamp for last dashboard refresh.
- Tech - converted to TypeScript and Webpack.

##### v0.0.9

- Fixes bug with default properties not getting deep cloned [#20](https://github.com/grafana/clock-panel/issues/20)

##### v0.0.8

- Remove extraneous comma when 1 second left in the countdown. PR from @linkslice
