import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GuessForm from '@/components/GuessForm';

jest.mock('@/lib/validation', () => ({
  ...jest.requireActual('@/lib/validation'),
  validateGuess: jest.fn(() => []),
}));

import { validateGuess } from '@/lib/validation';
const mockValidateGuess = validateGuess as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
  mockValidateGuess.mockReturnValue([]);
});

afterEach(cleanup);

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>, opts: { gender?: 'boy' | 'girl' } = {}) {
  await user.type(screen.getByPlaceholderText(/aunt sarah/i), 'Test User');
  if (opts.gender) {
    await user.click(screen.getByRole('button', { name: new RegExp(opts.gender, 'i') }));
  }
  await user.type(screen.getByPlaceholderText('7'), '7');
  await user.type(screen.getByPlaceholderText('4'), '8');
  await user.type(screen.getByPlaceholderText('20'), '20');
}

describe('GuessForm', () => {
  it('renders all form fields', () => {
    render(<GuessForm />);
    expect(screen.getByPlaceholderText(/aunt sarah/i)).toBeInTheDocument();
    expect(screen.getByText(/boy or girl/i)).toBeInTheDocument();
    expect(screen.getByText(/birth weight/i)).toBeInTheDocument();
    expect(screen.getByText(/birth date/i)).toBeInTheDocument();
    expect(screen.getByText(/length/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit my guess/i })).toBeInTheDocument();
  });

  it('shows error if gender not selected on submit', async () => {
    render(<GuessForm />);
    const user = userEvent.setup();
    // fill all required HTML fields so form validation passes, but skip gender
    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));
    expect(screen.getByText(/please pick boy or girl/i)).toBeInTheDocument();
  });

  it('highlights selected gender button', async () => {
    render(<GuessForm />);
    const user = userEvent.setup();
    const boyBtn = screen.getByRole('button', { name: /boy/i });
    await user.click(boyBtn);
    expect(boyBtn).toHaveClass('bg-blue-500');
  });

  it('shows success state after successful submission', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, id: 'abc' }),
    }) as jest.Mock;

    render(<GuessForm />);
    const user = userEvent.setup();
    await fillRequiredFields(user, { gender: 'boy' });
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));

    await waitFor(() => {
      expect(screen.getByText(/you're entered/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Name is required' }),
    }) as jest.Mock;

    render(<GuessForm />);
    const user = userEvent.setup();
    await fillRequiredFields(user, { gender: 'boy' });
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
  });

  it('shows network error on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;

    render(<GuessForm />);
    const user = userEvent.setup();
    await fillRequiredFields(user, { gender: 'girl' });
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows validation modal with weight error', async () => {
    mockValidateGuess.mockReturnValue(['Weight must be between 5 lbs 0 oz and 10 lbs 8 oz']);
    render(<GuessForm />);
    const user = userEvent.setup();
    await fillRequiredFields(user, { gender: 'boy' });
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid guess/i)).toBeInTheDocument();
      expect(screen.getByText(/weight must be/i)).toBeInTheDocument();
    });
  });

  it('closes validation modal when fix button is clicked', async () => {
    mockValidateGuess.mockReturnValue(['Weight must be between 5 lbs 0 oz and 10 lbs 8 oz']);
    render(<GuessForm />);
    const user = userEvent.setup();
    await fillRequiredFields(user, { gender: 'boy' });
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));

    await waitFor(() => expect(screen.getByText(/invalid guess/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /fix my guess/i }));
    expect(screen.queryByText(/invalid guess/i)).not.toBeInTheDocument();
  });

  it('shows validation modal with length error', async () => {
    mockValidateGuess.mockReturnValue(['Length must be between 17 and 22 inches']);
    render(<GuessForm />);
    const user = userEvent.setup();
    await fillRequiredFields(user, { gender: 'girl' });
    await user.click(screen.getByRole('button', { name: /submit my guess/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid guess/i)).toBeInTheDocument();
      expect(screen.getByText(/length must be/i)).toBeInTheDocument();
    });
  });
});
