import React from 'react';

const STEPS = [
  { n: 'Step 01', title: 'Complete the Module', desc: 'Share daily session summaries on LinkedIn with screenshots of your hands-on work. Tag CloudDevOpsHub & Vikas Ratnawat.' },
  { n: 'Step 02', title: 'Community Contribution', desc: 'Be active in the cohort group, help peers debug issues, and share technical learnings proactively.' },
  { n: 'Step 03', title: 'Share a Referral', desc: 'Share at least one open position from your company or network with the community.' },
];

export default function ModuleExpertGuide({ onOpenSubmit }) {
  return (
    <div className="expert-section">
      <div className="expert-header">
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontFamily: 'JetBrains Mono', marginBottom: '0.4rem' }}>New Initiative</div>
          <div className="expert-title">Become a Module Expert</div>
          <div className="expert-desc">Elevate from learner to community leader. Get certified, mentor peers, and earn exclusive recognition from Vikas Ratnawat.</div>
        </div>
        <button className="btn btn-dark btn-lg" onClick={onOpenSubmit} style={{ flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Submit Profile for Evaluation
        </button>
      </div>

      <div className="steps-grid">
        {STEPS.map((s, i) => (
          <div key={i} className="step-card">
            <div className="step-number">{s.n}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.2rem' }}>Selection Process</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.65, maxWidth: '440px' }}>A community poll is created at the end of every module. Members vote based on LinkedIn post frequency, hands-on depth, and peer mentoring activity.</div>
        </div>
        <button className="btn btn-outline" onClick={onOpenSubmit}>Check My Eligibility</button>
      </div>
    </div>
  );
}
