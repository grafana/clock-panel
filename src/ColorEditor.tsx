import React from 'react';
import { ColorPicker, Input, Icon, stylesFactory } from '@grafana/ui';
import { css } from '@emotion/css';
import { config } from '@grafana/runtime';
import { GrafanaTheme } from '@grafana/data';
import { t } from '@grafana/i18n';

export function ColorEditor(props: any) {
  const styles = getStyles(config.theme);
  const defaultValue = t('colorEditor.defaultValue', 'Pick Color');
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
      <Input type="text" value={props.value || defaultValue} prefix={prefix} suffix={suffix} readOnly={true} />
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
