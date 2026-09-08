import React from 'react';

export default function Header({ onOpenSubmit }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-name">CloudDevOpsHub</span>
              <span className="brand-tag">Leaderboard</span>
            </div>
            <div className="brand-sub">Mentorship by <strong>Vikas Ratnawat</strong> · Official Cohort Platform</div>
          </div>
        </div>
        <button className="btn btn-dark" onClick={onOpenSubmit} id="btn-submit-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Submit Profile
        </button>
      </div>
    </header>
  );
}
