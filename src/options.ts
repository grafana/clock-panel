import { PanelOptionsEditorBuilder, dateTime, SelectableValue, StandardEditorContext, Field } from '@grafana/data';

import {
  ClockOptions,
  ClockMode,
  ClockType,
  FontWeight,
  ZoneFormat,
  ClockRefresh,
  ClockSource,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  DescriptionSource,
} from './types';
import { ColorEditor } from './ColorEditor';
import { getTemplateSrv } from '@grafana/runtime';
import { getTimeZoneNames } from 'utils';

export const optionsBuilder = (
  builder: PanelOptionsEditorBuilder<ClockOptions>,
  context: StandardEditorContext<ClockOptions>
) => {
  // Global options
  builder
    .addRadio({
      path: 'mode',
      name: 'Mode',
      settings: {
        options: [
          { value: ClockMode.time, label: 'Time' },
          { value: ClockMode.countdown, label: 'Countdown' },
          { value: ClockMode.countup, label: 'Countup' },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addRadio({
      path: 'refresh',
      name: 'Refresh',
      settings: {
        options: [
          { value: ClockRefresh.sec, label: 'Every second' },
          { value: ClockRefresh.dashboard, label: 'With the dashboard' },
        ],
      },
      defaultValue: ClockRefresh.sec,
    })
    .addCustomEditor({
      id: 'bgColor',
      path: 'bgColor',
      name: 'Background Color',
      editor: ColorEditor,
      defaultValue: '',
    })
    .addBooleanSwitch({
      path: 'fontMono',
      name: 'Font monospace',
      defaultValue: false,
    });

  addCountdown(builder);
  addCountup(builder);
  addDescription(builder);
  addTimeFormat(builder);
  addTimeZone(builder);
  addDateFormat(builder);
};

//---------------------------------------------------------------------
// COUNTDOWN
//---------------------------------------------------------------------
function addCountdown(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Countdown'];

  builder
    .addRadio({
      category,
      path: 'countdownSettings.source',
      name: 'Source',
      settings: {
        options: [
          { value: ClockSource.input, label: 'Input' },
          { value: ClockSource.query, label: 'Query' },
        ],
      },
      defaultValue: ClockSource.input,
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: 'End Time',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.input,
    })
    .addSelect({
      category,
      path: 'countdownSettings.queryCalculation',
      name: 'Calculation',
      description: 'How to calculate the countdown time',
      settings: {
        options: [
          {
            value: CountdownQueryCalculation.lastNotNull,
            label: 'Last *',
            description: 'Last non-null value (also excludes NaNs)',
          },
          { value: CountdownQueryCalculation.last, label: 'Last', description: 'Last value' },
          {
            value: CountdownQueryCalculation.firstNotNull,
            label: 'First *',
            description: 'First non-null value (also excludes NaNs)',
          },
          { value: CountdownQueryCalculation.first, label: 'First', description: 'First value' },
          { value: CountdownQueryCalculation.min, label: 'Min', description: 'Minimum value' },
          {
            value: CountdownQueryCalculation.minFuture,
            label: 'Min Future',
            description: 'Minimum value that is in the future',
          },
          { value: CountdownQueryCalculation.max, label: 'Max', description: 'Maximum value' },
        ],
      },
      defaultValue: CountdownQueryCalculation.last,
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query,
    })
    .addFieldNamePicker({
      category,
      path: 'countdownSettings.queryField',
      name: 'Field',
      settings: {
        noFieldsMessage: 'No fields found',
      },
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endText',
      name: 'End Text',
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.noValueText',
      name: 'No Value Text',
      defaultValue: 'no value',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.invalidValueText',
      name: 'Invalid Value Text',
      defaultValue: 'invalid value',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.customFormat',
      name: 'Custom format',
      settings: {
        placeholder: 'optional',
      },
      defaultValue: undefined,
      showIf: (o) => o.mode === ClockMode.countdown,
    });
}

//---------------------------------------------------------------------
// COUNTUP
//---------------------------------------------------------------------
function addCountup(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Countup'];

  builder
    .addRadio({
      category,
      path: 'countupSettings.source',
      name: 'Source',
      settings: {
        options: [
          { value: ClockSource.input, label: 'Input' },
          { value: ClockSource.query, label: 'Query' },
        ],
      },
      defaultValue: ClockSource.input,
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginCountupTime',
      name: 'Begin Time',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.input,
    })
    .addSelect({
      category,
      path: 'countupSettings.queryCalculation',
      name: 'Calculation',
      description: 'How to calculate the countup time',
      settings: {
        options: [
          {
            value: CountupQueryCalculation.lastNotNull,
            label: 'Last *',
            description: 'Last non-null value (also excludes NaNs)',
          },
          { value: CountupQueryCalculation.last, label: 'Last', description: 'Last value' },
          {
            value: CountupQueryCalculation.firstNotNull,
            label: 'First *',
            description: 'First non-null value (also excludes NaNs)',
          },
          { value: CountupQueryCalculation.first, label: 'First', description: 'First value' },
          { value: CountupQueryCalculation.min, label: 'Min', description: 'Minimum value' },
          { value: CountupQueryCalculation.max, label: 'Max', description: 'Maximum value' },
          {
            value: CountupQueryCalculation.maxPast,
            label: 'Max Past',
            description: 'Maximum value that is in the past',
          },
        ],
      },
      defaultValue: CountupQueryCalculation.last,
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.query,
    })
    .addFieldNamePicker({
      category,
      path: 'countupSettings.queryField',
      name: 'Field',
      settings: {
        noFieldsMessage: 'No fields found',
      },
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.query,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginText',
      name: 'Begin Text',
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.noValueText',
      name: 'No Value Text',
      defaultValue: 'no value',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.invalidValueText',
      name: 'Invalid Value Text',
      defaultValue: 'invalid value',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.customFormat',
      name: 'Custom format',
      settings: {
        placeholder: 'optional',
      },
      defaultValue: undefined,
      showIf: (o) => o.mode === ClockMode.countup,
    });
}

//---------------------------------------------------------------------
// DESCRIPTION
//---------------------------------------------------------------------
function addDescription(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Description'];

  builder
    .addRadio({
      category,
      path: 'descriptionSettings.source',
      name: 'Source',
      settings: {
        options: [
          { value: DescriptionSource.none, label: 'None' },
          { value: DescriptionSource.input, label: 'Input' },
        ],
      },
      defaultValue: DescriptionSource.none,
      showIf: (o) => {
        let show =
          (o.mode === ClockMode.countup && o.countupSettings.source !== ClockSource.query) ||
          (o.mode === ClockMode.countdown && o.countdownSettings.source !== ClockSource.query);

        if (show && o.descriptionSettings.source === DescriptionSource.query) {
          o.descriptionSettings.source = DescriptionSource.none;
        }

        return show;
      },
    })
    .addRadio({
      category,
      path: 'descriptionSettings.source',
      name: 'Source',
      settings: {
        options: [
          { value: DescriptionSource.none, label: 'None' },
          { value: DescriptionSource.input, label: 'Input' },
          { value: DescriptionSource.query, label: 'Query' },
        ],
      },
      defaultValue: DescriptionSource.none,
      showIf: (o) =>
        (o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.query) ||
        (o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query),
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.descriptionText',
      name: 'Description',
      settings: {
        placeholder: 'Enter description',
      },
      defaultValue: '',
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.input,
    })
    .addFieldNamePicker({
      category,
      path: 'descriptionSettings.queryField',
      name: 'Field',
      settings: {
        filter: (f: Field) => f.type === 'string',
        noFieldsMessage: 'No fields found',
      },
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.query,
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.noValueText',
      name: 'No Value Text',
      defaultValue: 'no value',
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.query,
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'Font size (e.g. 12px)',
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'descriptionSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    });
}

//---------------------------------------------------------------------
// TIME FORMAT
//---------------------------------------------------------------------
function addTimeFormat(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Time Format'];

  builder
    .addRadio({
      category,
      path: 'clockType',
      name: 'Clock Type',
      settings: {
        options: [
          { value: ClockType.H24, label: '24 Hour' },
          { value: ClockType.H12, label: '12 Hour' },
          { value: ClockType.Custom, label: 'Custom' },
        ],
      },
      defaultValue: ClockType.H24,
    })
    .addTextInput({
      category,
      path: 'timeSettings.customFormat',
      name: 'Time Format',
      description: 'the date formatting pattern',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: undefined,
      showIf: (opts) => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category,
      path: 'timeSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'Font size (e.g. 12px)',
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'timeSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    });
}

function getVariableOptions() {
  return getTemplateSrv()
    .getVariables()
    .map((t) => {
      const value = '${' + t.name + '}';
      const info: SelectableValue<string> = {
        label: value,
        value,
        icon: 'arrow-right',
      };
      return info;
    });
}

//---------------------------------------------------------------------
// TIMEZONE
//---------------------------------------------------------------------
function addTimeZone(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Timezone'];

  const timezones = [
    { label: 'Browser Time', value: '' },
    { label: 'Same as Dashboard', value: 'dashboard' },
    ...getTimeZoneNames().map((n) => {
      return { label: n, value: n };
    }),
  ];

  builder
    .addSelect({
      category,
      path: 'timezone',
      name: 'Timezone',
      settings: {
        options: timezones,
        getOptions: async () => {
          const opts = getVariableOptions();
          if (opts.length) {
            return [...opts, ...timezones];
          }
          return timezones;
        },
      },
      defaultValue: '',
    })
    .addBooleanSwitch({
      category,
      path: 'timezoneSettings.showTimezone',
      name: 'Show Timezone',
      defaultValue: false,
    })
    .addSelect({
      category,
      path: 'timezoneSettings.zoneFormat',
      name: 'Display Format',
      settings: {
        options: [
          { value: ZoneFormat.name, label: 'Normal' },
          { value: ZoneFormat.nameOffset, label: 'Name + Offset' },
          { value: ZoneFormat.offsetAbbv, label: 'Offset + Abbreviation' },
          { value: ZoneFormat.offset, label: 'Offset' },
          { value: ZoneFormat.abbv, label: 'Abbreviation' },
        ],
      },
      defaultValue: ZoneFormat.offsetAbbv,
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addTextInput({
      category,
      path: 'timezoneSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'font size',
      },
      defaultValue: '12px',
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addRadio({
      category,
      path: 'timezoneSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: (s) => s.timezoneSettings?.showTimezone,
    });
}

//---------------------------------------------------------------------
// DATE FORMAT
//---------------------------------------------------------------------
function addDateFormat(builder: PanelOptionsEditorBuilder<ClockOptions>) {
  const category = ['Date Options'];

  builder
    .addBooleanSwitch({
      category,
      path: 'dateSettings.showDate',
      name: 'Show Date',
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'dateSettings.dateFormat',
      name: 'Date Format',
      settings: {
        placeholder: 'Enter date format',
      },
      defaultValue: 'YYYY-MM-DD',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.locale',
      name: 'Locale',
      settings: {
        placeholder: 'Enter locale: de, fr, es, ... (default: en)',
      },
      defaultValue: '',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '20px',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addRadio({
      category,
      path: 'dateSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: (s) => s.dateSettings?.showDate,
    });
}
