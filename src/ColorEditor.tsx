import React from 'react';
import { ColorPicker, Input, Icon, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { config } from '@grafana/runtime';
import { t } from '@grafana/i18n';
import { GrafanaTheme2 } from '@grafana/data';

export function ColorEditor(props: any) {
  const styles = useStyles2(getStyles);
  let prefix: React.ReactNode = null;
  let suffix: React.ReactNode = null;
  const value = props.value || t('ColorEditor.input.value.placeholder', 'Pick Color');
  if (props.value) {
    suffix = <Icon className={styles.trashIcon} name="trash-alt" onClick={() => props.onChange(undefined)} />;
  }

  prefix = (
    <div className={styles.inputPrefix}>
      <div className={styles.colorPicker}>
        <ColorPicker
          color={props.value || config.theme2.colors.background.primary}
          onChange={props.onChange}
          enableNamedColors={true}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Input type="text" value={value} prefix={prefix} suffix={suffix} readOnly={true} />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    colorPicker: css`
      padding: 0 ${theme.spacing(1)};
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    trashIcon: css`
      color: ${theme.colors.text.secondary};
      cursor: pointer;
      &:hover {
        color: ${theme.colors.text};
      }
    `,
  };
};
