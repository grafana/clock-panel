import { PanelOptionsEditorBuilder, dateTime, SelectableValue } from '@grafana/data';

import { ClockOptions, ClockMode, ClockType, FontWeight, ZoneFormat, ClockRefresh } from './types';
import { getTimeZoneNames } from './ClockPanel';
import { ColorEditor } from './ColorEditor';
import { getTemplateSrv } from '@grafana/runtime';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<ClockOptions>) => {
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
    });

  addCountdown(builder);
  addCountup(builder);
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
    .addTextInput({
      category,
      path: 'countdownSettings.endCountdownTime',
      name: 'End Time',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countdown,
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
    .addTextInput({
      category,
      path: 'countupSettings.beginCountupTime',
      name: 'Begin Time',
      settings: {
        placeholder: 'ISO 8601 or RFC 2822 Date time',
      },
      defaultValue: dateTime(Date.now()).add(6, 'h').format(),
      showIf: (o) => o.mode === ClockMode.countup,
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
        placeholder: 'date format',
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

  const timezones = getTimeZoneNames().map((n) => {
    return { label: n, value: n };
  });
  timezones.unshift({ label: 'Default', value: '' });

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
          { value: ZoneFormat.abbv, label: 'Abbriviation' },
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
