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
      name: t('module.ClockOptions.mode.name', 'Mode'),
      settings: {
        options: [
          { value: ClockMode.time, label: t('module.ClockOptions.mode.options.time.label', 'Time') },
          { value: ClockMode.countdown, label: t('module.ClockOptions.mode.options.countdown.label', 'Countdown') },
          { value: ClockMode.countup, label: t('module.ClockOptions.mode.options.countup.label', 'Countup') },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addRadio({
      path: 'refresh',
      name: t('module.ClockOptions.refresh.name', 'Refresh'),
      settings: {
        options: [
          { value: ClockRefresh.sec, label: t('module.ClockOptions.refresh.options.sec.label', 'Every second') },
          {
            value: ClockRefresh.dashboard,
            label: t('module.ClockOptions.refresh.options.dashboard.label', 'With the dashboard'),
          },
        ],
      },
      defaultValue: ClockRefresh.sec,
    })
    .addCustomEditor({
      id: 'bgColor',
      path: 'bgColor',
      name: t('module.ClockOptions.bgColor.name', 'Background Color'),
      editor: ColorEditor,
      defaultValue: '',
    })
    .addBooleanSwitch({
      path: 'fontMono',
      name: t('module.ClockOptions.fontMono.name', 'Font monospace'),
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
      name: t('module.ClockOptions.source.name', 'Source'),
      settings: {
        options: [
          {
            value: ClockSource.input,
            label: t('module.ClockOptions.countdownSettings.source.options.input.label', 'Input'),
          },
          {
            value: ClockSource.query,
            label: t('module.ClockOptions.countdownSettings.source.options.query.label', 'Query'),
          },
        ],
      },
      defaultValue: ClockSource.input,
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: t('module.ClockOptions.countdownSettings.endCountdownTime.name', 'End Time'),
      settings: {
        placeholder: t(
          'module.ClockOptions.countdownSettings.endCountdownTime.placeholder',
          'ISO 8601 or RFC 2822 Date time'
        ),
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.input,
    })
    .addSelect({
      category,
      path: 'countdownSettings.queryCalculation',
      name: t('module.ClockOptions.countdownSettings.queryCalculation.name', 'Calculation'),
      description: t(
        'module.ClockOptions.countdownSettings.queryCalculation.description',
        'How to calculate the countdown time'
      ),
      settings: {
        options: [
          {
            value: CountdownQueryCalculation.lastNotNull,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.lastNotNull.label', 'Last *'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.lastNotNull.description',
              'Last non-null value (also excludes NaNs)'
            ),
          },
          {
            value: CountdownQueryCalculation.last,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.last.label', 'Last'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.last.description',
              'Last value'
            ),
          },
          {
            value: CountdownQueryCalculation.firstNotNull,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.firstNotNull.label', 'First *'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.firstNotNull.description',
              'First non-null value (also excludes NaNs)'
            ),
          },
          {
            value: CountdownQueryCalculation.first,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.first.label', 'First'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.first.description',
              'First value'
            ),
          },
          {
            value: CountdownQueryCalculation.min,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.min.label', 'Min'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.min.description',
              'Minimum value'
            ),
          },
          {
            value: CountdownQueryCalculation.minFuture,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.minFuture.label', 'Min Future'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.minFuture.description',
              'Minimum value that is in the future'
            ),
          },
          {
            value: CountdownQueryCalculation.max,
            label: t('module.ClockOptions.countdownSettings.queryCalculation.options.max.label', 'Max'),
            description: t(
              'module.ClockOptions.countdownSettings.queryCalculation.options.max.description',
              'Maximum value'
            ),
          },
        ],
      },
      defaultValue: CountdownQueryCalculation.last,
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query,
    })
    .addFieldNamePicker({
      category,
      path: 'countdownSettings.queryField',
      name: t('module.ClockOptions.countdownSettings.queryField.name', 'Field'),
      settings: {
        noFieldsMessage: t(
          'module.ClockOptions.countdownSettings.queryField.settings.noFieldsMessage',
          'No fields found'
        ),
      },
      showIf: (o) => o.mode === ClockMode.countdown && o.countdownSettings.source === ClockSource.query,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.endText',
      name: t('module.ClockOptions.countdownSettings.endText.name', 'End Text'),
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.noValueText',
      name: t('module.ClockOptions.countdownSettings.noValueText.name', 'No Value Text'),
      defaultValue: t('module.ClockOptions.countdownSettings.noValueText.defaultValue', 'no value found'),
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.invalidValueText',
      name: t('module.ClockOptions.countdownSettings.invalidValueText.name', 'Invalid Value Text'),
      defaultValue: t('module.ClockOptions.countdownSettings.invalidValueText.defaultValue', 'invalid value'),
      showIf: (o) => o.mode === ClockMode.countdown,
    })
    .addTextInput({
      category,
      path: 'countdownSettings.customFormat',
      name: t('module.ClockOptions.countdownSettings.customFormat.name', 'Custom format'),
      settings: {
        placeholder: t('module.ClockOptions.countdownSettings.customFormat.settings.placeholder', 'optional'),
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
      name: t('module.ClockOptions.countupSettings.source.name', 'Source'),
      settings: {
        options: [
          {
            value: ClockSource.input,
            label: t('module.ClockOptions.countupSettings.source.options.input.label', 'Input'),
          },
          {
            value: ClockSource.query,
            label: t('module.ClockOptions.countupSettings.source.options.query.label', 'Query'),
          },
        ],
      },
      defaultValue: ClockSource.input,
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginCountupTime',
      name: t('module.ClockOptions.countupSettings.beginCountupTime.name', 'Begin Time'),
      settings: {
        placeholder: t(
          'module.ClockOptions.countupSettings.beginCountupTime.placeholder',
          'ISO 8601 or RFC 2822 Date time'
        ),
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.input,
    })
    .addSelect({
      category,
      path: 'countupSettings.queryCalculation',
      name: t('module.ClockOptions.countupSettings.queryCalculation.name', 'Calculation'),
      description: t(
        'module.ClockOptions.countupSettings.queryCalculation.description',
        'How to calculate the countup time'
      ),
      settings: {
        options: [
          {
            value: CountupQueryCalculation.lastNotNull,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.lastNotNull.label', 'Last *'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.lastNotNull.description',
              'Last non-null value (also excludes NaNs)'
            ),
          },
          {
            value: CountupQueryCalculation.last,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.last.label', 'Last'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.last.description',
              'Last value'
            ),
          },
          {
            value: CountupQueryCalculation.firstNotNull,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.firstNotNull.label', 'First *'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.firstNotNull.description',
              'First non-null value (also excludes NaNs)'
            ),
          },
          {
            value: CountupQueryCalculation.first,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.first.label', 'First'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.first.description',
              'First value'
            ),
          },
          {
            value: CountupQueryCalculation.min,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.min.label', 'Min'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.min.description',
              'Minimum value'
            ),
          },
          {
            value: CountupQueryCalculation.max,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.max.label', 'Max'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.max.description',
              'Maximum value'
            ),
          },
          {
            value: CountupQueryCalculation.maxPast,
            label: t('module.ClockOptions.countupSettings.queryCalculation.options.maxPast.label', 'Max Past'),
            description: t(
              'module.ClockOptions.countupSettings.queryCalculation.options.maxPast.description',
              'Maximum value that is in the past'
            ),
          },
        ],
      },
      defaultValue: CountupQueryCalculation.last,
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.query,
    })
    .addFieldNamePicker({
      category,
      path: 'countupSettings.queryField',
      name: t('module.ClockOptions.countupSettings.queryField.name', 'Field'),
      settings: {
        noFieldsMessage: t(
          'module.ClockOptions.countupSettings.queryField.settings.noFieldsMessage',
          'No fields found'
        ),
      },
      showIf: (o) => o.mode === ClockMode.countup && o.countupSettings.source === ClockSource.query,
    })
    .addTextInput({
      category,
      path: 'countupSettings.beginText',
      name: t('module.ClockOptions.countupSettings.beginText.name', 'Begin Text'),
      defaultValue: '00:00:00',
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.noValueText',
      name: t('module.ClockOptions.countupSettings.noValueText.name', 'No Value Text'),
      defaultValue: t('module.ClockOptions.countupSettings.noValueText.defaultValue', 'no value found'),
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.invalidValueText',
      name: t('module.ClockOptions.countupSettings.invalidValueText.name', 'Invalid Value Text'),
      defaultValue: t('module.ClockOptions.countupSettings.invalidValueText.defaultValue', 'invalid value'),
      showIf: (o) => o.mode === ClockMode.countup,
    })
    .addTextInput({
      category,
      path: 'countupSettings.customFormat',
      name: t('module.ClockOptions.countupSettings.customFormat.name', 'Custom format'),
      settings: {
        placeholder: t('module.ClockOptions.countupSettings.customFormat.settings.placeholder', 'optional'),
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
      name: t('module.ClockOptions.descriptionSettings.source.name', 'Source'),
      settings: {
        options: [
          {
            value: DescriptionSource.none,
            label: t('module.ClockOptions.descriptionSettings.source.options.none.label', 'None'),
          },
          {
            value: DescriptionSource.input,
            label: t('module.ClockOptions.descriptionSettings.source.options.input.label', 'Input'),
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
      name: t('module.ClockOptions.descriptionSettings.source.name', 'Source'),
      settings: {
        options: [
          {
            value: DescriptionSource.none,
            label: t('module.ClockOptions.descriptionSettings.source.options.none.label', 'None'),
          },
          {
            value: DescriptionSource.input,
            label: t('module.ClockOptions.descriptionSettings.source.options.input.label', 'Input'),
          },
          {
            value: DescriptionSource.query,
            label: t('module.ClockOptions.descriptionSettings.source.options.query.label', 'Query'),
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
      name: t('module.ClockOptions.descriptionSettings.descriptionText.name', 'Description'),
      settings: {
        placeholder: t(
          'module.ClockOptions.descriptionSettings.descriptionText.settings.placeholder',
          'Enter description'
        ),
      },
      defaultValue: '',
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.input,
    })
    .addFieldNamePicker({
      category,
      path: 'descriptionSettings.queryField',
      name: t('module.ClockOptions.descriptionSettings.queryField.name', 'Field'),
      settings: {
        filter: (f: Field) => f.type === 'string',
        noFieldsMessage: t(
          'module.ClockOptions.descriptionSettings.queryField.settings.noFieldsMessage',
          'No fields found'
        ),
      },
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.query,
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.noValueText',
      name: t('module.ClockOptions.descriptionSettings.noValueText.name', 'No Value Text'),
      defaultValue: t('module.ClockOptions.descriptionSettings.noValueText.defaultValue', 'no description found'),
      showIf: (o) => o.descriptionSettings.source === DescriptionSource.query,
    })
    .addTextInput({
      category,
      path: 'descriptionSettings.fontSize',
      name: t('module.ClockOptions.descriptionSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t(
          'module.ClockOptions.descriptionSettings.fontSize.settings.placeholder',
          'Font size (e.g. 12px)'
        ),
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'descriptionSettings.fontWeight',
      name: t('module.ClockOptions.descriptionSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('module.ClockOptions.descriptionSettings.fontWeight.options.normal.label', 'Normal'),
          },
          {
            value: FontWeight.bold,
            label: t('module.ClockOptions.descriptionSettings.fontWeight.options.bold.label', 'Bold'),
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
      name: t('module.ClockOptions.clockType.name', 'Clock Type'),
      settings: {
        options: [
          { value: ClockType.H24, label: t('module.ClockOptions.clockType.options.h24.label', '24 Hour') },
          { value: ClockType.H12, label: t('module.ClockOptions.clockType.options.h12.label', '12 Hour') },
          { value: ClockType.Custom, label: t('module.ClockOptions.clockType.options.custom.label', 'Custom') },
        ],
      },
      defaultValue: ClockType.H24,
    })
    .addTextInput({
      category,
      path: 'timeSettings.customFormat',
      name: t('module.ClockOptions.timeSettings.customFormat.name', 'Time Format'),
      description: 'the date formatting pattern',
      settings: {
        placeholder: t('module.ClockOptions.timeSettings.customFormat.settings.placeholder', 'date format'),
      },
      defaultValue: undefined,
      showIf: (opts) => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category,
      path: 'timeSettings.fontSize',
      name: t('module.ClockOptions.timeSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t('module.ClockOptions.timeSettings.fontSize.settings.placeholder', 'Font size (e.g. 12px)'),
      },
      defaultValue: '12px',
    })
    .addRadio({
      category,
      path: 'timeSettings.fontWeight',
      name: t('module.ClockOptions.timeSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('module.ClockOptions.timeSettings.fontWeight.options.normal.label', 'Normal'),
          },
          {
            value: FontWeight.bold,
            label: t('module.ClockOptions.timeSettings.fontWeight.options.bold.label', 'Bold'),
          },
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
    { label: t('module.ClockOptions.timezoneSettings.options.browserTime.label', 'Browser Time'), value: '' },
    {
      label: t('module.ClockOptions.timezoneSettings.options.sameAsDashboard.label', 'Same as Dashboard'),
      value: 'dashboard',
    },
    ...getTimeZoneNames().map((n) => {
      return { label: n, value: n };
    }),
  ];

  builder
    .addSelect({
      category,
      path: 'timezone',
      name: t('module.ClockOptions.timezoneSettings.timezone.name', 'Timezone'),
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
      name: t('module.ClockOptions.timezoneSettings.showTimezone.name', 'Show Timezone'),
      defaultValue: false,
    })
    .addSelect({
      category,
      path: 'timezoneSettings.zoneFormat',
      name: t('module.ClockOptions.timezoneSettings.zoneFormat.name', 'Display Format'),
      settings: {
        options: [
          {
            value: ZoneFormat.name,
            label: t('module.ClockOptions.timezoneSettings.zoneFormat.options.name.label', 'Normal'),
          },
          {
            value: ZoneFormat.nameOffset,
            label: t('module.ClockOptions.timezoneSettings.zoneFormat.options.nameOffset.label', 'Name + Offset'),
          },
          {
            value: ZoneFormat.offsetAbbv,
            label: t(
              'module.ClockOptions.timezoneSettings.zoneFormat.options.offsetAbbv.label',
              'Offset + Abbreviation'
            ),
          },
          {
            value: ZoneFormat.offset,
            label: t('module.ClockOptions.timezoneSettings.zoneFormat.options.offset.label', 'Offset'),
          },
          {
            value: ZoneFormat.abbv,
            label: t('module.ClockOptions.timezoneSettings.zoneFormat.options.abbv.label', 'Abbreviation'),
          },
        ],
      },
      defaultValue: ZoneFormat.offsetAbbv,
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addTextInput({
      category,
      path: 'timezoneSettings.fontSize',
      name: t('module.ClockOptions.timezoneSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t('module.ClockOptions.timezoneSettings.fontSize.settings.placeholder', 'font size'),
      },
      defaultValue: '12px',
      showIf: (s) => s.timezoneSettings?.showTimezone,
    })
    .addRadio({
      category,
      path: 'timezoneSettings.fontWeight',
      name: t('module.ClockOptions.timezoneSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('module.ClockOptions.timezoneSettings.fontWeight.options.normal.label', 'Normal'),
          },
          {
            value: FontWeight.bold,
            label: t('module.ClockOptions.timezoneSettings.fontWeight.options.bold.label', 'Bold'),
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
      name: t('module.ClockOptions.dateSettings.showDate.name', 'Show Date'),
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'dateSettings.dateFormat',
      name: t('module.ClockOptions.dateSettings.dateFormat.name', 'Date Format'),
      settings: {
        placeholder: t('module.ClockOptions.dateSettings.dateFormat.settings.placeholder', 'Enter date format'),
      },
      defaultValue: 'YYYY-MM-DD',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.locale',
      name: t('module.ClockOptions.dateSettings.locale.name', 'Locale'),
      settings: {
        placeholder: t(
          'module.ClockOptions.dateSettings.locale.settings.placeholder',
          'Enter locale: de, fr, es, ... (default: en)'
        ),
      },
      defaultValue: '',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addTextInput({
      category,
      path: 'dateSettings.fontSize',
      name: t('module.ClockOptions.dateSettings.fontSize.name', 'Font size'),
      settings: {
        placeholder: t('module.ClockOptions.dateSettings.fontSize.settings.placeholder', 'date format'),
      },
      defaultValue: '20px',
      showIf: (s) => s.dateSettings?.showDate,
    })
    .addRadio({
      category,
      path: 'dateSettings.fontWeight',
      name: t('module.ClockOptions.dateSettings.fontWeight.name', 'Font weight'),
      settings: {
        options: [
          {
            value: FontWeight.normal,
            label: t('module.ClockOptions.dateSettings.fontWeight.options.normal.label', 'Normal'),
          },
          {
            value: FontWeight.bold,
            label: t('module.ClockOptions.dateSettings.fontWeight.options.bold.label', 'Bold'),
          },
        ],
      },
      defaultValue: FontWeight.normal,
      showIf: (s) => s.dateSettings?.showDate,
    });
}
