import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ColorEditor } from './ColorEditor';

test('clears the selected color through a named, focusable button', () => {
  const onChange = jest.fn();
  render(<ColorEditor value="red" onChange={onChange} />);

  const clearColor = screen.getByRole('button', { name: 'Clear color' });
  expect(clearColor).toHaveProperty('tabIndex', 0);

  fireEvent.click(clearColor);

  expect(onChange).toHaveBeenCalledWith(undefined);
});
