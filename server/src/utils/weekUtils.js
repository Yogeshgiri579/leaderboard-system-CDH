/**
 * Week utilities for ISO calendar weekly cycles (Monday 00:00:00 to Sunday 23:59:59 UTC/Local)
 */

/**
 * Get ISO week identifier e.g. "2026-W37"
 * @param {Date|string|number} inputDate 
 * @returns {string} e.g. "2026-W37"
 */
function getCurrentWeekId(inputDate = new Date()) {
  const d = new Date(inputDate);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  const weekNo = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  const padWeek = String(weekNo).padStart(2, '0');
  return `${d.getFullYear()}-W${padWeek}`;
}

/**
 * Get start and end date for a given ISO week identifier
 * @param {string} weekId e.g. "2026-W37"
 * @returns {object} { start: Date, end: Date, label: string, daysRemaining: number, weekNumber: number, year: number }
 */
function getWeekDateRange(weekId) {
  if (!weekId || !weekId.includes('-W')) {
    weekId = getCurrentWeekId();
  }

  const [yearStr, weekStr] = weekId.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // Find Monday of Week 1
  // Jan 4th is always in week 1.
  const jan4 = new Date(year, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7; // 0 = Monday, 6 = Sunday
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - jan4Day);
  mondayWeek1.setHours(0, 0, 0, 0);

  // Target week Monday
  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);

  // Target week Sunday
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Months formatting
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const startMonth = months[monday.getMonth()];
  const endMonth = months[sunday.getMonth()];
  const startDay = monday.getDate();
  const endDay = sunday.getDate();

  const label = 'Weekly Community Leaderboard';

  const now = new Date();
  const diffMs = sunday.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    weekId,
    year,
    weekNumber: week,
    start: monday,
    end: sunday,
    label,
    daysRemaining,
  };
}

/**
 * Check if a date falls inside a given week
 * @param {Date|string|number} date 
 * @param {string} weekId 
 * @returns {boolean}
 */
function isDateInWeek(date, weekId = getCurrentWeekId()) {
  if (!date) return false;
  const targetDate = new Date(date);
  const { start, end } = getWeekDateRange(weekId);
  return targetDate >= start && targetDate <= end;
}

module.exports = {
  getCurrentWeekId,
  getWeekDateRange,
  isDateInWeek,
};
