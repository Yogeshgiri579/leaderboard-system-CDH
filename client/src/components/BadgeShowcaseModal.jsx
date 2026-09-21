import React, { useRef, useState } from 'react';
import HexBadge from './HexBadge';
import { LinkedInIcon, TwitterXIcon, WhatsAppIcon, FacebookIcon } from './SocialIcons';

export default function BadgeShowcaseModal({
  isOpen,
  onClose,
  badge,
  user,
  isUnlocked = false,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const svgWrapperRef = useRef(null);

  if (!isOpen || !badge) return null;

  const candidateName = user?.name || 'DevOps Candidate';
  const fullBadgeTitle = `${badge.code}: ${badge.title} ${badge.subtitle || ''}`.trim();
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://clouddevopshub.com';

  // Formatted share text tailored for LinkedIn and Social platforms
  const shareText = `🚀 Proud to announce that I unlocked the official "${fullBadgeTitle}" badge on the CloudDevOpsHub Leaderboard!

Mentored by Vikas Ratnawat in the Batch 45 Multi-Cloud & DevOps with AI cohort. Hands-on projects, industry architectures, and community-driven learning! 💡

Check out my profile and the community leaderboard:
${currentUrl}

#CloudDevOpsHub #VikasRatnawat #DevOps #MultiCloud #Kubernetes #AWS #Terraform #ContinuousLearning`;

  // Download high-resolution PNG with Official Candidate Verification Watermark
  const handleDownload = async () => {
    try {
      setDownloading(true);
      const svgElement = svgWrapperRef.current?.querySelector('svg');
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        // High-DPI certificate canvas
        const width = 800;
        const height = 1020;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Dark modern background card
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle decorative border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 4;
        ctx.strokeRect(16, 16, width - 32, height - 32);

        // Header branding
        ctx.font = '700 24px "Inter", system-ui, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('CloudDevOpsHub', width / 2, 60);

        ctx.font = '600 15px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('COMMUNITY LEADERBOARD · VERIFIED CREDENTIAL', width / 2, 88);

        // Draw hexagon badge centered
        const badgeWidth = 520;
        const badgeHeight = 598;
        const badgeX = (width - badgeWidth) / 2;
        const badgeY = 110;
        ctx.drawImage(image, badgeX, badgeY, badgeWidth, badgeHeight);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(80, 735);
        ctx.lineTo(width - 80, 735);
        ctx.stroke();

        // Recipient Name & Verification Details (Anti-impersonation watermark)
        ctx.font = '800 32px "Inter", system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(candidateName, width / 2, 785);

        ctx.font = '600 18px "Inter", system-ui, sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`✓ Verified Unlocked · ${user?.batch || 'Batch 45'}`, width / 2, 825);

        ctx.font = '500 16px "Inter", system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          `${badge.fullTitle || badge.title} · Mentor: Vikas Ratnawat`,
          width / 2,
          865
        );

        // Security / Credential Watermark ID
        const credId = `CDH-${(user?._id || 'VERIFIED').toString().slice(-6).toUpperCase()}-${badge.badgeId || badge.id || 'MOD'}`;
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`CREDENTIAL ID: ${credId} · clouddevopshub.com`, width / 2, 920);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `CloudDevOpsHub_${badge.code?.replace(/\s+/g, '_')}_${candidateName.replace(/\s+/g, '_')}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
        setDownloading(false);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Download error:', err);
      setDownloading(false);
    }
  };

  // 1-Click Social Sharing
  const shareToLinkedIn = () => {
    const encodedText = encodeURIComponent(shareText);
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`;
    window.open(url, '_blank', 'width=650,height=600');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `🏆 Just unlocked the "${fullBadgeTitle}" badge on the @CloudDevOpsHub Leaderboard! Mentored by Vikas Ratnawat.`
    );
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}&hashtags=CloudDevOpsHub,DevOps,VikasRatnawat`;
    window.open(url, '_blank', 'width=600,height=450');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}`);
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=500');
  };

  const copyBragCard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay fade-in" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '95%',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          color: '#f8fafc',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94a3b8',
          }}
        >
          ✕
        </button>

        {/* Badge Preview */}
        <div
          ref={svgWrapperRef}
          style={{
            margin: '0 auto 1.5rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <HexBadge
            badge={badge}
            isUnlocked={isUnlocked}
            size="lg"
            showLockIcon={false}
          />
        </div>

        {/* Status Pill with 5-Post Verification Count */}
        <div style={{ marginBottom: '0.85rem' }}>
          {isUnlocked ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                fontSize: '0.85rem',
                fontWeight: '700',
              }}
            >
              ✓ Unlocked ({badge.postCount || 5}/5 Verified Posts) · {candidateName}
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.35rem 1rem',
                borderRadius: '9999px',
                background: 'rgba(148, 163, 184, 0.15)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                color: '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: '600',
              }}
            >
              🔒 Locked ({badge.postCount || 0}/5 Posts · Need {Math.max(0, 5 - (badge.postCount || 0))} more)
            </span>
          )}
        </div>

        {/* 5-Post Category Progress Bar */}
        <div style={{ margin: '0 auto 1.25rem', maxWidth: '380px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
            <span>Curriculum Category Requirement (Min. 5 Posts)</span>
            <span style={{ fontWeight: 700, color: isUnlocked ? '#34d399' : '#38bdf8' }}>
              {badge.postCount || (isUnlocked ? 5 : 0)} / 5 ({Math.min(100, Math.round(((badge.postCount || (isUnlocked ? 5 : 0)) / 5) * 100))}%)
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div
              style={{
                width: `${Math.min(100, Math.round(((badge.postCount || (isUnlocked ? 5 : 0)) / 5) * 100))}%`,
                height: '100%',
                background: isUnlocked
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)',
                borderRadius: '9999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Title & Description */}
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '0.4rem', color: '#ffffff' }}>
          {badge.fullTitle || `${badge.title} ${badge.subtitle}`}
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.25rem' }}>
          {badge.description || 'Master key DevOps modules and share verified learning achievements on LinkedIn.'}
        </p>

        {/* Evidence Link if Unlocked */}
        {isUnlocked && badge.evidencePostUrl && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <a
              href={badge.evidencePostUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.85rem',
                color: '#38bdf8',
                textDecoration: 'underline',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🔗 View Verified LinkedIn Post
            </a>
          </div>
        )}

        {/* Action Buttons: Download & Social Shares */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Download Button */}
          {isUnlocked && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: downloading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              📥 {downloading ? 'Generating High-Res PNG...' : 'Download Badge (High-Res PNG)'}
            </button>
          )}

          {/* Share Grid */}
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.6rem', fontWeight: '600' }}>
              SHARE YOUR ACHIEVEMENT
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
              }}
            >
              {/* LinkedIn */}
              <button
                onClick={shareToLinkedIn}
                style={{
                  background: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.15s ease',
                }}
                title="Share to LinkedIn"
              >
                <LinkedInIcon size={18} color="#ffffff" />
                <span>LinkedIn</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={shareToTwitter}
                style={{
                  background: '#000000',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '10px',
                  padding: '0.65rem 0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.15s ease',
                }}
                title="Share to X (Twitter)"
              >
                <TwitterXIcon size={16} color="#ffffff" />
                <span>Twitter</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                style={{
                  background: '#25d366',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.15s ease',
                }}
                title="Share to WhatsApp"
              >
                <WhatsAppIcon size={18} color="#ffffff" />
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareToFacebook}
                style={{
                  background: '#1877f2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'transform 0.15s ease',
                }}
                title="Share to Facebook"
              >
                <FacebookIcon size={18} color="#ffffff" />
                <span>Facebook</span>
              </button>
            </div>

            {/* Copy Card Button */}
            <button
              onClick={copyBragCard}
              style={{
                marginTop: '0.8rem',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '0.6rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              📋 {copied ? 'Copied to Clipboard! 🎉' : 'Copy Share Text & Hashtags'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
