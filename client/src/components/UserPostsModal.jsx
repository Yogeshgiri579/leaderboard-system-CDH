import React, { useState, useEffect, useRef } from 'react';
import Avatar from './AvatarIcon';
import HexBadge from './HexBadge';
import BadgeShowcaseModal from './BadgeShowcaseModal';
import { fetchUserPosts } from '../services/api';

export default function UserPostsModal({ user, onClose }) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'verified'
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    setPosts([]);
    setBadges([]);
    fetchUserPosts(user._id || encodeURIComponent(user.linkedinUrl))
      .then((d) => {
        setPosts(d.posts || []);
        setBadges(d.badges || []);
      })
      .catch(() => setError('Failed to load contributions.'))
      .finally(() => setLoading(false));
  }, [user]);


  if (!user) return null;

  const verifiedPosts = posts.filter((p) => p.isRelevant);
  const displayPosts = activeTab === 'verified' ? verifiedPosts : posts;

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose}>
      <div
        className="modal-box modal-scrollable"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          width: '95%',
          padding: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          background: '#f8fafc',
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Avatar name={user.name} size="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0f172a' }}>
                {user.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                <span className="badge badge-slate">{user.batch}</span>
                {user.isModuleExpert && (
                  <span className="badge badge-amber">★ {user.moduleExpertBadge || 'Module Expert'}</span>
                )}
                <a
                  href={user.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: '0.75rem', color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
                >
                  View Profile ↗
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '1.25rem',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
          {[
            { label: 'Weekly Score', value: `${user.weeklyPoints || 0} pts` },
            { label: 'All-Time Score', value: `${user.totalPoints} pts` },
            { label: 'Verified Posts', value: user.verifiedPostsCount || 0 },
            { label: 'Total Scraped', value: posts.length || user.totalPostsScraped || 0 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '0.85rem 0.5rem',
                textAlign: 'center',
                borderRight: i < 3 ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: '#0f172a',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '-0.02em',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* 10-Module Batch 45 Curriculum Badges Section */}
        <div
          style={{
            padding: '1rem 1.5rem 1.15rem',
            background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem' }}>🏅</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em', color: '#f8fafc' }}>
                Batch 45 Curriculum Module Badges
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontWeight: 600,
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {badges.filter((b) => b.isUnlocked).length} / 10 Unlocked
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '0.12rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                  fontWeight: 500,
                }}
              >
                Min. 5 Posts per Badge
              </span>
            </div>
          </div>

          {/* Badges Horizontal Carousel with Beautiful Sleek Scrollbar */}
          <div
            className="badges-carousel"
            style={{
              display: 'flex',
              gap: '14px',
              overflowX: 'auto',
              paddingBottom: '0.65rem',
              paddingTop: '0.25rem',
              scrollBehavior: 'smooth',
            }}
          >
            {badges.map((badge) => (
              <div
                key={badge.badgeId || badge.id}
                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setSelectedBadge(badge)}
              >
                <HexBadge
                  badge={badge}
                  isUnlocked={badge.isUnlocked}
                  size="sm"
                  onClick={() => setSelectedBadge(badge)}
                />
                {badge.isUnlocked ? (
                  <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, marginTop: '3px' }}>
                    ✓ {badge.postCount || 5}/5
                  </span>
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>
                    {badge.postCount || 0}/5 posts
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'all' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'all' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            All Scraped Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'verified' ? '#059669' : '#f1f5f9',
              color: activeTab === 'verified' ? '#ffffff' : '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            ✓ Verified Only ({verifiedPosts.length})
          </button>
        </div>

        {/* Posts List - Scrolls seamlessly with the whole modal */}
        <div style={{ padding: '1.25rem 1.5rem', background: '#f8fafc' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>
              <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#0f172a', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.75rem' }} />
              <div>Fetching verified LinkedIn posts...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#dc2626', fontSize: '0.875rem' }}>
              {error}
            </div>
          ) : displayPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>
              {activeTab === 'verified'
                ? 'No verified CloudDevOpsHub community posts found in this profile.'
                : 'No scraped activity found.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayPosts.map((post, i) => {
                const targetUrl = post.postUrl || post.linkedinPostUrl;
                const isExpanded = expandedIndex === i;
                const postText = post.postText || post.summary || '';
                const shouldTruncate = postText.length > 280;

                return (
                  <div
                    key={post._id || i}
                    style={{
                      background: '#ffffff',
                      border: post.isRelevant ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    {/* Status & Points header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {post.isRelevant ? (
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              border: '1px solid #a7f3d0',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                            }}
                          >
                            ✓ Verified CloudDevOpsHub
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                            }}
                          >
                            General Post (Not Verified)
                          </span>
                        )}
                        {post.postedAt && (
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            {formatDate(post.postedAt)}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            fontFamily: 'JetBrains Mono, monospace',
                            color: post.isRelevant ? '#059669' : '#94a3b8',
                          }}
                        >
                          {post.pointsAwarded > 0 ? `+${post.pointsAwarded} pts` : '0 pts'}
                        </span>
                      </div>
                    </div>

                    {/* Direct Clickable Post URL */}
                    {targetUrl && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#2563eb',
                            textDecoration: 'none',
                            background: '#eff6ff',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #bfdbfe',
                            wordBreak: 'break-all',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = '#eff6ff')}
                        >
                          <span>🔗 Open Post on LinkedIn</span>
                          <span style={{ fontSize: '0.9rem' }}>↗</span>
                        </a>
                      </div>
                    )}

                    {/* Post Content */}
                    {postText && (
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: '#334155',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          background: '#f8fafc',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {shouldTruncate && !isExpanded ? `${postText.slice(0, 280)}...` : postText}
                        {shouldTruncate && (
                          <button
                            onClick={() => setExpandedIndex(isExpanded ? null : i)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#2563eb',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              padding: 0,
                              marginLeft: '0.5rem',
                            }}
                          >
                            {isExpanded ? 'Show less' : 'Read full post'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* AI Audit Reasoning */}
                    {post.aiReasoning && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: post.isRelevant ? '#065f46' : '#64748b',
                          background: post.isRelevant ? '#f0fdf4' : '#f8fafc',
                          borderLeft: post.isRelevant ? '3px solid #10b981' : '3px solid #cbd5e1',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0 6px 6px 0',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>AI Auditor Verdict: </span>
                        {post.aiReasoning}
                      </div>
                    )}

                    {/* Engagement & Keywords footer */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>👍 {post.likesCount || 0} likes</span>
                        <span>💬 {post.commentsCount || 0} comments</span>
                        {post.mentionsVikasRatnawat && (
                          <span style={{ color: '#059669', fontWeight: 600 }}>🏷️ Mentions Mentor</span>
                        )}
                      </div>

                      {(post.detectedKeywords || post.tags)?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {(post.detectedKeywords || post.tags).map((kw, j) => (
                            <span key={j} className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Badge Showcase Modal */}
      {selectedBadge && (
        <BadgeShowcaseModal
          isOpen={Boolean(selectedBadge)}
          onClose={() => setSelectedBadge(null)}
          badge={selectedBadge}
          user={user}
          isUnlocked={selectedBadge.isUnlocked}
        />
      )}
    </div>
  );
}

