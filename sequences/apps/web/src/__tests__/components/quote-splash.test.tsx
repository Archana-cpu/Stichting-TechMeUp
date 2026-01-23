import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteSplash } from '@/components/quote-splash';

// ============================================================================
// MOCKS
// ============================================================================

const mockQuote = {
  id: 'test-id',
  text: 'Test quote text',
  author: 'Test Author',
  source: 'Test Source',
  category: 'psychology',
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

// ============================================================================
// TESTS
// ============================================================================

describe('QuoteSplash', () => {
  it('should render nothing while loading', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<QuoteSplash />);
    expect(container.firstChild).toBeNull();
  });

  it('should render quote after successful fetch', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockQuote),
    });

    render(<QuoteSplash />);

    await waitFor(() => {
      expect(screen.getByText(/Test quote text/)).toBeInTheDocument();
    });

    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test Source')).toBeInTheDocument();
  });

  it('should call onDismiss when close button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockQuote),
    });

    render(<QuoteSplash onDismiss={onDismiss} />);

    await waitFor(() => {
      expect(screen.getByText(/Test quote text/)).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole('button');
    const closeButton = buttons[0];
    if (closeButton) {
      await user.click(closeButton);

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalled();
      });
    }
  });

  it('should include emotion key in fetch when provided', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockQuote),
    });

    render(<QuoteSplash emotionKey="joy" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('emotion=joy'));
    });
  });

  it('should render nothing on fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    const { container } = render(<QuoteSplash />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
