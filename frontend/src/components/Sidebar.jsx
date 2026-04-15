import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from '../context/HistoryContext';

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const STATUS_COLORS = {
  done:    '#22c55e',
  running: '#a78bfa',
  error:   '#ef4444',
};

export function Sidebar({ isOpen, onClose, onSelectSession }) {
  const { sessions, removeSession, clearAll } = useHistory();
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = sessions.filter(s =>
    s.task.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    if (confirmClear) { clearAll(); setConfirmClear(false); }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 320,
              zIndex: 300,
              background: 'var(--bg1)',
              borderRight: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>History</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sessions.length} sessions</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search sessions..."
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg2)',
                  color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* Session list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {filtered.length === 0 && (
                <div style={{
                  padding: 32, textAlign: 'center',
                  color: 'var(--text-dim)', fontSize: 13,
                }}>
                  {search ? 'No matching sessions' : 'No sessions yet'}
                </div>
              )}
              {filtered.map(session => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    margin: '2px 8px', borderRadius: 10,
                    cursor: 'pointer', position: 'relative',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div
                    onClick={() => { onSelectSession(session); onClose(); }}
                    style={{ padding: '10px 36px 10px 12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                        background: STATUS_COLORS[session.status] || '#6b6b8a',
                        boxShadow: session.status === 'running' ? `0 0 6px ${STATUS_COLORS.running}` : 'none',
                      }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                        {timeAgo(session.createdAt)}
                      </span>
                      <span style={{
                        marginLeft: 'auto', fontSize: 10,
                        padding: '2px 7px', borderRadius: 20,
                        background: `${STATUS_COLORS[session.status] || '#6b6b8a'}18`,
                        color: STATUS_COLORS[session.status] || '#6b6b8a',
                        textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {session.status}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 13, color: 'var(--text)',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      lineHeight: 1.5,
                    }}>
                      {session.task}
                    </div>
                    {session.toolsUsed?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {[...new Set(session.toolsUsed)].map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: '2px 6px', borderRadius: 6,
                            background: 'var(--bg3)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            fontFamily: 'var(--mono)',
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); removeSession(session.id); }}
                    style={{
                      position: 'absolute', top: 10, right: 8,
                      width: 24, height: 24, borderRadius: 6,
                      border: 'none', background: 'transparent',
                      color: 'var(--text-dim)', cursor: 'pointer', fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {sessions.length > 0 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleClear}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: confirmClear ? 'rgba(239,68,68,0.1)' : 'transparent',
                    color: confirmClear ? '#ef4444' : 'var(--text-muted)',
                    fontFamily: 'var(--font)', fontSize: 13, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {confirmClear ? 'Click again to confirm clear all' : 'Clear all history'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}