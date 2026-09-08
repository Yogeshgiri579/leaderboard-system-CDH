import React from 'react';

export default function StatsOverview({ stats, timeframe = 'weekly', weekInfo }) {
  const isWeekly = timeframe === 'weekly';

  const cards = isWeekly
    ? [
        { label: 'Active Members This Week', value: stats?.activeMembersThisWeek || 0 },
        { label: 'Weekly Verified Posts', value: stats?.weeklyVerifiedPosts || 0 },
        { label: 'Weekly Points Awarded', value: (stats?.weeklyPointsAwarded || 0).toLocaleString() },
        { label: 'Weekly Cycle Reset', value: weekInfo ? `${weekInfo.daysRemaining}d left` : 'Active' },
      ]
    : [
        { label: 'Total Cohort Members', value: stats?.totalMembers || 0 },
        { label: 'All-Time Verified Posts', value: stats?.totalVerifiedPosts || 0 },
        { label: 'Total Community Points', value: (stats?.totalPointsAwarded || 0).toLocaleString() },
        { label: 'Certified Module Experts', value: stats?.totalModuleExperts || 0 },
      ];

  return (
    <div className="stats-row">
      {cards.map((c, i) => (
        <div key={i} className="stat-card">
          <div className="stat-value">{c.value}</div>
          <div className="stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
