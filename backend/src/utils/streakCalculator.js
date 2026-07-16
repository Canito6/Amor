/**
 * Calculates the current consecutive day streak in UTC.
 * Day boundary is based on UTC calendar dates (YYYY-MM-DD).
 * 
 * Note: UTC calendar date is used as a single source of truth for both partners.
 * This is a common simplification (e.g. Duolingo) which avoids storing timezone configurations,
 * though in rare cases activity close to midnight UTC may fall on different local days.
 */
function calculateActivityStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) return 0;
  
  // Convert all dates to UTC strings (YYYY-MM-DD)
  const utcDateStrings = activityDates.map(date => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }).filter(Boolean);
  
  // Get unique sorted dates in descending order
  const uniqueDates = [...new Set(utcDateStrings)].sort((a, b) => b.localeCompare(a));
  
  if (uniqueDates.length === 0) return 0;
  
  // Get today and yesterday in UTC
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const latestActivityStr = uniqueDates[0];
  
  // If the latest activity is not today and not yesterday, streak is 0 (broken)
  if (latestActivityStr !== todayStr && latestActivityStr !== yesterdayStr) {
    return 0;
  }
  
  let streak = 1;
  let currentRefDate = new Date(latestActivityStr + 'T00:00:00.000Z');
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const nextDate = new Date(uniqueDates[i] + 'T00:00:00.000Z');
    const diffTime = currentRefDate.getTime() - nextDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentRefDate = nextDate;
    } else if (diffDays > 1) {
      break; // Gap found, streak ends here
    }
  }
  
  return streak;
}

module.exports = { calculateActivityStreak };
