export interface ClockOptions {
  mode: ClockMode;
  refresh: ClockRefresh;
  clockType: ClockType;
  timezone?: string;
  bgColor?: string;
  fontMono?: boolean;
  countdownSettings: CountdownSettings;
  countupSettings: CountupSettings;
  descriptionSettings: DescriptionSettings;
  dateSettings: DateSettings;
  timeSettings: TimeSettings;
  timezoneSettings: TimezoneSettings;
}

export enum ClockSource {
  input = 'input',
  query = 'query',
}

export enum DescriptionSource {
  none = 'none',
  input = 'input',
  query = 'query',
}

export const QueryCalculation = {
  lastNotNull: 'lastNotNull',
  last: 'last',
  firstNotNull: 'firstNotNull',
  first: 'first',
  min: 'min',
  max: 'max',
};

export const CountdownQueryCalculation = {
  ...QueryCalculation,
  minFuture: 'minFuture',
} as const;
export type CountdownQueryCalculation = (typeof CountdownQueryCalculation)[keyof typeof CountdownQueryCalculation]; // eslint-disable-line no-redeclare

export const CountupQueryCalculation = {
  ...QueryCalculation,
  maxPast: 'maxPast',
} as const;
export type CountupQueryCalculation = (typeof CountupQueryCalculation)[keyof typeof CountupQueryCalculation]; // eslint-disable-line no-redeclare

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
  noValueText: string;
  invalidValueText: string;
  customFormat?: string;
}

interface CountupSettings {
  source: ClockSource;
  beginCountupTime: any;
  queryCalculation: CountupQueryCalculation;
  queryField: string;
  beginText: string;
  noValueText: string;
  invalidValueText: string;
  customFormat?: string;
}

interface DescriptionSettings {
  source: DescriptionSource;
  descriptionText: string;
  queryField: string;
  noValueText: string;
  fontSize: string;
  fontWeight: FontWeight;
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
