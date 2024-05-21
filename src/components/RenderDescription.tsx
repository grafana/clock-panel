import { css } from '@emotion/css';
import React, { useMemo } from 'react';
import { ClockOptions } from 'types';

export function RenderDescription({ options, descriptionText }: { options: ClockOptions; descriptionText: string }) {
  const { descriptionSettings } = options;

  const className = useMemo(() => {
    return css`
      font-size: ${descriptionSettings.fontSize};
      font-weight: ${descriptionSettings.fontWeight};
      font-family: ${options.fontMono ? 'monospace' : ''};
      margin: 0;
    `;
  }, [descriptionSettings.fontSize, descriptionSettings.fontWeight, options.fontMono]);

  return (
    <span>
      <h3 className={className}>{descriptionText}</h3>
    </span>
  );
}
