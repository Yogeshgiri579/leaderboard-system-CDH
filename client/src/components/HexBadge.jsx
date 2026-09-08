import React from 'react';

/**
 * Pixel-Perfect Hexagonal Curriculum Badge Component
 * Symmetrically arranged to guarantee:
 * - Zero border clipping for long words (e.g. 'FOUNDATIONS')
 * - Footer 'DevOps Micro Internship' safely inside wide vertical zone
 * - Clean, crisp typography matching official reference design
 */
export default function HexBadge({
  badge,
  isUnlocked = false,
  size = 'md', // 'sm', 'md', 'lg'
  onClick,
  showLockIcon = true,
  className = '',
}) {
  const sizeMap = {
    sm: { width: 56, height: 64 },
    md: { width: 96, height: 110 },
    lg: { width: 192, height: 220 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const color = isUnlocked ? (badge?.color || '#00838f') : '#475569';
  const badgeId = (badge?.badgeId || badge?.id || 'MOD').replace(/[^a-zA-Z0-9]/g, '_');
  const gradId = `hexGrad_${badgeId}_${size}_${isUnlocked ? 'unlocked' : 'locked'}`;

  // Symmetrical Pointy-Topped Hexagon (viewBox: 0 0 100 115)
  // Vertical side walls span from y=30 to y=85 where width is at its maximum (90 units wide)
  const hexPoints = '50,3 95,29 95,85 50,111 5,85 5,29';
  const innerPoints = '50,6 92,31 92,83 50,108 8,83 8,31';

  // Format strings
  const moduleCode = (badge?.code || `MODULE ${badge?.moduleNumber || '01'}`).toUpperCase().trim();
  const rawTitle = (badge?.title || 'DEVOPS').toUpperCase().trim();
  const rawSub = (badge?.subtitle || '').toUpperCase().trim();

  // Dynamic font sizing so text never touches or overflows border
  let titleFontSize = 13.0;
  let titleLetterSpacing = '0.8';
  if (rawTitle.length >= 11) {
    titleFontSize = 7.5; // 'FOUNDATIONS' (11 chars -> ~44 units wide inside 84 width)
    titleLetterSpacing = '0.3';
  } else if (rawTitle.length >= 9) {
    titleFontSize = 8.5; // 'TERRAFORM'
    titleLetterSpacing = '0.5';
  } else if (rawTitle.length >= 7) {
    titleFontSize = 9.8; // 'CAPSTONE'
    titleLetterSpacing = '0.6';
  } else if (rawTitle.length >= 5) {
    titleFontSize = 11.2; // 'DOCKER', 'PYTHON', 'LINUX', 'AZURE', 'CI/CD', 'CAREER'
    titleLetterSpacing = '0.8';
  } else {
    titleFontSize = 14.5; // 'AWS', 'TF'
    titleLetterSpacing = '1.2';
  }

  let subFontSize = 6.0;
  let subLetterSpacing = '0.8';
  if (rawSub.length >= 13) {
    subFontSize = 4.6; // '9 REAL PROJECTS', 'CLOUD SERVICES', 'GIT & JENKINS'
    subLetterSpacing = '0.4';
  } else if (rawSub.length >= 10) {
    subFontSize = 5.0; // '& KUBERNETES', 'UBUNTU + GCP', '& AUTOMATION', 'AIOPS + GENAI', '& REFERRALS'
    subLetterSpacing = '0.5';
  } else if (rawSub.length >= 7) {
    subFontSize = 5.6; // '& ANSIBLE'
    subLetterSpacing = '0.7';
  } else if (rawSub.length <= 4) {
    subFontSize = 7.0; // '& AI'
    subLetterSpacing = '1.2';
  }

  return (
    <div
      className={`hex-badge-container ${isUnlocked ? 'unlocked' : 'locked'} ${className}`}
      onClick={onClick}
      style={{
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        filter: isUnlocked
          ? 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.28))'
          : 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))',
        opacity: isUnlocked ? 1 : 0.65,
        userSelect: 'none',
      }}
      title={
        isUnlocked
          ? `${badge?.fullTitle || badge?.title} (Unlocked)`
          : `${badge?.fullTitle || badge?.title} (Locked)`
      }
    >
      <svg
        viewBox="0 0 100 115"
        width={currentSize.width}
        height={currentSize.height}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          {isUnlocked ? (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={adjustColorBrightness(color, 25)} />
              <stop offset="55%" stopColor={color} />
              <stop offset="100%" stopColor={adjustColorBrightness(color, -25)} />
            </linearGradient>
          ) : (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          )}

          {/* Bevel highlight */}
          <linearGradient id={`bevel_${gradId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="40%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.35)" />
          </linearGradient>
        </defs>

        {/* Outer Hexagon Border */}
        <polygon
          points={hexPoints}
          fill="none"
          stroke={isUnlocked ? '#ffffff' : 'rgba(255, 255, 255, 0.35)'}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Inner Solid Hexagon */}
        <polygon
          points={innerPoints}
          fill={`url(#${gradId})`}
          stroke={`url(#bevel_${gradId})`}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Top Header: Module Label (y=25, positioned securely inside hexagon safe zone) */}
        <text
          x="50"
          y="25"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="5.0"
          fontWeight="800"
          letterSpacing="0.8"
          opacity={isUnlocked ? 0.95 : 0.75}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          {moduleCode}
        </text>

        {/* Accent Divider Line */}
        <line
          x1="38"
          y1="29"
          x2="62"
          y2="29"
          stroke="#ffffff"
          strokeWidth="0.75"
          opacity={isUnlocked ? 0.45 : 0.25}
        />

        {/* Center Primary Title (y=45, centered in maximum width zone with 20+ units of padding) */}
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fill="#ffffff"
          fontSize={titleFontSize}
          fontWeight="900"
          letterSpacing={titleLetterSpacing}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          {rawTitle}
        </text>

        {/* Subtitle Descriptor (y=57, balanced spacing below primary title) */}
        <text
          x="50"
          y="57"
          textAnchor="middle"
          fill="#ffffff"
          fontSize={subFontSize}
          fontWeight="800"
          letterSpacing={subLetterSpacing}
          opacity={isUnlocked ? 0.95 : 0.75}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          {rawSub}
        </text>

        {/* Brand Footer: CloudDevOpsHub (y=73, safely inside the straight vertical zone with ample clearance) */}
        <text
          x="50"
          y="73"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="4.2"
          fontWeight="700"
          letterSpacing="0.8"
          opacity={isUnlocked ? 0.95 : 0.7}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        >
          CloudDevOpsHub
        </text>

        {/* Prestige 3-Star Anchor in Bottom Triangle (y=86) */}
        <g opacity={isUnlocked ? 0.95 : 0.5}>
          <circle cx="43" cy="85.5" r="1.1" fill="#ffffff" opacity="0.6" />
          <polygon
            points="50,82 51.3,84.6 54.2,84.6 51.9,86.2 52.8,88.8 50,87.2 47.2,88.8 48.1,86.2 45.8,84.6 48.7,84.6"
            fill="#facc15"
          />
          <circle cx="57" cy="85.5" r="1.1" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Lock Overlay Icon if Locked */}
        {!isUnlocked && showLockIcon && (
          <g transform="translate(42, 67) scale(0.7)">
            <rect x="2" y="7" width="18" height="13" rx="3" fill="#cbd5e1" />
            <path
              d="M6 7V5a5 5 0 0 1 10 0v2"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="11" cy="13.5" r="1.5" fill="#1e293b" />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Darken / lighten a hex color
 */
function adjustColorBrightness(hex, percent) {
  if (!hex || hex[0] !== '#') return hex;
  let num = parseInt(hex.slice(1), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
