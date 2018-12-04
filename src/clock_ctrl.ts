import { PanelCtrl } from 'grafana/app/plugins/sdk';
import moment from 'moment';
import './external/moment-duration-format';
import _ from 'lodash';
import './css/clock-panel.css';

export class ClockCtrl extends PanelCtrl {
  static templateUrl = 'partials/module.html';

  panelDefaults = {
    mode: 'time',
    clockType: '24 hour',
    offsetFromUtc: null,
    offsetFromUtcMinutes: null,
    bgColor: null,
    countdownSettings: {
      endCountdownTime: moment()
        .seconds(0)
        .milliseconds(0)
        .add(1, 'day')
        .toDate(),
      endText: '00:00:00',
      customFormat: null,
    },
    dateSettings: {
      showDate: false,
      dateFormat: 'YYYY-MM-DD',
      fontSize: '20px',
      fontWeight: 'normal',
    },
    timeSettings: {
      customFormat: 'HH:mm:ss',
      fontSize: '60px',
      fontWeight: 'normal',
    },
    refreshSettings: {
      syncWithDashboard: false,
    },
  };
  nextTickPromise: any;
  date: string;
  time: string;

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, this.panelDefaults);

    if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
      this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
    }

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));
    this.events.on('component-did-mount', this.render.bind(this));
    this.events.on('refresh', this.updateClock.bind(this));
    this.events.on('render', this.updateClock.bind(this));

    this.updateClock();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/grafana-clock-panel/partials/options.html', 2);
    this.addEditorTab('Refresh', 'public/plugins/grafana-clock-panel/partials/refresh.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  updateClock() {
    this.$timeout.cancel(this.nextTickPromise);
    if (this.panel.mode === 'time') {
      this.renderTime();
    } else {
      this.renderCountdown();
    }

    if (!this.panel.refreshSettings.syncWithDashboard) {
      this.nextTickPromise = this.$timeout(this.updateClock.bind(this), 1000);
    }
  }

  renderTime() {
    let now;

    if (this.panel.offsetFromUtc && this.panel.offsetFromUtcMinutes) {
      const offsetInMinutes =
        parseInt(this.panel.offsetFromUtc, 10) * 60 + parseInt(this.panel.offsetFromUtcMinutes, 10);
      now = moment().utcOffset(offsetInMinutes);
    } else if (this.panel.offsetFromUtc && !this.panel.offsetFromUtcMinutes) {
      now = moment().utcOffset(parseInt(this.panel.offsetFromUtc, 10));
    } else {
      now = moment();
    }

    if (this.panel.dateSettings.showDate) {
      this.date = now.format(this.panel.dateSettings.dateFormat);
    }

    this.time = now.format(this.getTimeFormat());
  }

  getTimeFormat() {
    if (this.panel.clockType === '24 hour') {
      return 'HH:mm:ss';
    }

    if (this.panel.clockType === '12 hour') {
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

    if (this.panel.countdownSettings.customFormat === 'auto') {
      this.time = (timeLeft as any).format();
      return;
    }

    if (this.panel.countdownSettings.customFormat) {
      this.time = (timeLeft as any).format(this.panel.countdownSettings.customFormat);
      return;
    }

    let previous = '';

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
