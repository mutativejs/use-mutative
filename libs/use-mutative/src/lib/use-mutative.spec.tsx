import { render } from '@testing-library/react';

import UseMutative from './use-mutative';

describe('UseMutative', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UseMutative />);
    expect(baseElement).toBeTruthy();
  });
});
