const { calculateActivityStreak } = require('../src/utils/streakCalculator');

describe('calculateActivityStreak', () => {
  beforeAll(() => {
    // Lock current time to 2026-07-16T12:00:00.000Z
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-07-16T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return 0 when there are no activity dates', () => {
    expect(calculateActivityStreak([])).toBe(0);
    expect(calculateActivityStreak(null)).toBe(0);
  });

  it('should return 1 on the first day of activity (only today)', () => {
    const dates = ['2026-07-16T10:00:00.000Z'];
    expect(calculateActivityStreak(dates)).toBe(1);
  });

  it('should return 1 if only yesterday was active', () => {
    const dates = ['2026-07-15T15:00:00.000Z'];
    expect(calculateActivityStreak(dates)).toBe(1);
  });

  it('should return 3 for consecutive activity (today, yesterday, 2 days ago)', () => {
    const dates = [
      '2026-07-16T10:00:00.000Z',
      '2026-07-15T09:00:00.000Z',
      '2026-07-14T20:00:00.000Z'
    ];
    expect(calculateActivityStreak(dates)).toBe(3);
  });

  it('should return 2 for consecutive activity ending yesterday (yesterday, 2 days ago)', () => {
    const dates = [
      '2026-07-15T09:00:00.000Z',
      '2026-07-14T20:00:00.000Z'
    ];
    expect(calculateActivityStreak(dates)).toBe(2);
  });

  it('should return 0 when streak is broken (last activity was 2 days ago)', () => {
    const dates = [
      '2026-07-14T10:00:00.000Z',
      '2026-07-13T20:00:00.000Z'
    ];
    expect(calculateActivityStreak(dates)).toBe(0);
  });

  it('should handle duplicate entries on the same day and sort correctly', () => {
    const dates = [
      '2026-07-15T22:00:00.000Z',
      '2026-07-16T08:00:00.000Z',
      '2026-07-16T18:00:00.000Z',
      '2026-07-15T12:00:00.000Z',
      '2026-07-14T01:00:00.000Z'
    ];
    expect(calculateActivityStreak(dates)).toBe(3);
  });

  it('should break streak on gaps (e.g. today and 2 days ago, but missing yesterday)', () => {
    const dates = [
      '2026-07-16T10:00:00.000Z',
      '2026-07-14T20:00:00.000Z'
    ];
    expect(calculateActivityStreak(dates)).toBe(1); // Today is 1, but cannot chain to 14 because 15 is missing
  });

  it('should correctly handle UTC date boundaries close to midnight', () => {
    // Activity at 23:59:59 UTC on July 15 and 00:00:01 UTC on July 16
    const dates = [
      '2026-07-16T00:00:01.000Z',
      '2026-07-15T23:59:59.000Z',
      '2026-07-14T12:00:00.000Z'
    ];
    expect(calculateActivityStreak(dates)).toBe(3);
  });
});
