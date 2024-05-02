import { Field, PanelData, PanelProps } from '@grafana/data';
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

export function getTime({
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
}): [Moment, string, string | undefined] {
  let descriptionNoValueText = options.descriptionSettings.noValueText ?? '';
  let description =
    options.descriptionSettings.source === DescriptionSource.query
      ? descriptionNoValueText
      : options.descriptionSettings.description;
  if (options.mode !== ClockMode.countdown && options.mode !== ClockMode.countup) {
    return [now, description, undefined];
  }

  let input: string | undefined = '';
  let clockSettings: ClockOptions['countdownSettings'] | ClockOptions['countupSettings'];
  switch (options.mode) {
    case ClockMode.countdown:
      input = options.countdownSettings.endCountdownTime || '';
      clockSettings = options.countdownSettings;
      break;
    case ClockMode.countup:
      input = options.countupSettings.beginCountupTime || '';
      clockSettings = options.countupSettings;
      break;
  }

  let clockNoValueText = clockSettings.noValueText ?? '';
  let clockInvalidValueText = clockSettings.invalidValueText ?? '';
  let time: Moment | undefined = undefined;
  switch (clockSettings.source) {
    case ClockSource.input:
      if (!input) {
        return [now, description, clockNoValueText];
      }
      time = moment(replaceVariables(input)).utcOffset(getMoment(timezone).format('Z'), true);
      break;
    case ClockSource.query:
      if (
        (data.state !== 'Done' || data.series.length === 0,
        !clockSettings.queryField ||
          clockSettings.queryField.length === 0 ||
          !data.series ||
          !data.series[0].fields ||
          data.series[0].fields.length === 0)
      ) {
        return [now, description, clockNoValueText];
      }
      let clockField: Field | undefined =
        data.series[0].fields.find((field: Field) => field.name === clockSettings.queryField) ?? undefined;

      let descriptionField: Field | undefined =
        data.series[0].fields.find((field: Field) => field.name === options.descriptionSettings.queryField) ??
        undefined;

      if (!clockField || !clockField.values || clockField.values.length === 0) {
        return [now, description, clockNoValueText];
      }

      let descriptionFieldValues = descriptionField?.values ?? new Array(clockField.values.length);
      let fieldValues: Array<{ time: MomentInput; description: string }> = clockField.values.map((value, index) => {
        return { time: value, description: descriptionFieldValues[index] };
      });

      let values: Array<{ time: Moment; description: string }> = fieldValues
        .filter((v) => v.time !== null && v.time !== undefined && !Number.isNaN(v.time))
        .map((v) => {
          return { time: moment(v.time), description: v.description };
        });

      let sort_values = (
        v: Array<{ time: Moment; description: string }>
      ): Array<{ time: Moment; description: string }> => {
        return v.sort((a, b) => a.time.diff(b.time));
      };

      let _value: { time: Moment; description: string } | undefined = undefined;
      switch (clockSettings.queryCalculation) {
        case QueryCalculation.lastNotNull:
          _value = values.length > 0 ? values.at(-1) : undefined;
          break;
        case QueryCalculation.last:
          _value =
            fieldValues.length > 0
              ? { ...fieldValues[fieldValues.length - 1], time: moment(fieldValues[fieldValues.length - 1]?.time) }
              : undefined;
          break;
        case QueryCalculation.firstNotNull:
          _value = values.length > 0 ? values[0] : undefined;
          break;
        case QueryCalculation.first:
          _value = fieldValues.length > 0 ? { ...fieldValues[0], time: moment(fieldValues[0].time) } : undefined;
          break;
        case QueryCalculation.min:
          _value = values.length > 0 ? sort_values(values)[0] : undefined;
          break;
        case CountdownQueryCalculation.minFuture:
          values = values.filter((v: { time: Moment; description: string }) => v.time.isAfter(now));
          _value = values.length > 0 ? sort_values(values)[0] : undefined;
          break;
        case QueryCalculation.max:
          _value = values.length > 0 ? sort_values(values).at(-1) : undefined;
          break;
        case CountupQueryCalculation.maxPast:
          values = values.filter((v: { time: Moment; description: string }) => v.time.isBefore(now));
          _value = values.length > 0 ? sort_values(values).at(-1) : undefined;
          break;
        default:
          console.error('Invalid query calculation', clockSettings.queryCalculation);
          return [now, description, clockNoValueText];
      }

      time = _value?.time;
      if (options.descriptionSettings.source === DescriptionSource.query) {
        description = _value?.description ?? descriptionNoValueText;
      }
      break;
  }

  if (!time) {
    return [now, description, clockNoValueText];
  }
  if (!time.isValid()) {
    return [now, description, clockInvalidValueText];
  }

  return [time, description, undefined];
}
