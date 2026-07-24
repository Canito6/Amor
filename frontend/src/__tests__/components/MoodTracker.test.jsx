
import { render, screen } from '@testing-library/react';
import MoodTracker from '../../components/dashboard/widgets/MoodTracker';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

describe('MoodTracker widget', () => {
  const t = {
    mood_tracker_title: 'Como te sentes hoje? 😊',
    mood_select_instruction: 'Escolhe o teu humor:',
    mood_just_now: 'agora mesmo'
  };

  beforeAll(() => {
    global.localStorage = {
      getItem: vi.fn((key) => {
        if (key === 'username') return 'Alice';
        return null;
      }),
      setItem: vi.fn(),
      clear: vi.fn()
    };
  });

  afterAll(() => {
    delete global.localStorage;
  });

  it('renders side-by-side avatars and prompt when today\'s mood is missing', () => {
    const coupleInfo = {
      partners: [
        {
          username: 'Alice',
          moodEmoji: '🥰',
          moodUpdatedAt: new Date(2026, 6, 15).toISOString(), // Yesterday
          moodHistory: [{ emoji: '🥰', updatedAt: new Date(2026, 6, 15).toISOString() }]
        },
        {
          username: 'Bob',
          moodEmoji: '😊',
          moodUpdatedAt: new Date(2026, 6, 16).toISOString(), // Today
          moodHistory: [{ emoji: '😊', updatedAt: new Date(2026, 6, 16).toISOString() }]
        }
      ]
    };

    render(<MoodTracker coupleInfo={coupleInfo} loadCoupleInfo={vi.fn()} t={t} language="pt" />);
    
    // Shows the prompt since Alice's mood is yesterday
    expect(screen.getByText('Registem o vosso humor de hoje para ver a vossa sintonia! ⚡')).toBeInTheDocument();
    expect(screen.getByText('Eu')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders 100% Match when both registered the same mood today', () => {
    const todayStr = new Date().toISOString();
    const coupleInfo = {
      partners: [
        {
          username: 'Alice',
          moodEmoji: '🥰',
          moodUpdatedAt: todayStr,
          moodHistory: [{ emoji: '🥰', updatedAt: todayStr }]
        },
        {
          username: 'Bob',
          moodEmoji: '🥰',
          moodUpdatedAt: todayStr,
          moodHistory: [{ emoji: '🥰', updatedAt: todayStr }]
        }
      ]
    };

    render(<MoodTracker coupleInfo={coupleInfo} loadCoupleInfo={vi.fn()} t={t} language="pt" />);
    
    expect(screen.getByText('100% Match')).toBeInTheDocument();
    expect(screen.queryByText('Registem o vosso humor de hoje para ver a vossa sintonia! ⚡')).not.toBeInTheDocument();
  });

  it('calculates historical overlap when moods differ today', () => {
    const todayStr = new Date().toISOString();
    const coupleInfo = {
      partners: [
        {
          username: 'Alice',
          moodEmoji: '🥰',
          moodUpdatedAt: todayStr,
          // History contains: 🥰, 😊, 🥺
          moodHistory: [
            { emoji: '🥰', updatedAt: todayStr },
            { emoji: '😊', updatedAt: todayStr },
            { emoji: '🥺', updatedAt: todayStr }
          ]
        },
        {
          username: 'Bob',
          moodEmoji: '😊',
          moodUpdatedAt: todayStr,
          // History contains: 😊, 🥺, 🔥
          moodHistory: [
            { emoji: '😊', updatedAt: todayStr },
            { emoji: '🥺', updatedAt: todayStr },
            { emoji: '🔥', updatedAt: todayStr }
          ]
        }
      ]
    };

    render(<MoodTracker coupleInfo={coupleInfo} loadCoupleInfo={vi.fn()} t={t} language="pt" />);
    
    // Overlap: Alice's last 3 are 🥰, 😊, 🥺. Bob's are 😊, 🥺, 🔥.
    // Commonalities: 😊, 🥺 are in Bob's. Matches = 2.
    // Freq matches = 2 / 3 * 100 = 67%
    expect(screen.getByText('67% Match')).toBeInTheDocument();
  });

  it('respects the 95% cap on historical match rate when moods differ today', () => {
    const todayStr = new Date().toISOString();
    const coupleInfo = {
      partners: [
        {
          username: 'Alice',
          moodEmoji: '🥰',
          moodUpdatedAt: todayStr,
          // History contains 100% overlap
          moodHistory: [
            { emoji: '🥰', updatedAt: todayStr },
            { emoji: '😊', updatedAt: todayStr }
          ]
        },
        {
          username: 'Bob',
          moodEmoji: '😊', // Differs today (🥰 vs 😊)
          moodUpdatedAt: todayStr,
          moodHistory: [
            { emoji: '🥰', updatedAt: todayStr },
            { emoji: '😊', updatedAt: todayStr }
          ]
        }
      ]
    };

    render(<MoodTracker coupleInfo={coupleInfo} loadCoupleInfo={vi.fn()} t={t} language="pt" />);
    
    // Even with 100% overlap in history, because today's moods differ (🥰 vs 😊), the score must be capped at 95%
    expect(screen.getByText('95% Match')).toBeInTheDocument();
  });

  it('handles empty histories gracefully (new couple)', () => {
    const todayStr = new Date().toISOString();
    const coupleInfo = {
      partners: [
        {
          username: 'Alice',
          moodEmoji: '🥰',
          moodUpdatedAt: todayStr,
          moodHistory: []
        },
        {
          username: 'Bob',
          moodEmoji: '😊',
          moodUpdatedAt: todayStr,
          moodHistory: []
        }
      ]
    };

    render(<MoodTracker coupleInfo={coupleInfo} loadCoupleInfo={vi.fn()} t={t} language="pt" />);
    
    // Overlap: empty histories = 0 matches, max history length is 1 fallback = 0%
    expect(screen.getByText('0% Match')).toBeInTheDocument();
  });
});
