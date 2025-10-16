import React from 'react';
import { ColorPicker, Input, Icon } from '@grafana/ui';
import { css } from '@emotion/css';
import { config } from '@grafana/runtime';
import { GrafanaTheme2 } from '@grafana/data';

export function ColorEditor(props: any) {
  const styles = getStyles(config.theme2);
  let prefix: React.ReactNode = null;
  let suffix: React.ReactNode = null;
  if (props.value) {
    suffix = <Icon className={styles.trashIcon} name="trash-alt" onClick={() => props.onChange(undefined)} />;
  }

  prefix = (
    <div className={styles.inputPrefix}>
      <div className={styles.colorPicker}>
        <ColorPicker
          color={props.value || config.theme2.colors.primary}
          onChange={props.onChange}
          enableNamedColors={true}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Input type="text" value={props.value || 'Pick Color'} prefix={prefix} suffix={suffix} readOnly={true} />
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
