export interface ClockOptions {
  mode: ClockMode;
  refresh: ClockRefresh;
  clockType: ClockType;
  timezone?: string;
  bgColor?: string;
  fontMono?: boolean;
  countdownSettings: CountdownSettings;
  countupSettings: CountupSettings;
  dateSettings: DateSettings;
  timeSettings: TimeSettings;
  timezoneSettings: TimezoneSettings;
}

export enum ClockSource {
  input = 'input',
  query = 'query',
}

export enum CountdownQueryCalculation {
  lastNotNull = 'lastNotNull',
  last = 'last',
  firstNotNull = 'firstNotNull',
  first = 'first',
  min = 'min',
  minFuture = 'minFuture',
  max = 'max',
}

export enum CountupQueryCalculation {
  first = 'first',
  firstNotNull = 'firstNotNull',
  last = 'last',
  lastNotNull = 'lastNotNull',
  min = 'min',
  max = 'max',
  maxPast = 'maxPast',
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
  source: ClockSource;
  endCountdownTime: any;
  queryCalculation: CountdownQueryCalculation;
  queryField: string;
  endText: string;
  customFormat?: string;
}

interface CountupSettings {
  source: ClockSource;
  beginCountupTime: any;
  queryCalculation: CountupQueryCalculation;
  queryField: string;
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

export interface TimeSettings {
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
