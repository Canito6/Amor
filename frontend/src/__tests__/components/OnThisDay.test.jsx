
import { render, screen } from '@testing-library/react';
import OnThisDay from '../../components/dashboard/widgets/OnThisDay';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

describe('OnThisDay widget', () => {
  beforeAll(() => {
    // Lock date to 2026-07-16
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 16)); // July is index 6
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders null when there are no memories', () => {
    const { container } = render(<OnThisDay memories={[]} t={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders matching memory from 1 year ago', () => {
    const memories = [
      {
        _id: '1',
        title: 'Meeting 1 year ago',
        description: 'First coffee',
        date: new Date(2025, 6, 16).toISOString(), // 2025-07-16
        isTimeCapsule: false
      }
    ];

    render(<OnThisDay memories={memories} language="pt" t={{}} />);
    
    expect(screen.getByText('Neste Dia...')).toBeInTheDocument();
    expect(screen.getByText('Meeting 1 year ago')).toBeInTheDocument();
    expect(screen.getByText('Há 1 ano (2025)')).toBeInTheDocument();
    expect(screen.getByText('"First coffee"')).toBeInTheDocument();
  });

  it('renders matching memories from multiple years ago', () => {
    const memories = [
      {
        _id: '1',
        title: 'Meeting 2 years ago',
        description: 'First picnic',
        date: new Date(2024, 6, 16).toISOString(), // 2024-07-16
        isTimeCapsule: false
      },
      {
        _id: '2',
        title: 'Meeting 3 years ago',
        description: 'First cinema',
        date: new Date(2023, 6, 16).toISOString(), // 2023-07-16
        isTimeCapsule: false
      }
    ];

    render(<OnThisDay memories={memories} language="pt" t={{}} />);
    
    expect(screen.getByText('Neste Dia...')).toBeInTheDocument();
    expect(screen.getByText('Meeting 2 years ago')).toBeInTheDocument();
    expect(screen.getByText('Há 2 anos (2024)')).toBeInTheDocument();
    expect(screen.getByText('Meeting 3 years ago')).toBeInTheDocument();
    expect(screen.getByText('Há 3 anos (2023)')).toBeInTheDocument();
  });

  it('does not render memories from the current year', () => {
    const memories = [
      {
        _id: '1',
        title: 'Meeting today',
        description: 'Today picnic',
        date: new Date(2026, 6, 16).toISOString(), // 2026-07-16
        isTimeCapsule: false
      }
    ];

    const { container } = render(<OnThisDay memories={memories} t={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render if the date does not match today', () => {
    const memories = [
      {
        _id: '1',
        title: 'Meeting yesterday',
        description: 'Picnic',
        date: new Date(2025, 6, 15).toISOString(), // 2025-07-15
        isTimeCapsule: false
      }
    ];

    const { container } = render(<OnThisDay memories={memories} t={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render locked time capsules', () => {
    const memories = [
      {
        _id: '1',
        title: 'Locked capsule',
        description: 'Do not open',
        date: new Date(2025, 6, 16).toISOString(),
        isTimeCapsule: true,
        unlockDate: new Date(2027, 6, 16).toISOString(),
        locked: true
      }
    ];

    const { container } = render(<OnThisDay memories={memories} t={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
