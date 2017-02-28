## Clock Panel Plugin for Grafana

The Clock Panel can show the current time or a countdown and updates every second.

Show the time in another office or show a countdown to an important event.

### Options

- **Mode**:

  Default is time. If countdown is chosen then set the Countdown Deadline to start the countdown.

- **12 or 24 hour**:

  Show time in the 12/24 hour format.

- **Timezone**:

  This uses the moment-timezone module to provide suppoer for various zones and their offsets. Default is to guess what your local timezone is (whatever that is on your computer). -5 would be UTC -5 (New York or central US)

- **Countdown Deadline**:

  Used in conjuction with the mode being set to countdown. Choose a date and time to count down to.

- **Countdown End Text**:

  The text to show when the countdown ends. E.g. LIFTOFF

- **Date/Time formatting options**:

  The font size, weight and date/time formatting can be customized here. If the seconds ticking annoys you then change the time format to HH:mm for the 24 hour clock or h:mm A for the 12 hour clock.

- **Bg Color**:

  Choose a background color for the clock with the color picker.

### Screenshots

- [Screenshot of two clocks and a countdown](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clocks.png)
- [Screenshot of the options screen](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clock-options.png)

#### Upgrading from versions <= v0.0.8

Versions after v0.0.8 provide support for timezones based on tzdata information via [moment-timezone](http://momentjs.com/timezone/).  When upgrading, existing clocks will continue to use the previously provided information.  Upon editing, it is advised that you provide the correct timezone.  If this is left blank it will continue using previous values but you will be unable to edit the offsets.  If displaying zone information, selecting "Zone name" will have no affect on the display until you have defined a timezone.

#### Changelog

##### v0.0.8

- Remove extraneous comma when 1 second left in the countdown. PR from @linkslice
