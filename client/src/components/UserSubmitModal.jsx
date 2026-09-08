import React, { useState, useEffect, useRef } from 'react';
import { submitUserProfile, checkJobStatus } from '../services/api';
import HexBadge from './HexBadge';
import BadgeShowcaseModal from './BadgeShowcaseModal';
import BatchSelect from './BatchSelect';


export default function UserSubmitModal({ isOpen, onClose, onSuccess, onViewPosts }) {
  const [form, setForm] = useState({
    name: '',
    linkedinUrl: '',
    batch: 'Batch 44',
  });
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [error, setError] = useState('');
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    if (loading) return;
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setForm({ name: '', linkedinUrl: '', batch: 'Batch 44' });
    setError('');
    setIsAlreadySubmitted(false);
    setResult(null);
    setSelectedBadge(null);
    onClose();
  };


  const pollJob = (jobId) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const jobStatus = await checkJobStatus(jobId);

        if (jobStatus) {
          setStage(jobStatus.stage || 'processing');
          setProgressPercent(jobStatus.progress || 20);
          setStageMessage(jobStatus.message || 'Auditing community activity...');

          if (jobStatus.status === 'completed' || jobStatus.stage === 'completed') {
            clearInterval(pollIntervalRef.current);
            setLoading(false);
            setStage('done');
            setProgressPercent(100);
            setResult(jobStatus.result);
            if (jobStatus.result?.user) {
              onSuccess?.(jobStatus.result.user);
            }
          } else if (jobStatus.status === 'failed' || jobStatus.stage === 'failed') {
            clearInterval(pollIntervalRef.current);
            setLoading(false);
            setError(jobStatus.error || 'Profile verification failed.');
          }
        }
      } catch (pollErr) {
        console.warn('Poll status error:', pollErr);
      }
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.linkedinUrl.includes('linkedin.com')) {
      return setError('Please provide a valid LinkedIn profile or activity URL.');
    }

    try {
      setLoading(true);
      setStage('queued');
      setProgressPercent(10);
      setStageMessage('Enqueuing profile sync job in server worker...');

      const response = await submitUserProfile(form);

      if (response.jobId) {
        // Asynchronous Queue Mode
        pollJob(response.jobId);
      } else if (response.user) {
        // Direct synchronous response
        setLoading(false);
        setStage('done');
        setProgressPercent(100);
        setResult(response);
        onSuccess?.(response.user);
      }
    } catch (err) {
      const isLimit = err.response?.data?.alreadySubmitted || false;
      setIsAlreadySubmitted(isLimit);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to sync profile. Please try again.');
      setLoading(false);
      setStage('');
    }
  };

  const stageLabelMap = {
    queued: 'Job Queued in Server Worker...',
    scraping: 'Scraping up to 20 recent LinkedIn posts via Apify...',
    analyzing: 'Auditing 20 posts with Gemini AI Batch Inference...',
    evaluating_badges: 'Evaluating 10-Module Batch 45 Curriculum Badges...',
    ranking: 'Calculating cohort rank & awarding leaderboard points...',
    done: 'Verification & Badge Evaluation Complete!',
  };

  return (
    <div className="modal-overlay fade-in" onClick={handleClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '560px',
          width: '95%',
          borderRadius: '18px',
        }}
      >
        <button
          onClick={handleClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#64748b',
          }}
        >
          ✕
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Sync LinkedIn Profile
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
          Apify scrapes up to 20 recent posts → AI evaluates Batch 45 curriculum → unlocks official module badges.
        </p>

        {/* Weekly Rule Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            color: '#475569',
            marginTop: '0.85rem',
            marginBottom: '0.5rem',
            background: '#f8fafc',
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            lineHeight: 1.45,
          }}
        >
          <span style={{ fontSize: '0.95rem' }}>🗓️</span>
          <span>
            <strong>Weekly Rule:</strong> Each member can submit their profile <strong>once per week</strong>. Weekly rankings update automatically.
          </span>
        </div>

        {error && (
          <div
            style={{
              padding: isAlreadySubmitted ? '1rem' : '0.75rem',
              background: isAlreadySubmitted ? '#fffbeb' : '#fef2f2',
              border: isAlreadySubmitted ? '1px solid #fde68a' : '1px solid #fee2e2',
              borderRadius: '10px',
              color: isAlreadySubmitted ? '#92400e' : '#ef4444',
              fontSize: '0.85rem',
              marginTop: '0.75rem',
              lineHeight: 1.5,
            }}
          >
            {isAlreadySubmitted && (
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#b45309' }}>
                <span>⏳</span> Weekly Submission Limit
              </div>
            )}
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '2.5rem 0', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3.5px solid #e2e8f0',
                borderTopColor: '#0284c7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem',
              }}
            />
            <div style={{ marginBottom: '0.5rem', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
              {stageLabelMap[stage] || stageMessage || 'Auditing candidate profile...'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {stageMessage}
            </div>
            {/* Progress Bar */}
            <div
              style={{
                height: '8px',
                background: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden',
                maxWidth: '85%',
                margin: '0 auto',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                  borderRadius: '4px',
                  width: `${progressPercent}%`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        ) : result ? (
          <div style={{ marginTop: '1.25rem' }}>
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🎉</span>
                <span style={{ fontWeight: 800, color: '#166534', fontSize: '1rem' }}>
                  {result.user?.name} is on the Leaderboard!
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.6 }}>
                <div>
                  • <strong>{result.posts?.length || result.user?.totalPostsScraped || 0} posts</strong> scraped from LinkedIn.
                </div>
                <div>
                  • <strong>{result.user?.verifiedPostsCount || 0} verified posts</strong> for CloudDevOpsHub community.
                </div>
                <div>
                  • Total Score: <strong>{result.user?.totalPoints || 0} pts</strong> (Rank #{result.user?.rank || 1}).
                </div>
              </div>
            </div>

            {/* Unlocked Badges Preview */}
            {result.unlockedBadges && result.unlockedBadges.length > 0 && (
              <div
                style={{
                  background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  color: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#38bdf8' }}>
                    🏅 Unlocked Curriculum Badges ({result.unlockedBadges.length}/10)
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Click badge to download/share</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                  {result.unlockedBadges.map((ub) => (
                    <div
                      key={ub.badgeId}
                      onClick={() => setSelectedBadge(ub)}
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                    >
                      <HexBadge badge={ub} isUnlocked={true} size="sm" showLockIcon={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {onViewPosts && (
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', fontSize: '0.88rem' }}
                  onClick={() => {
                    handleClose();
                    onViewPosts(result.user);
                  }}
                >
                  View Scraped Posts &amp; Badges ↗
                </button>
              )}
              <button
                type="button"
                className="btn btn-dark"
                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', fontSize: '0.88rem' }}
                onClick={handleClose}
              >
                Close &amp; View Board
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                required
                placeholder="e.g. Yogesh Giri"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                className="form-input"
                type="url"
                required
                placeholder="https://www.linkedin.com/in/your-username"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                Make sure your profile and posts are public so Apify can scrape your recent activity.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Cohort Batch</label>
              <BatchSelect
                value={form.batch}
                onChange={(val) => setForm({ ...form, batch: val })}
                pinnedBatch="Batch 44"
                placeholder="Select Cohort Batch"
              />
            </div>


            <button
              type="submit"
              className="btn btn-dark"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.5rem' }}
            >
              Scrape &amp; Audit Up to 20 Posts
            </button>
          </form>
        )}

        {/* Selected Badge Showcase Modal */}
        {selectedBadge && (
          <BadgeShowcaseModal
            isOpen={Boolean(selectedBadge)}
            onClose={() => setSelectedBadge(null)}
            badge={selectedBadge}
            user={result?.user}
            isUnlocked={true}
          />
        )}
      </div>
    </div>
  );
}
