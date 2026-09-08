import React, { useState, useRef, useEffect } from 'react';

/**
 * Custom Premium Batch Selector Component
 * Features:
 * - Pinned 'Batch 44 (Current Active Cohort)' with glowing badge
 * - Instant in-dropdown search/filter
 * - Custom styling matching dark/modern aesthetic
 * - Click-outside dismissal & smooth micro-interactions
 */
export default function BatchSelect({
  value,
  onChange,
  includeAllOption = false,
  pinnedBatch = 'Batch 44',
  placeholder = 'Select Cohort Batch',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Generate batches 40 to 50 only
  const allBatches = Array.from({ length: 11 }, (_, i) => `Batch ${40 + i}`);

  // Filtered batches
  const filteredBatches = allBatches.filter((b) =>
    b.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const handleSelect = (batchVal) => {
    onChange?.(batchVal);
    setIsOpen(false);
  };

  const getDisplayLabel = () => {
    if (value === 'All') return '🌐 All Batches (40 - 50)';
    if (value === pinnedBatch) return `🔥 ${pinnedBatch} (Currently Running)`;
    return value || placeholder;
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        width: '100%',
        minWidth: '220px',
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '0.6rem 0.9rem',
          background: '#ffffff',
          border: isOpen ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
          borderRadius: '10px',
          color: '#0f172a',
          fontSize: '0.86rem',
          fontWeight: '600',
          cursor: 'pointer',
          textAlign: 'left',
          boxShadow: isOpen
            ? '0 0 0 3px rgba(2, 132, 199, 0.15)'
            : '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {value === pinnedBatch && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 6px #ef4444',
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {getDisplayLabel()}
          </span>
        </div>

        {/* Chevron Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.04)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Quick Search Header */}
          <div
            style={{
              padding: '0.6rem 0.75rem',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '8px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search batch (e.g. 44)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.5rem 0.4rem 1.8rem',
                  fontSize: '0.8rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '7px',
                  background: '#ffffff',
                  outline: 'none',
                  color: '#0f172a',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Pinned Priority Item (Batch 44) */}
          {!searchTerm && (
            <div style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div
                onClick={() => handleSelect(pinnedBatch)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  background: value === pinnedBatch ? 'rgba(2, 132, 199, 0.1)' : 'rgba(239, 68, 68, 0.06)',
                  border: value === pinnedBatch ? '1.5px solid #0284c7' : '1px solid rgba(239, 68, 68, 0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.95rem' }}>🔥</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                      {pinnedBatch}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>
                      Current Active Cohort
                    </div>
                  </div>
                </div>
                {value === pinnedBatch && (
                  <span style={{ color: '#0284c7', fontWeight: 800, fontSize: '0.85rem' }}>✓</span>
                )}
              </div>
            </div>
          )}

          {/* Batches List */}
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '0.35rem 0.4rem',
            }}
          >
            {/* All Batches Option (if enabled) */}
            {includeAllOption && !searchTerm && (
              <div
                onClick={() => handleSelect('All')}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '7px',
                  background: value === 'All' ? '#f1f5f9' : 'transparent',
                  color: value === 'All' ? '#0284c7' : '#334155',
                  fontWeight: value === 'All' ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => {
                  if (value !== 'All') e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (value !== 'All') e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>🌐 All Batches (40 - 50)</span>
                {value === 'All' && <span style={{ color: '#0284c7', fontWeight: 800 }}>✓</span>}
              </div>
            )}

            {filteredBatches.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                }}
              >
                No batches found matching "{searchTerm}"
              </div>
            ) : (
              filteredBatches.map((batchName) => {
                const isSelected = value === batchName;
                const isPinned = batchName === pinnedBatch;

                return (
                  <div
                    key={batchName}
                    onClick={() => handleSelect(batchName)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: '7px',
                      background: isSelected ? '#f1f5f9' : 'transparent',
                      color: isSelected ? '#0284c7' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1px',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{batchName}</span>
                      {isPinned && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '9999px',
                            background: '#fee2e2',
                            color: '#ef4444',
                            fontWeight: 700,
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    {isSelected && <span style={{ color: '#0284c7', fontWeight: 800 }}>✓</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
