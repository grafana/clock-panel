import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';
import 'moment-timezone';
import _ from 'lodash';
import './css/clock-panel.css!';

const panelDefaults = {
  mode: 'time',
  timezone: moment.tz.guess(),
  bgColor: null,
  countdownSettings: {
    endCountdownTime: moment().seconds(0).milliseconds(0).add(1, 'day').toDate(),
    endText: '00:00:00'
  },
  dateSettings: {
    showDate: false,
    dateFormat: 'YYYY-MM-DD',
    fontSize: '20px',
    fontWeight: 'normal'
  },
  timeSettings: {
    showClock: true,
    clockType: '24 hour',
    customFormat: 'HH:mm:ss',
    fontSize: '60px',
    fontWeight: 'normal'
  },
  zoneSettings: {
    showZone: false,
    zoneFormat: 'offsetAbv',
    fontSize: '20px',
    fontWeight: 'normal'
  }
};

export class ClockCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);
    _.defaults(this.panel.timeSettings, panelDefaults.timeSettings);
    this.timezones = moment.tz.names();

    if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
      this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
    }

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));

    this.updateClock();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  updateClock() {
    if (this.panel.mode === 'time') {
      this.renderTime();
    } else {
      this.renderCountdown();
    }

    this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 1000);
  }

  renderTime() {
    let now;

    now = moment().tz(this.panel.timezone);

    this.date = now.format(this.panel.dateSettings.dateFormat);

    this.time = now.format(this.getTimeFormat());

    if (this.panel.zoneSettings.zoneFormat === 'name') {
      this.zone = now._z.name
    } else if (this.panel.zoneSettings.zoneFormat === 'offsetAbv') {
      this.zone = now.format('Z z');
    } else if (this.panel.zoneSettings.zoneFormat === 'offset') {
      this.zone = now.format('Z');
    } else if (this.panel.zoneSettings.zoneFormat === 'abv') {
      this.zone = now.format('z');
    }
  }

  getTimeFormat() {
    if (this.panel.timeSettings.clockType === '24 hour') {
      return 'HH:mm:ss';
    }

    if (this.panel.timeSettings.clockType === '12 hour') {
      return 'h:mm:ss A';
    }

    return this.panel.timeSettings.customFormat;
  }

  renderCountdown() {
    if (!this.panel.countdownSettings.endCountdownTime) {
      this.time = this.panel.countdownSettings.endText;
    }

    const now = moment();
    const timeLeft = moment.duration(moment(this.panel.countdownSettings.endCountdownTime).diff(now));
    let formattedTimeLeft = '';

    if (timeLeft.asSeconds() <= 0) {
      this.time = this.panel.countdownSettings.endText;
      return;
    }

    var previous = '';

    if (timeLeft.years() > 0) {
      formattedTimeLeft = timeLeft.years() === 1 ? '1 year, ' : timeLeft.years() + ' years, ';
      previous = 'years';
    }
    if (timeLeft.months() > 0 || previous === 'years') {
      formattedTimeLeft += timeLeft.months() === 1 ? '1 month, ' : timeLeft.months() + ' months, ';
      previous = 'month';
    }
    if (timeLeft.days() > 0 || previous === 'months') {
      formattedTimeLeft += timeLeft.days() === 1 ? '1 day, ' : timeLeft.days() + ' days, ';
      previous = 'days';
    }
    if (timeLeft.hours() > 0 || previous === 'days') {
      formattedTimeLeft += timeLeft.hours() === 1 ? '1 hour, ' : timeLeft.hours() + ' hours, ';
      previous = 'hours';
    }

    if (timeLeft.minutes() > 0 || previous === 'hours') {
      formattedTimeLeft += timeLeft.minutes() === 1 ? '1 minute, ' : timeLeft.minutes() + ' minutes, ';
    }

    formattedTimeLeft += timeLeft.seconds() === 1 ? '1 second ' : timeLeft.seconds() + ' seconds';
    this.time = formattedTimeLeft;
  }

  link(scope, elem) {
    this.events.on('render', () => {
      const $panelContainer = elem.find('.panel-container');

      if (this.panel.bgColor) {
        $panelContainer.css('background-color', this.panel.bgColor);
      } else {
        $panelContainer.css('background-color', '');
      }
    });
  }
}

ClockCtrl.templateUrl = 'module.html';
