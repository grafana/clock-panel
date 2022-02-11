export interface ClockOptions {
  mode: ClockMode;
  refresh: ClockRefresh;
  clockType: ClockType;
  timezone?: string;
  bgColor?: string;
  countdownSettings: CountdownSettings;
  countupSettings: CountupSettings;
  dateSettings: DateSettings;
  timeSettings: TimeSettings;
  timezoneSettings: TimezoneSettings;
}

export enum ClockMode {
  time = 'time',
  countdown = 'countdown',
  countup = 'countup',
}

export enum ClockRefresh {
  sec = 'sec',
  dashboard = 'dashboard',
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

interface CountupSettings {
  beginCountupTime: any;
  beginText: string;
  customFormat?: string;
}

interface DateSettings {
  showDate: boolean;
  dateFormat: string;
  locale: string;
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
