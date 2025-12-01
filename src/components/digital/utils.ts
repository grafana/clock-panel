import { ClockOptions, DescriptionSource, Heights } from '../../types';
import { SVG_VIEW_BOX_WIDTH } from '../../constants';

export function getWidth(char: string, prevChar?: string): number {
  if (char.trim() === '') {
    return SVG_VIEW_BOX_WIDTH * 0.5;
  }

  if (char === ',' || char === '.' || char === ';') {
    return SVG_VIEW_BOX_WIDTH * 0.5;
  }

  if (prevChar === '-' && char === '1') {
    return SVG_VIEW_BOX_WIDTH * 0.5;
  }

  return SVG_VIEW_BOX_WIDTH;
}

export function getHeights(panelHeight: number, options: ClockOptions): Heights {
  const showDate = options?.dateSettings?.showDate || false;
  const showTimezone = options?.timezoneSettings?.showTimezone || false;
  const hasSource = Boolean(options?.descriptionSettings?.source);
  const showDescription = hasSource ? options?.descriptionSettings?.source !== DescriptionSource.none : false;

  const noOfShown = Number(showDate) + Number(showTimezone) + Number(showDescription);
  const timePercentage = noOfShown === 0 || panelHeight < 72 ? 1 : 0.5;
  const time = timePercentage * panelHeight;
  const heightWithoutTime = panelHeight - time;
  const distributedHeight = noOfShown === 0 ? 0 : heightWithoutTime / 3;

  const date = showDate ? distributedHeight : 0;
  const description = showDescription ? distributedHeight : 0;
  const zone = showTimezone ? distributedHeight : 0;

  return {
    date,
    description,
    time,
    zone,
  };
}
