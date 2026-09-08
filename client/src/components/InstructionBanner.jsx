import React from 'react';

const RULES = [
  { n: 'Rule 01', title: 'Mandatory Mentions', desc: 'Tag mentor Vikas Ratnawat and include the hashtag #CloudDevOpsHub in every LinkedIn post.', label: 'Per contribution', pts: '+30 pts' },
  { n: 'Rule 02', title: 'Verified Technical Content', desc: 'Posts covering Kubernetes, AWS, Docker, Terraform, CI/CD, or Observability earn base points.', label: 'Base contribution', pts: '+50 pts' },
  { n: 'Rule 03', title: 'Quality & Impact', desc: 'Architecture write-ups, code snippets, diagrams and peer interactions earn bonus multipliers.', label: 'Quality bonus', pts: 'Up to +45 pts' },
];

export default function InstructionBanner({ onOpenSubmit }) {
  return (
    <div>
      {/* Hero CTA */}
      <div className="hero-banner">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div className="hero-eyebrow">Community Guidelines &amp; Points System</div>
          <h2 className="hero-title">How to Rank Up &amp; Earn Points</h2>
          <p className="hero-desc">Share your daily hands-on DevOps journey on LinkedIn. Contributions are automatically verified and indexed for cohort ranking.</p>
        </div>
        <button className="btn btn-outline btn-lg" onClick={onOpenSubmit} style={{ flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Sync My Profile Now
        </button>
      </div>

      {/* Rules */}
      <div className="rules-grid">
        {RULES.map((r, i) => (
          <div key={i} className="rule-card">
            <div>
              <div className="rule-num">{r.n}</div>
              <div className="rule-title">{r.title}</div>
              <div className="rule-desc">{r.desc}</div>
            </div>
            <div className="rule-footer">
              <span className="rule-label">{r.label}</span>
              <span className="rule-pts">{r.pts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
