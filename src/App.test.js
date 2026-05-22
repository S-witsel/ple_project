import { render, screen } from '@testing-library/react';
import App from './App';

test('shows login screen when app starts', () => {
  render(<App />);
  const heading = screen.getByText(/login as a user/i);
  expect(heading).toBeInTheDocument();
});
