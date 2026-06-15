import { render, screen } from '@testing-library/react';
import App from './App';

test('shows login screen when app starts', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { level: 2, name: /login/i });
  expect(heading).toBeInTheDocument();
});
