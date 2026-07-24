
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DateNight from '../../pages/fun/date-night/DateNight';
import { bucketListService } from '../../services/fun/bucketListService';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/fun/bucketListService', () => ({
  bucketListService: {
    getBucketItems: vi.fn()
  }
}));

vi.mock('../../context/PreferencesContext', () => ({
  usePreferences: () => ({
    language: 'pt'
  })
}));

const renderWithRouter = (ui) => {
  return render(ui, { wrapper: BrowserRouter });
};

describe('DateNight page component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters out completed bucket list items and only shows pending ones', async () => {
    const items = [
      { id: '1', title: 'Completed travel', completed: true },
      { id: '2', title: 'Pending candlelit dinner', completed: false }
    ];

    bucketListService.getBucketItems.mockResolvedValue(items);

    renderWithRouter(<DateNight />);

    await waitFor(() => {
      expect(screen.getByText('Pending candlelit dinner')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Completed travel')).not.toBeInTheDocument();
  });

  it('allows rolling again when clicking the surprise button', async () => {
    const items = [
      { id: '1', title: 'Goal 1', completed: false },
      { id: '2', title: 'Goal 2', completed: false }
    ];

    bucketListService.getBucketItems.mockResolvedValue(items);

    renderWithRouter(<DateNight />);

    await waitFor(() => {
      expect(screen.getByText(/Goal (1|2)/)).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /Surpreende-me/i });
    fireEvent.click(button);

    expect(screen.getByText(/Goal (1|2)/)).toBeInTheDocument();
  });
});
