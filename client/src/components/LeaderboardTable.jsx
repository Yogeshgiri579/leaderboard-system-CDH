import React, { useState } from 'react';
import Avatar from './AvatarIcon';
import HexBadge from './HexBadge';
import BadgeShowcaseModal from './BadgeShowcaseModal';
import BatchSelect from './BatchSelect';


import { LinkedInIcon, WhatsAppIcon, TwitterXIcon } from './SocialIcons';

function RankBadge({ rank }) {
  const cls = rank === 1 ? 'rank-badge rank-1' : rank === 2 ? 'rank-badge rank-2' : rank === 3 ? 'rank-badge rank-3' : 'rank-badge rank-n';
  return <span className={cls}>#{rank}</span>;
}

export default function LeaderboardTable({
  users = [],
  selectedBatch,
  setSelectedBatch,
  batches = ['All'],
  searchTerm,
  setSearchTerm,
  timeframe = 'weekly',
  setTimeframe,
  weekInfo,
  onViewUserPosts,
  onOpenSubmit,
}) {
  const [activeShowcase, setActiveShowcase] = useState(null); // { badge, user }

  const handleShareRank = (user, platform, e) => {
    e.stopPropagation();
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clouddevopshub.com';
    const isWeekly = timeframe === 'weekly';
    const pts = isWeekly ? user.weeklyPoints || 0 : user.totalPoints;
    const rankTitle = isWeekly
      ? `ranked #${user.rank || 1} with ${pts} pts on the @CloudDevOpsHub Weekly Leaderboard (${weekInfo?.label || 'This Week'})`
      : `ranked #${user.rank || 1} with ${pts} pts on the @CloudDevOpsHub Leaderboard`;

    const text = `🎉 I'm currently ${rankTitle}!

Mentored by Vikas Ratnawat in Batch 45 (Multi-Cloud & DevOps With AI). Unlocked ${user.unlockedBadges?.length || 0}/10 curriculum module badges! 🚀

Leaderboard: ${currentUrl}
#CloudDevOpsHub #VikasRatnawat #DevOps #Kubernetes #AWS #CareerGrowth`;

    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank', 'width=650,height=600');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=450');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="lb-panel">
      {/* Weekly Cycle Header Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.02em', color: '#f8fafc' }}>
            Weekly Community Leaderboard
          </span>
          {timeframe === 'weekly' && weekInfo?.daysRemaining != null && (
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                fontWeight: 600,
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              ⏳ Resets in {weekInfo.daysRemaining} {weekInfo.daysRemaining === 1 ? 'day' : 'days'}
            </span>
          )}
        </div>

        {/* Timeframe Toggle: This Week vs All-Time */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.1)', padding: '2px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setTimeframe?.('weekly')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: timeframe === 'weekly' ? '#0284c7' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ⚡ Weekly Ranking
          </button>
          <button
            type="button"
            onClick={() => setTimeframe?.('all-time')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: timeframe === 'all-time' ? '#0284c7' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🏆 All-Time
          </button>
        </div>
      </div>

      <div className="lb-header">
        <div>
          <div className="lb-title">
            {timeframe === 'weekly' ? 'CloudDevOpsHub Weekly Leaderboard' : 'CloudDevOpsHub All-Time Leaderboard'}
          </div>
          <div className="lb-sub">
            {timeframe === 'weekly'
              ? 'Filter by batch (Batch 40 – 50) · Ranked by verified posts this week · Resets every Monday'
              : 'Filter by batch (Batch 40 – 50) · Ranked by cumulative all-time points & curriculum module badges'}
          </div>
        </div>
        <div className="lb-controls">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search-input" type="text" placeholder="Search member..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ width: '240px', flexShrink: 0 }}>
            <BatchSelect
              value={selectedBatch}
              onChange={setSelectedBatch}
              includeAllOption={true}
              pinnedBatch="Batch 44"
              placeholder="All Batches (40 - 50)"
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="lb-table" style={{ width: '100%', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: '48px', textAlign: 'center' }}>Rank</th>
              <th style={{ minWidth: '150px', maxWidth: '200px' }}>Member</th>
              <th style={{ width: '100px' }}>Batch</th>
              <th style={{ textAlign: 'center', minWidth: '140px' }}>Curriculum Badges</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Posts</th>
              <th style={{ textAlign: 'center', width: '95px' }}>
                {timeframe === 'weekly' ? 'Weekly Pts' : 'Total Pts'}
              </th>
              <th style={{ textAlign: 'right', width: '140px' }}>Share &amp; View</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  <p>No members found in this view.</p>
                  <button className="btn btn-dark btn-sm" onClick={onOpenSubmit}>Submit your profile now</button>
                </td>
              </tr>
            ) : users.map((user, i) => {
              const rank = user.rank || i + 1;
              const unlockedList = user.unlockedBadges || [];

              return (
                <tr key={user._id || i} onClick={() => onViewUserPosts(user)} style={{ cursor: 'pointer' }}>
                  <td style={{ textAlign: 'center' }}><RankBadge rank={rank} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                      <Avatar name={user.name} size="md" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '160px',
                          }}
                          title={user.name}
                        >
                          {user.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <a
                            href={user.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: '0.72rem',
                              color: '#0284c7',
                              textDecoration: 'none',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'inline-block',
                              maxWidth: '120px',
                            }}
                          >
                            LinkedIn Profile ↗
                          </a>
                          <span
                            className="badge badge-slate mobile-only-batch"
                            style={{ fontSize: '0.62rem', padding: '0.06rem 0.35rem' }}
                          >
                            {user.batch}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge badge-slate"
                      style={{
                        maxWidth: '95px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                      }}
                      title={user.batch}
                    >
                      {user.batch}
                    </span>
                  </td>

                  {/* 10-Module Badges Mini Row */}
                  <td style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        justifyContent: 'center',
                        flexWrap: 'nowrap',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {unlockedList.length > 0 ? (
                        <>
                          {unlockedList.slice(0, 3).map((ub) => (
                            <div
                              key={ub.badgeId}
                              onClick={() => setActiveShowcase({ badge: ub, user })}
                              style={{ cursor: 'pointer', transform: 'scale(0.82)', transformOrigin: 'center' }}
                              title={`Click to view/download ${ub.code || ub.title}`}
                            >
                              <HexBadge badge={ub} isUnlocked={true} size="sm" showLockIcon={false} />
                            </div>
                          ))}
                          {unlockedList.length > 3 && (
                            <span
                              onClick={() => onViewUserPosts(user)}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                padding: '0.18rem 0.45rem',
                                borderRadius: '9999px',
                                background: 'rgba(2, 132, 199, 0.1)',
                                color: '#0284c7',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              +{unlockedList.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>0/10 Unlocked</span>
                      )}
                    </div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-green" style={{ fontSize: '0.68rem', padding: '0.18rem 0.5rem' }}>
                      {timeframe === 'weekly' ? user.weeklyVerifiedPostsCount || 0 : user.verifiedPostsCount || 0}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      {timeframe === 'weekly' ? user.weeklyPoints || 0 : user.totalPoints}
                    </span>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '1px' }}>
                      {timeframe === 'weekly' ? 'pts this week' : 'total pts'}
                    </div>
                  </td>

                  {/* Share & View Actions */}
                  <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                      {/* LinkedIn */}
                      <button
                        className="social-share-btn"
                        onClick={(e) => handleShareRank(user, 'linkedin', e)}
                        title="Share rank to LinkedIn"
                        style={{
                          width: '26px',
                          height: '26px',
                          padding: 0,
                          borderRadius: '6px',
                          background: '#0a66c2',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <LinkedInIcon size={13} color="#ffffff" />
                      </button>

                      {/* WhatsApp */}
                      <button
                        className="social-share-btn"
                        onClick={(e) => handleShareRank(user, 'whatsapp', e)}
                        title="Share rank to WhatsApp"
                        style={{
                          width: '26px',
                          height: '26px',
                          padding: 0,
                          borderRadius: '6px',
                          background: '#25d366',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <WhatsAppIcon size={14} color="#ffffff" />
                      </button>

                      {/* Twitter / X */}
                      <button
                        className="social-share-btn"
                        onClick={(e) => handleShareRank(user, 'twitter', e)}
                        title="Share rank to X (Twitter)"
                        style={{
                          width: '26px',
                          height: '26px',
                          padding: 0,
                          borderRadius: '6px',
                          background: '#000000',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <TwitterXIcon size={12} color="#ffffff" />
                      </button>

                      {/* Audit button */}
                      <button
                        className="btn btn-dark btn-sm"
                        onClick={() => onViewUserPosts(user)}
                        style={{ fontSize: '0.72rem', padding: '0.22rem 0.55rem', borderRadius: '6px', marginLeft: '2px' }}
                      >
                        Audit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Badge Showcase Modal triggered from mini badge */}
      {activeShowcase && (
        <BadgeShowcaseModal
          isOpen={Boolean(activeShowcase)}
          onClose={() => setActiveShowcase(null)}
          badge={activeShowcase.badge}
          user={activeShowcase.user}
          isUnlocked={true}
        />
      )}
    </div>
  );
}

