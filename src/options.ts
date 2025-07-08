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
import { t } from '@grafana/i18n';

export const optionsBuilder = (
  builder: PanelOptionsEditorBuilder<ClockOptions>,
  context: StandardEditorContext<ClockOptions>
) => {
  // Global options
  builder
    .addRadio({
      path: 'mode',
      name: t('options.optionsBuilder.mode.name', 'Mode'),
      settings: {
        options: [
          { value: ClockMode.time, label: t('options.optionsBuilder.mode.options.time', 'Time') },
          { value: ClockMode.countdown, label: t('options.optionsBuilder.mode.options.countdown', 'Countdown') },
          { value: ClockMode.countup, label: t('options.optionsBuilder.mode.options.countup', 'Countup') },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addRadio({
      path: 'refresh',
      name: t('options.optionsBuilder.refresh.name', 'Refresh'),
      settings: {
        options: [
          { value: ClockRefresh.sec, label: t('options.optionsBuilder.refresh.options.sec', 'Every second') },
          {
            value: ClockRefresh.dashboard,
            label: t('options.optionsBuilder.refresh.options.dashboard', 'With the dashboard'),
          },
        ],
      },
      defaultValue: ClockRefresh.sec,
    })
    .addCustomEditor({
      id: 'bgColor',
      path: 'bgColor',
      name: t('options.optionsBuilder.bgColor.name', 'Background Color'),
      editor: ColorEditor,
      defaultValue: '',
    })
    .addBooleanSwitch({
      path: 'fontMono',
      name: t('options.optionsBuilder.fontMono.name', 'Font monospace'),
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
      name: t('options.optionsBuilder.countdownSettings.source.name', 'Source'),
      settings: {
        options: [
          {
            value: ClockSource.input,
            label: t('options.optionsBuilder.countdownSettings.source.options.input', 'Input'),
          },
          {
            value: ClockSource.query,
            label: t('options.optionsBuilder.countdownSettings.source.options.query', 'Query'),
          },
        ],
      },
      defaultValue: ClockSource.input,
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: t('options.optionsBuilder.countdownSettings.endCountdownTime.name', 'End Time'),
      settings: {
        placeholder: t(
          'options.optionsBuilder.countdownSettings.endCountdownTime.settings.placeholder',
          'ISO 8601 or RFC 2822 Date time'
        ),
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.input,
    })
    .addSelect({
      category,
      path: 'countdownSettings.queryCalculation',
      name: t('options.optionsBuilder.countdownSettings.queryCalculation.name', 'Calculation'),
      description: 'How to calculate the countdown time',
      settings: {
        options: [
          {
            value: CountdownQueryCalculation.lastNotNull,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.lastNotNull', 'Last *'),
            description: 'Last non-null value (also excludes NaNs)',
          },
          {
            value: CountdownQueryCalculation.last,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.last', 'Last'),
            description: 'Last value',
          },
          {
            value: CountdownQueryCalculation.firstNotNull,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.firstNotNull', 'First *'),
            description: 'First non-null value (also excludes NaNs)',
          },
          {
            value: CountdownQueryCalculation.first,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.first', 'First'),
            description: 'First value',
          },
          {
            value: CountdownQueryCalculation.min,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.min', 'Min'),
            description: 'Minimum value',
          },
          {
            value: CountdownQueryCalculation.minFuture,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.minFuture', 'Min Future'),
            description: 'Minimum value that is in the future',
          },
          {
            value: CountdownQueryCalculation.max,
            label: t('options.optionsBuilder.countdownSettings.queryCalculation.options.max', 'Max'),
            description: 'Maximum value',
          },
        ],
      },
      defaultValue: CountdownQueryCalculation.last,
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query,
    })
    .addFieldNamePicker({
      category,
      path: 'countdownSettings.queryField',
      name: t('options.optionsBuilder.countdownSettings.queryField.name', 'Field'),
      settings: {
        noFieldsMessage: 'No fields found',
      },
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endText',
      name: t('options.optionsBuilder.countdownSettings.endText.name', 'End Text'),
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.noValueText',
      name: t('options.optionsBuilder.countdownSettings.noValueText.name', 'No Value Text'),
      defaultValue: 'no value found',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.invalidValueText',
      name: t('options.optionsBuilder.countdownSettings.invalidValueText.name', 'Invalid Value Text'),
      defaultValue: 'invalid value',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.customFormat',
      name: t('options.optionsBuilder.countdownSettings.customFormat.name', 'Custom format'),
      settings: {
        placeholder: t('options.optionsBuilder.countdownSettings.customFormat.settings.placeholder', 'optional'),
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
      name: t('options.optionsBuilder.countupSettings.source.name', 'Source'),
      settings: {
        options: [
          {
            value: ClockSource.input,
            label: t('options.optionsBuilder.countupSettings.source.options.input', 'Input'),
          },
          {
            value: ClockSource.query,
            label: t('options.optionsBuilder.countupSettings.source.options.query', 'Query'),
          },
        ],
      },
      defaultValue: ClockSource.input,
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginCountupTime',
      name: t('options.optionsBuilder.countupSettings.beginCountupTime.name', 'Begin Time'),
      settings: {
        placeholder: t(
          'options.optionsBuilder.countupSettings.beginCountupTime.settings.placeholder',
          'ISO 8601 or RFC 2822 Date time'
        ),
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.input,
    })
    .addSelect({
      category,
      path: 'countupSettings.queryCalculation',
      name: t('options.optionsBuilder.countupSettings.queryCalculation.name', 'Calculation'),
      description: 'How to calculate the countup time',
      settings: {
        options: [
          {
            value: CountupQueryCalculation.lastNotNull,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.lastNotNull', 'Last *'),
            description: 'Last non-null value (also excludes NaNs)',
          },
          {
            value: CountupQueryCalculation.last,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.last', 'Last'),
            description: 'Last value',
          },
          {
            value: CountupQueryCalculation.firstNotNull,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.firstNotNull', 'First *'),
            description: 'First non-null value (also excludes NaNs)',
          },
          {
            value: CountupQueryCalculation.first,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.first', 'First'),
            description: 'First value',
          },
          {
            value: CountupQueryCalculation.min,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.min', 'Min'),
            description: 'Minimum value',
          },
          {
            value: CountupQueryCalculation.max,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.max', 'Max'),
            description: 'Maximum value',
          },
          {
            value: CountupQueryCalculation.maxPast,
            label: t('options.optionsBuilder.countupSettings.queryCalculation.options.maxPast', 'Max Past'),
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
      name: t('options.optionsBuilder.countupSettings.queryField.name', 'Field'),
      settings: {
        noFieldsMessage: 'No fields found',
      },
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.query,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginText',
      name: t('options.optionsBuilder.countupSettings.beginText.name', 'Begin Text'),
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.noValueText',
      name: t('options.optionsBuilder.countupSettings.noValueText.name', 'No Value Text'),
      defaultValue: 'no value found',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.invalidValueText',
      name: t('options.optionsBuilder.countupSettings.invalidValueText.name', 'Invalid Value Text'),
      defaultValue: 'invalid value',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.customFormat',
      name: t('options.optionsBuilder.countupSettings.customFormat.name', 'Custom format'),
      settings: {
        placeholder: t('options.optionsBuilder.countupSettings.customFormat.settings.placeholder', 'optional'),
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
      name: t('options.optionsBuilder.descriptionSettings.source.first.name', 'Source'),
      settings: {
        options: [
          {
            value: DescriptionSource.none,
            label: t('options.optionsBuilder.descriptionSettings.source.options.none', 'None'),
          },
          {
            value: DescriptionSource.input,
            label: t('options.optionsBuilder.descriptionSettings.source.options.input', 'Input'),
          },
        ],
      },
      defaultValue: DescriptionSource.none,
      showIf: (o) => {
        let show =
          (o.mode === ClockMode.countup && o.countupSettings.source !== ClockSource.query) ||
          (o.mode === ClockMode.countdown && o.countdownSettings.source !== ClockSource.query) ||
          o.mode === ClockMode.time;

        if (show && o.descriptionSettings.source === DescriptionSource.query) {
          o.descriptionSettings.source = DescriptionSource.none;
        }

        return show;
      },
    })
    .addRadio({
      category,
      path: 'descriptionSettings.source',
      name: t('options.optionsBuilder.descriptionSettings.source.second.name', 'Source'),
      settings: {
        options: [
          {
            value: DescriptionSource.none,
            label: t('options.optionsBuilder.descriptionSettings.source.options.none', 'None'),
          },
          {
            value: DescriptionSource.input,
            label: t('options.optionsBuilder.descriptionSettings.source.options.input', 'Input'),
          },
          {
            value: DescriptionSource.query,
            label: t('options.optionsBuilder.descriptionSettings.source.options.query', 'Query'),
          },
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
      name: t('options.optionsBuilder.descriptionSettings.descriptionText.name', 'Description'),
      settings: {
        placeholder: t(
          'options.optionsBuilder.descriptionSettings.descriptionText.settings.placeholder',
          'Enter description'
        ),
      },
      defaultValue: '',
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.input,
    })
    .addFieldNamePicker({
      category,
      path: 'descriptionSettings.queryField',
      name: t('options.optionsBuilder.descriptionSettings.queryField.name', 'Field'),
      settings: {
        filter: (f: Field) => f.type === 'string',
        noFieldsMessage: 'No fields found',
      },
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.query,
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.noValueText',
      name: t('options.optionsBuilder.descriptionSettings.noValueText.name', 'No Value Text'),
      defaultValue: 'no description found',
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.query,
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.fontSize',
      name: t('options.optionsBuilder.descriptionSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t(
          'options.optionsBuilder.descriptionSettings.fontSize.settings.placeholder',
          'Font size (e.g. 12px)'
        ),
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'descriptionSettings.fontWeight',
      name: t('options.optionsBuilder.descriptionSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('options.optionsBuilder.descriptionSettings.fontWeight.options.normal', 'Normal'),
          },
          {
            value: FontWeight.bold,
            label: t('options.optionsBuilder.descriptionSettings.fontWeight.options.bold', 'Bold'),
          },
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
      name: t('options.optionsBuilder.clockType.name', 'Clock Type'),
      settings: {
        options: [
          { value: ClockType.H24, label: t('options.optionsBuilder.clockType.options.H24', '24 Hour') },
          { value: ClockType.H12, label: t('options.optionsBuilder.clockType.options.H12', '12 Hour') },
          { value: ClockType.Custom, label: t('options.optionsBuilder.clockType.options.Custom', 'Custom') },
        ],
      },
      defaultValue: ClockType.H24,
    })
    .addTextInput({
      category,
      path: 'timeSettings.customFormat',
      name: t('options.optionsBuilder.timeSettings.customFormat.name', 'Time Format'),
      description: 'the date formatting pattern',
      settings: {
        placeholder: t('options.optionsBuilder.timeSettings.customFormat.settings.placeholder', 'date format'),
      },
      defaultValue: undefined,
      showIf: (opts) => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category,
      path: 'timeSettings.fontSize',
      name: t('options.optionsBuilder.timeSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t('options.optionsBuilder.timeSettings.fontSize.settings.placeholder', 'Font size (e.g. 12px)'),
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'timeSettings.fontWeight',
      name: t('options.optionsBuilder.timeSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('options.optionsBuilder.timeSettings.fontWeight.options.normal', 'Normal'),
          },
          { value: FontWeight.bold, label: t('options.optionsBuilder.timeSettings.fontWeight.options.bold', 'Bold') },
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
    { label: t('options.optionsBuilder.timezone.options.browser', 'Browser Time'), value: '' },
    { label: t('options.optionsBuilder.timezone.options.dashboard', 'Same as Dashboard'), value: 'dashboard' },
    ...getTimeZoneNames().map((n) => {
      return { label: n, value: n };
    }),
  ];

  builder
    .addSelect({
      category,
      path: 'timezone',
      name: t('options.optionsBuilder.timezone.name', 'Timezone'),
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
      name: t('options.optionsBuilder.timezoneSettings.showTimezone.name', 'Show Timezone'),
      defaultValue: false,
    })
    .addSelect({
      category,
      path: 'timezoneSettings.zoneFormat',
      name: t('options.optionsBuilder.timezoneSettings.zoneFormat.name', 'Display Format'),
      settings: {
        options: [
          {
            value: ZoneFormat.name,
            label: t('options.optionsBuilder.timezoneSettings.zoneFormat.options.name', 'Normal'),
          },
          {
            value: ZoneFormat.nameOffset,
            label: t('options.optionsBuilder.timezoneSettings.zoneFormat.options.nameOffset', 'Name + Offset'),
          },
          {
            value: ZoneFormat.offsetAbbv,
            label: t('options.optionsBuilder.timezoneSettings.zoneFormat.options.offsetAbbv', 'Offset + Abbreviation'),
          },
          {
            value: ZoneFormat.offset,
            label: t('options.optionsBuilder.timezoneSettings.zoneFormat.options.offset', 'Offset'),
          },
          {
            value: ZoneFormat.abbv,
            label: t('options.optionsBuilder.timezoneSettings.zoneFormat.options.abbv', 'Abbreviation'),
          },
        ],
      },
      defaultValue: ZoneFormat.offsetAbbv,
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addTextInput({
      category,
      path: 'timezoneSettings.fontSize',
      name: t('options.optionsBuilder.timezoneSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t('options.optionsBuilder.timezoneSettings.fontSize.settings.placeholder', 'font size'),
      },
      defaultValue: '12px',
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addRadio({
      category,
      path: 'timezoneSettings.fontWeight',
      name: t('options.optionsBuilder.timezoneSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('options.optionsBuilder.timezoneSettings.fontWeight.options.normal', 'Normal'),
          },
          {
            value: FontWeight.bold,
            label: t('options.optionsBuilder.timezoneSettings.fontWeight.options.bold', 'Bold'),
          },
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
      name: t('options.optionsBuilder.dateSettings.showDate.name', 'Show Date'),
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'dateSettings.dateFormat',
      name: t('options.optionsBuilder.dateSettings.dateFormat.name', 'Date Format'),
      settings: {
        placeholder: t('options.optionsBuilder.dateSettings.dateFormat.settings.placeholder', 'Enter date format'),
      },
      defaultValue: 'YYYY-MM-DD',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.locale',
      name: t('options.optionsBuilder.dateSettings.locale.name', 'Locale'),
      settings: {
        placeholder: t(
          'options.optionsBuilder.dateSettings.locale.settings.placeholder',
          'Enter locale: de, fr, es, ... (default: en)'
        ),
      },
      defaultValue: '',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.fontSize',
      name: t('options.optionsBuilder.dateSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t('options.optionsBuilder.dateSettings.fontSize.settings.placeholder', 'date format'),
      },
      defaultValue: '20px',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addRadio({
      category,
      path: 'dateSettings.fontWeight',
      name: t('options.optionsBuilder.dateSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('options.optionsBuilder.dateSettings.fontWeight.options.normal', 'Normal'),
          },
          { value: FontWeight.bold, label: t('options.optionsBuilder.dateSettings.fontWeight.options.bold', 'Bold') },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: (s) => s.dateSettings?.showDate,
    });
}
