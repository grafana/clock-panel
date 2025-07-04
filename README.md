## Clock Panel Plugin for Grafana

The Clock Panel can show the current time or a countdown/countup and updates every second.

Show the time in another office or show a countdown/countup to an important event.

### Plugin options

#### Options

- **Mode**:

  Default is time.
  If countdown is chosen then set the End Time to start the countdown.
  If countup is chosen then set the Begin Time to start the countup.

- **Clock Type**:

  Choose between 24 Hour, 12 Hour, or Custom format for time display.

- **Timezone**:

  These timezones are supplied by the moment timezone library. Timezone can be set or left to default. Default is moment's guess (whatever that is on your computer). Timezone is also used to calculate countdown deadline in countdown mode.

- **Locale**:

  Locales for date-formatting are supplied by the moment library. The locale can be set or left to default. Default is moment's guess.

- **End Time** (Countdown mode):

  Used in conjunction with the mode being set to countdown. Choose a date and time to count down to.

  This field also supports dashboard (constant) variables (e.g. `${countdown_target}`) to dynamically set the countdown deadline for the Dashboard.

- **End Text** (Countdown mode):

  The text to show when the countdown ends. E.g. LIFTOFF

- **Begin Time** (Countup mode):

  Used in conjunction with the mode being set to countup. Choose a date and time to count up from.

- **Begin Text** (Countup mode):

  The text to show before the countup starts. E.g. LIFTOFF

- **Date/Time formatting options**:

  The font size, weight and date/time formatting can be customized here. If the seconds ticking annoys you then change the time format to HH:mm for the 24 hour clock or h:mm A for the 12 hour clock, or see the [full list of formatting options](https://momentjs.com/docs/#/displaying/).

- **Font Monospace**:

  Enable monospace font for consistent character width and alignment.

- **Description Settings**:

  Configure descriptive text to display alongside the time:
  - **Source**: Choose None, Input (manual text), or Query (from datasource)
  - **Description Text**: Manual text input when using Input source
  - **Font Size/Weight**: Customize description text appearance

- **Date Display Options**:

  Control date display alongside the time:
  - **Show Date**: Toggle date visibility
  - **Date Format**: Customize date formatting using moment.js patterns
  - **Locale**: Set locale for date formatting
  - **Font Size/Weight**: Customize date text appearance

- **Timezone Display Options**:

  Control timezone display:
  - **Show Timezone**: Toggle timezone visibility
  - **Display Format**: Choose between Normal, Name + Offset, Offset + Abbreviation, Offset, or Abbreviation
  - **Font Size/Weight**: Customize timezone text appearance

- **Query Configuration** (for Countdown/Countup modes):

  When using datasource queries for target times:
  - **Calculation Method**: Choose how to select datetime from multiple query results:
    - **Countdown**: Last, Last*, First, First*, Min, Max, Min Future (*excludes null/NaN values)
    - **Countup**: Last, Last*, First, First*, Min, Max, Max Past (*excludes null/NaN values)
  - **Field Selection**: Specify which field contains datetime values
  - **Error Handling**: Configure "No Value Text" and "Invalid Value Text" for query errors

- **Background Color**:

  Choose a background color for the clock with the color picker.

#### Refresh

- **Refresh**:

  Choose between "Every second" (default) or "With the dashboard". When set to "With the dashboard", the clock is paused and only updated when the dashboard refreshes - the clock will show the timestamp for the last refresh.

### Screenshots

- [Screenshot of two clocks and a countdown](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clocks.png)
- [Screenshot of the options screen](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clock-options.png)

### Queries Support

The clock panel supports using queries to dynamically set countdown/countup target times and descriptions.

#### Query Data Sources

In **Countdown** and **Countup** modes, instead of manually entering target times, you can:

1. **Select a datasource** to query datetime values
2. **Choose a field** containing datetime values from the query results
3. **Pick a calculation method** to determine which datetime to use from multiple results

#### Description from Query

You can also use query results for the description text:
- **Select a field** containing string values from the query results
- The description will correspond to the same row as the selected datetime

#### Example Use Cases

- **System maintenance**: Query maintenance schedules, show countdown to next maintenance window
- **Event tracking**: Query event times, display countdown with event names
- **Uptime monitoring**: Query service start times, show elapsed uptime
- **SLA monitoring**: Query deadline dates, track time remaining

#### Troubleshooting Query Errors

If you see a **red triangle error** in the top-left corner of the panel, it's likely because:

- You selected a datasource but aren't actually using queries for your clock configuration
- The selected datasource has an empty or invalid query that produces an error

**Solution**: If you're not using queries, select a datasource that won't generate errors:
- Choose **"Grafana"** or **"TestData"** datasource
- These datasources will never produce query errors even when not actively used 
