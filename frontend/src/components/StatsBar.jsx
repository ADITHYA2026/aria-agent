import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export function StatsBar({ events, iteration, status }) {
  const { isDark } = useTheme();
  const thoughts    = events.filter(e => e.type === 'thought').length;
  const toolCalls   = events.filter(e => e.type === 'tool_call').length;
  const toolResults = events.filter(e => e.type === 'tool_result').length;

  const stats = [
    { label: 'Iterations', value: iteration,   color: '#a78bfa' },
    { label: 'Thoughts',   value: thoughts,    color: '#7c5cfc' },
    { label: 'Tool calls', value: toolCalls,   color: '#00d4aa' },
    { label: 'Results',    value: toolResults, color: '#f59e0b' },
  ];

  // Normalise status so any "finished successfully" value shows green,
  // and only an explicit 'error' value shows red.
  // SSE stream sends:   'running' | 'done' | 'completed' | 'error'
  // Backend Redis sends: 'running' | 'completed' | 'error'
  const isDone    = status === 'done' || status === 'completed';
  const isRunning = status === 'running';
  const isError   = status === 'error';

  const statusColor  = isRunning ? '#a78bfa' : isDone ? '#22c55e' : '#ef4444';
  const statusBg     = isRunning
    ? (isDark ? 'rgba(124,92,252,0.06)' : 'rgba(124,92,252,0.08)')
    : isDone
      ? (isDark ? 'rgba(34,197,94,0.06)'  : 'rgba(34,197,94,0.08)')
      : (isDark ? 'rgba(239,68,68,0.06)'  : 'rgba(239,68,68,0.08)');
  const statusBorder = isRunning
    ? 'rgba(124,92,252,0.2)'
    : isDone
      ? 'rgba(34,197,94,0.2)'
      : 'rgba(239,68,68,0.2)';
  const statusLabel  = isRunning ? 'Running' : isDone ? '✓ Done' : '✗ Error';

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 0',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
      marginBottom: 12,
    }}>
      {stats.map(s => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: s.color, lineHeight: 1 }}>
            {s.value}
          </div>
          <div style={{ fontSize: 11, color: isDark ? '#6b6b8a' : '#666666', marginTop: 4, letterSpacing: '0.04em' }}>
            {s.label}
          </div>
        </motion.div>
      ))}

      <motion.div
        style={{
          flex: 1, padding: '10px 14px', borderRadius: 10,
          background: statusBg,
          border: `1px solid ${statusBorder}`,
          textAlign: 'center',
        }}
      >
        <div style={{
          fontSize: 13, fontWeight: 600, color: statusColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {isRunning && (
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#a78bfa',
              boxShadow: '0 0 8px rgba(167,139,250,0.8)',
              display: 'inline-block',
              animation: 'pulse-ring 1s ease infinite',
            }} />
          )}
          {statusLabel}
        </div>
        <div style={{
          fontSize: 11,
          color: isDark ? '#6b6b8a' : '#666666',
          marginTop: 4,
          letterSpacing: '0.04em',
        }}>
          Status
        </div>
      </motion.div>
    </div>
  );
}