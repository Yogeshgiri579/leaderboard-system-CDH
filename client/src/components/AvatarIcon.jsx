import React from 'react';

const COLORS = 12;

function hash(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % COLORS;
}

function initials(name = '') {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

export default function Avatar({ name = '', size = 'md' }) {
  const cls = { sm: 'av av-sm', md: 'av av-md', lg: 'av av-lg' }[size] || 'av av-md';
  return <div className={`${cls} av-${hash(name)}`}>{initials(name)}</div>;
}
