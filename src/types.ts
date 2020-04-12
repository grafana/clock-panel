// eslint-disable-next-line
import moment from 'moment';

export interface ClockOptions {
  mode: ClockMode;
  clockType: ClockType;
  timezone?: string;
  bgColor?: string;
  countdownSettings: CountdownSettings;
  dateSettings: DateSettings;
  timeSettings: TimeSettings;
  timezoneSettings: TimezoneSettings;
  refreshSettings: RefreshSettings;
}

export enum ClockMode {
  time = 'time',
  countdown = 'countdown',
}

export enum ClockType {
  H24 = '24 hour',
  H12 = '12 hour',
  Custom = 'custom',
}

export enum ZoneFormat {
  name = 'name',
  nameOffset = 'nameOffset',
  offsetAbbv = 'offsetAbbv',
  offset = 'offset',
  abbv = 'abbv',
}

export enum FontWeight {
  normal = 'normal',
  bold = 'bold',
}

interface CountdownSettings {
  endCountdownTime: any;
  endText: string;
  customFormat?: string;
}

interface DateSettings {
  showDate: boolean;
  dateFormat: string;
  fontSize: string;
  fontWeight: FontWeight;
}

interface TimeSettings {
  customFormat?: string;
  fontSize: string;
  fontWeight: FontWeight;
}

interface TimezoneSettings {
  showTimezone: boolean;
  zoneFormat: ZoneFormat;
  fontSize: string;
  fontWeight: FontWeight;
}

interface RefreshSettings {
  syncWithDashboard: boolean;
}

export const defaults: ClockOptions = {
  mode: ClockMode.time,
  clockType: ClockType.H24,
  timezone: undefined,
  bgColor: undefined,
  countdownSettings: {
    endCountdownTime: moment()
      .seconds(0)
      .milliseconds(0)
      .add(1, 'day')
      .toDate(),
    endText: '00:00:00',
    customFormat: undefined,
  },
  dateSettings: {
    showDate: false,
    dateFormat: 'YYYY-MM-DD',
    fontSize: '20px',
    fontWeight: FontWeight.normal,
  },
  timeSettings: {
    customFormat: 'HH:mm:ss',
    fontSize: '60px',
    fontWeight: FontWeight.normal,
  },
  timezoneSettings: {
    showTimezone: false,
    zoneFormat: ZoneFormat.offsetAbbv,
    fontSize: '12px',
    fontWeight: FontWeight.normal,
  },
  refreshSettings: {
    syncWithDashboard: false,
  },
};
