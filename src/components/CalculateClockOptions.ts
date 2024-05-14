import { DataFrame, Field, PanelData, PanelProps } from '@grafana/data';
import moment, { Moment, MomentInput } from 'moment-timezone';
import {
  ClockMode,
  ClockOptions,
  ClockSource,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  DescriptionSource,
  QueryCalculation,
} from 'types';
import { getMoment } from 'utils';

type QueryRow = {
  time: Moment;
  description: string;
};

export function CalculateClockOptions({
  options,
  timezone,
  data,
  replaceVariables,
  now,
}: {
  options: ClockOptions;
  timezone: ClockOptions['timezone'];
  data: PanelData;
  replaceVariables: PanelProps['replaceVariables'];
  now: Moment;
}): [Moment, string, string | null] {
  let descriptionNoValueText = options.descriptionSettings.noValueText ?? '';
  let descriptionText =
    options.descriptionSettings.source === DescriptionSource.query
      ? descriptionNoValueText
      : options.descriptionSettings.descriptionText;
  if (options.mode !== ClockMode.countdown && options.mode !== ClockMode.countup) {
    return [now, descriptionText, null];
  }

  let userInputTime: string | undefined = '';
  let clockSettings: ClockOptions['countdownSettings'] | ClockOptions['countupSettings'];
  switch (options.mode) {
    case ClockMode.countdown:
      userInputTime = options.countdownSettings.endCountdownTime || '';
      clockSettings = options.countdownSettings;
      break;
    case ClockMode.countup:
      userInputTime = options.countupSettings.beginCountupTime || '';
      clockSettings = options.countupSettings;
      break;
  }

  let clockNoValueText = clockSettings.noValueText ?? '';
  let clockInvalidValueText = clockSettings.invalidValueText ?? '';
  let targetTime: Moment | undefined | null = undefined;
  switch (clockSettings.source) {
    case ClockSource.input:
      if (!userInputTime) {
        return [now, descriptionText, clockNoValueText];
      }
      targetTime = moment(replaceVariables(userInputTime)).utcOffset(getMoment(timezone).format('Z'), true);
      break;
    case ClockSource.query:
      const isDataReady = data.state === 'Done' && data.series.length !== 0;
      const isQueryFieldSelected = clockSettings.queryField && clockSettings.queryField.length !== 0;
      if (!isDataReady || !isQueryFieldSelected) {
        return [now, descriptionText, clockNoValueText];
      }

      let timeField: Field | undefined = data.series.reduce((foundField: Field | undefined, series: DataFrame) => {
        if (foundField) {
          return foundField;
        }
        return series.fields.find((field: Field) => field.name === clockSettings.queryField) ?? undefined;
      }, undefined);
      let descriptionField: Field | undefined = data.series.reduce(
        (foundField: Field | undefined, series: DataFrame) => {
          if (foundField) {
            return foundField;
          }
          return (
            series.fields.find((field: Field) => field.name === options.descriptionSettings.queryField) ?? undefined
          );
        },
        undefined
      );

      if (!timeField || !timeField.values || timeField.values.length === 0) {
        return [now, descriptionText, clockNoValueText];
      }

      let descriptionFieldValues = descriptionField?.values
        ? [...descriptionField?.values]
        : new Array(timeField.values.length);
      let fieldValues: Array<{ time: MomentInput; description: string }> = timeField.values.map((value, index) => {
        return { time: value, description: descriptionFieldValues[index] };
      });

      let values: QueryRow[] = fieldValues.reduce((acc: QueryRow[], row) => {
        if (row.time !== null && row.time !== undefined && !Number.isNaN(row.time)) {
          acc.push({ time: moment(row.time), description: row.description });
        }
        return acc;
      }, []);

      let sortedValues = (v: QueryRow[]): QueryRow[] => {
        return v.sort((a, b) => a.time.diff(b.time));
      };

      let finalValue:
        | {
            time: moment.Moment | null;
            description: string;
          }
        | undefined = undefined;
      switch (clockSettings.queryCalculation) {
        case QueryCalculation.lastNotNull:
          finalValue = values.length > 0 ? values.at(-1) : undefined;
          break;
        case QueryCalculation.last:
          finalValue =
            fieldValues.length > 0
              ? {
                  ...fieldValues[fieldValues.length - 1],
                  time: fieldValues[fieldValues.length - 1]?.time
                    ? moment(fieldValues[fieldValues.length - 1]?.time)
                    : null,
                }
              : undefined;
          break;
        case QueryCalculation.firstNotNull:
          finalValue = values.length > 0 ? values[0] : undefined;
          break;
        case QueryCalculation.first:
          finalValue =
            fieldValues.length > 0
              ? { ...fieldValues[0], time: fieldValues[0].time ? moment(fieldValues[0].time) : null }
              : undefined;
          break;
        case QueryCalculation.min:
          finalValue = values.length > 0 ? sortedValues(values)[0] : undefined;
          break;
        case CountdownQueryCalculation.minFuture:
          values = values.filter((v: QueryRow) => v.time.isAfter(now));
          finalValue = values.length > 0 ? sortedValues(values)[0] : undefined;
          break;
        case QueryCalculation.max:
          finalValue = values.length > 0 ? sortedValues(values).at(-1) : undefined;
          break;
        case CountupQueryCalculation.maxPast:
          values = values.filter((v: QueryRow) => v.time.isBefore(now));
          finalValue = values.length > 0 ? sortedValues(values).at(-1) : undefined;
          break;
        default:
          console.error('Invalid query calculation', clockSettings.queryCalculation);
          return [now, descriptionText, clockNoValueText];
      }

      targetTime = finalValue?.time;
      if (options.descriptionSettings.source === DescriptionSource.query) {
        descriptionText = finalValue?.description ?? descriptionNoValueText;
      }
      break;
  }

  if (targetTime === undefined) {
    return [now, descriptionText, clockNoValueText];
  }
  if (targetTime === null || !targetTime.isValid()) {
    return [now, descriptionText, clockInvalidValueText];
  }
  return [targetTime, descriptionText, null];
}
