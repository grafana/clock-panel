import React from 'react';
import { ClockOptions, ClockStyle } from 'types';
import { DigitalTime } from './digital/DigitalTime';
import { getHeights } from './digital/utils';
import { useClockStyles } from 'hooks/useClockStyles';

export function RenderDescription({
  options,
  descriptionText,
  width,
  height,
}: {
  options: ClockOptions;
  descriptionText: string;
  width: number;
  height: number;
}) {
  const { description } = useClockStyles(options);

  if (options.style === ClockStyle.digital) {
    return (
      <DigitalTime
        width={width}
        height={getHeights(height, options).description}
        options={options}
        text={descriptionText}
      />
    );
  }

  return (
    <span>
      <h3 className={description}>{descriptionText}</h3>
    </span>
  );
}
