import React from 'react';
import { render, act } from '@testing-library/react';
import GuessFeedA from '@/components/Dashboard/GuessFeedA';
import type { Guess } from '@/lib/types';

const makeGuess = (overrides: Partial<Guess> = {}): Guess => ({
  id: '1',
  name: 'Alice',
  gender: 'girl',
  weight_lbs: 7,
  weight_oz: 8,
  birth_date: '2026-08-08',
  birth_time: '10:00',
  length_in: 20,
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('GuessFeedA polling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => [makeGuess()],
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('does not poll immediately on mount', () => {
    render(<GuessFeedA initialGuesses={[]} />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('polls /api/guesses after 5 seconds', async () => {
    render(<GuessFeedA initialGuesses={[]} />);
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/guesses');
  });

  it('polls again every 5 seconds', async () => {
    render(<GuessFeedA initialGuesses={[]} />);
    await act(async () => { jest.advanceTimersByTime(5000); });
    await act(async () => { jest.advanceTimersByTime(5000); });
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('clears the interval on unmount', async () => {
    const { unmount } = render(<GuessFeedA initialGuesses={[]} />);
    unmount();
    await act(async () => { jest.advanceTimersByTime(15000); });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not crash when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;
    render(<GuessFeedA initialGuesses={[makeGuess()]} />);
    await act(async () => { jest.advanceTimersByTime(5000); });
    // component should still be mounted without throwing
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
