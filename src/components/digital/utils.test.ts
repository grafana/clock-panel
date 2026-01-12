import { ClockOptions, DescriptionSource } from 'types';
import { getFragmentKey, getHeights, getWidth } from './utils';

describe('getWidth', () => {
  it.each([
    { char: '', prevChar: undefined, expected: 83.5 },
    { char: ' ', prevChar: undefined, expected: 83.5 },
    { char: ',', prevChar: undefined, expected: 83.5 },
    { char: '.', prevChar: undefined, expected: 83.5 },
    { char: ';', prevChar: undefined, expected: 83.5 },
    { char: '1', prevChar: '-', expected: 83.5 },
    { char: '1', prevChar: undefined, expected: 83.5 },
    { char: '1', prevChar: ' ', expected: 167 },
    { char: 'a', prevChar: undefined, expected: 167 },
  ])(`when called with $char and $prevChar then the result should be $expected`, ({ char, prevChar, expected }) => {
    expect(getWidth(char, prevChar)).toBe(expected);
  });
});

describe('getHeights', () => {
  describe('when panelHeight is below 72', () => {
    const panelHeight = 71;

    it('should calculate the correct time height', () => {
      const options = {} as ClockOptions;

      expect(getHeights(panelHeight, options).time).toBe(71);
    });

    it('should have no date height when date is shown', () => {
      const options = { dateSettings: { showDate: true } } as ClockOptions;

      expect(getHeights(panelHeight, options).date).toBe(0);
    });

    it('should have no description height when description is shown', () => {
      const options = { descriptionSettings: { source: DescriptionSource.input } } as ClockOptions;

      expect(getHeights(panelHeight, options).description).toBe(0);
    });

    it('should have no zone height when timezone is shown', () => {
      const options = { timezoneSettings: { showTimezone: true } } as ClockOptions;

      expect(getHeights(panelHeight, options).zone).toBe(0);
    });
  });

  describe('when panelHeight is 72', () => {
    const panelHeight = 72;

    it('should calculate the correct time height', () => {
      const options = {} as ClockOptions;

      expect(getHeights(panelHeight, options).time).toBe(72);
    });

    it('should have no date height when date options are missing', () => {
      const options = {} as ClockOptions;

      expect(getHeights(panelHeight, options).date).toBe(0);
    });

    it('should have no date height when date is not shown', () => {
      const options = { dateSettings: { showDate: false } } as ClockOptions;

      expect(getHeights(panelHeight, options).date).toBe(0);
    });

    it('should calculate the correct date height when date is shown', () => {
      const options = { dateSettings: { showDate: true } } as ClockOptions;

      expect(getHeights(panelHeight, options).date).toBe(12);
    });

    it('should have no description height when description options are missing', () => {
      const options = {} as ClockOptions;

      expect(getHeights(panelHeight, options).description).toBe(0);
    });

    it('should have no description height when description is not shown', () => {
      const options = { descriptionSettings: { source: DescriptionSource.none } } as ClockOptions;

      expect(getHeights(panelHeight, options).description).toBe(0);
    });

    it('should calculate the description date height when description is shown', () => {
      const options = { descriptionSettings: { source: DescriptionSource.input } } as ClockOptions;

      expect(getHeights(panelHeight, options).description).toBe(12);
    });

    it('should have no zone height when timezone options are missing', () => {
      const options = {} as ClockOptions;

      expect(getHeights(panelHeight, options).zone).toBe(0);
    });

    it('should have no zone height when timezone is not shown', () => {
      const options = { timezoneSettings: { showTimezone: false } } as ClockOptions;

      expect(getHeights(panelHeight, options).zone).toBe(0);
    });

    it('should calculate the zone date height when timezone is shown', () => {
      const options = { timezoneSettings: { showTimezone: true } } as ClockOptions;

      expect(getHeights(panelHeight, options).zone).toBe(12);
    });
  });

  describe('when panelHeight is above 72', () => {
    const panelHeight = 73;

    it('should calculate the correct time height', () => {
      const options = {} as ClockOptions;

      expect(getHeights(panelHeight, options).time).toBe(73);
    });

    it('should calculate the correct date height when date is shown', () => {
      const options = { dateSettings: { showDate: true } } as ClockOptions;

      expect(getHeights(panelHeight, options).date).toBe(12.166666666666666);
    });

    it('should calculate the description date height when description is shown', () => {
      const options = { descriptionSettings: { source: DescriptionSource.input } } as ClockOptions;

      expect(getHeights(panelHeight, options).description).toBe(12.166666666666666);
    });

    it('should calculate the correct zone height when timezone is shown', () => {
      const options = { timezoneSettings: { showTimezone: true } } as ClockOptions;

      expect(getHeights(panelHeight, options).zone).toBe(12.166666666666666);
    });
  });
});

describe('getFragmentKey', () => {
  it.each([
    { key: 'some-key', char: '1', charIndex: 0, expected: 'some-key-0-digit' },
    { key: 'some-key', char: '1', charIndex: 2, expected: 'some-key-2-digit' },
    { key: 'key', char: ':', charIndex: 0, expected: 'key-0-colon' },
    { key: 'k', char: '-', charIndex: 1, expected: 'k-1-dash' },
    { key: 't', char: 't', charIndex: 5, expected: 't-5-text' },
  ])(
    `when called with $key, $char and $charIndex then the result should be $expected`,
    ({ key, char, charIndex, expected }) => {
      expect(getFragmentKey(key, char, charIndex)).toBe(expected);
    }
  );
});
