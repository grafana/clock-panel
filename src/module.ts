import { PanelPlugin } from '@grafana/data';

import { ClockPanel } from './ClockPanel';
import { ClockOptions, ClockMode, ClockType, defaults, FontWeight, ZoneFormat } from './types';

export const plugin = new PanelPlugin<ClockOptions>(ClockPanel).setDefaults(defaults).setPanelOptions(builder => {
  builder
    .addRadio({
      path: 'mode',
      name: 'Mode',
      settings: {
        options: [
          { value: ClockMode.time, label: 'Time' },
          { value: ClockMode.countdown, label: 'Countdown' },
        ],
      },
      defaultValue: ClockMode.time,
    })
    .addColorPicker({
      path: 'bgColor',
      name: 'Background Color',
    })

    //---------------------------------------------------------------------
    // COUNTDOWN
    //---------------------------------------------------------------------
    .addTextInput({
      category: ['Countdown'],
      path: 'countdownSettings.endCountdownTime',
      name: 'End Time',
      settings: {
        placeholder: 'todo....',
      },
      defaultValue: 'TODO',
      showIf: o => o.mode === ClockMode.countdown,
    })

    .addTextInput({
      category: ['Countdown'],
      path: 'countdownSettings.endText',
      name: 'End Text',
      settings: {
        placeholder: 'todo....',
      },
      defaultValue: '00:00:00',
      showIf: o => o.mode === ClockMode.countdown,
    })

    .addTextInput({
      category: ['Countdown'],
      path: 'countdownSettings.customFormat',
      name: 'Custom format',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: undefined,
      showIf: o => o.mode === ClockMode.countdown,
    })

    //---------------------------------------------------------------------
    // TIME FORMAT
    //---------------------------------------------------------------------
    .addRadio({
      category: ['Time Format'],
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
      category: ['Time Format'],
      path: 'timeSettings.customFormat',
      name: 'Time Format',
      description: 'the date formatting pattern',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: undefined,
      showIf: opts => opts.clockType === ClockType.Custom,
    })
    .addTextInput({
      category: ['Time Format'],
      path: 'timeSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '12px',
    })
    .addRadio({
      category: ['Time Format'],
      path: 'timeSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    })
    
    //---------------------------------------------------------------------
    // TIMEZONE
    //---------------------------------------------------------------------
    .addTextInput({
      category: ['Timezone'],
      path: 'timezone',
      name: 'Timezone',
      settings: {
        placeholder: '(TODO... should be picker!)',
      },
      defaultValue: undefined,
    })
    .addBooleanSwitch({
      category: ['Timezone'],
      path: 'timezoneSettings.showTimezone',
      name: 'Show Timezone',
      defaultValue: false,
    })
    .addSelect({
      category: ['Timezone'],
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
    })
    .addTextInput({
      category: ['Timezone'],
      path: 'timezoneSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '12px',
    })
    .addRadio({
      category: ['Timezone'],
      path: 'timezoneSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    })

    //---------------------------------------------------------------------
    // DATE FORMAT
    //---------------------------------------------------------------------
    .addBooleanSwitch({
      category: ['Date Options'],
      path: 'dateSettings.showDate',
      name: 'Show Date',
      defaultValue: false,
    })
    .addTextInput({
      category: ['Date Options'],
      path: 'dateSettings.dateFormat',
      name: 'Date Format',
      settings: {
        placeholder: '(TODO... should be picker!)',
      },
      defaultValue: 'YYYY-MM-DD',
    })
    .addTextInput({
      category: ['Date Options'],
      path: 'dateSettings.fontSize',
      name: 'Font size',
      settings: {
        placeholder: 'date format',
      },
      defaultValue: '20px',
    })
    .addRadio({
      category: ['Date Options'],
      path: 'dateSettings.fontWeight',
      name: 'Font weight',
      settings: {
        options: [
          { value: FontWeight.normal, label: 'Normal' },
          { value: FontWeight.bold, label: 'Bold' },
        ],
      },
      defaultValue: FontWeight.normal,
    });
});
