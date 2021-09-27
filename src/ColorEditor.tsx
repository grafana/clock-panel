import React from 'react';
import { ColorPicker, Input, Icon, stylesFactory } from '@grafana/ui';
import { css } from 'emotion';
import { config } from '@grafana/runtime';
import { GrafanaTheme } from '@grafana/data';

export function ColorEditor(props: any) {
  const styles = getStyles(config.theme);
  let prefix: React.ReactNode = null;
  let suffix: React.ReactNode = null;
  if (props.value) {
    suffix = <Icon className={styles.trashIcon} name="trash-alt" onClick={() => props.onChange(undefined)} />;
  }

  prefix = (
    <div className={styles.inputPrefix}>
      <div className={styles.colorPicker}>
        <ColorPicker
          color={props.value || config.theme.colors.panelBg}
          onChange={props.onChange}
          enableNamedColors={true}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Input
        css=""
        type="text"
        value={props.value || 'Pick Color'}
        onBlur={(v: any) => {
          console.log('CLICK');
        }}
        prefix={prefix}
        suffix={suffix}
      />
    </div>
  );
}

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    colorPicker: css`
      padding: 0 ${theme.spacing.sm};
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    trashIcon: css`
      color: ${theme.colors.textWeak};
      cursor: pointer;
      &:hover {
        color: ${theme.colors.text};
      }
    `,
  };
});
