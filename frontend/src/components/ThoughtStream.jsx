import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TOOL_ICONS = {
  web_search:    { icon: '⌕', color: '#7c5cfc', bg: 'rgba(124,92,252,0.12)', label: 'Web Search' },
  execute_code:  { icon: '◈', color: '#00d4aa', bg: 'rgba(0,212,170,0.12)',  label: 'Execute Code' },
  fetch_webpage: { icon: '⊹', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Fetch Page' },
  calculate:     { icon: '∑', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Calculate' },
  read_file:     { icon: '◻', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Read File' },
  write_file:    { icon: '◼', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Write File' },
};

function ThoughtBubble({ event }) {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex', gap: 12, padding: '14px 0',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
        background: 'rgba(124,92,252,0.1)',
        border: '1px solid rgba(124,92,252,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: '#a78bfa',
      }}>
        ◎
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: 11, 
          color: isDark ? '#6b6b8a' : '#666666', 
          marginBottom: 4, 
          letterSpacing: '0.08em', 
          textTransform: 'uppercase' 
        }}>
          Reasoning
        </div>
        <div style={{ 
          fontSize: 14, 
          color: isDark ? '#c8c8e0' : '#000000',  // Black in light mode
          lineHeight: 1.65, 
          whiteSpace: 'pre-wrap' 
        }}>
          {event.content}
        </div>
      </div>
    </motion.div>
  );
}

function ToolCallCard({ event }) {
  const { isDark } = useTheme();
  const meta = TOOL_ICONS[event.tool_name] || { icon: '⚙', color: '#6b6b8a', bg: 'rgba(107,107,138,0.12)', label: event.tool_name };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        margin: '10px 0',
        border: `1px solid ${meta.color}30`,
        borderRadius: 12,
        overflow: 'hidden',
        background: isDark ? meta.bg : `${meta.color}10`,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        borderBottom: `1px solid ${meta.color}20`,
      }}>
        <span style={{ fontSize: 18, color: meta.color }}>{meta.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: meta.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {meta.label}
        </span>
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, color: isDark ? '#6b6b8a' : '#666666',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: meta.color,
            boxShadow: `0 0 6px ${meta.color}`,
            animation: 'pulse-ring 1.2s ease infinite',
          }} />
          Running
        </div>
      </div>
      {event.tool_input && (
        <pre style={{
          fontFamily: 'var(--mono)', fontSize: 12, color: isDark ? '#a0a0c0' : '#333333',
          padding: '10px 14px', margin: 0, overflowX: 'auto',
          background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
          maxHeight: 120, overflowY: 'auto',
        }}>
          {JSON.stringify(event.tool_input, null, 2)}
        </pre>
      )}
    </motion.div>
  );
}

function ToolResultCard({ event }) {
  const { isDark } = useTheme();
  const meta = TOOL_ICONS[event.tool_name] || { icon: '⚙', color: '#6b6b8a', bg: 'rgba(107,107,138,0.06)', label: event.tool_name };
  const content = typeof event.content === 'string' ? event.content : JSON.stringify(event.content, null, 2);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        marginBottom: 10,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px',
        background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.1)',
        borderBottom: `1px solid ${isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.2)'}`,
      }}>
        <span style={{ fontSize: 12, color: '#22c55e' }}>✓</span>
        <span style={{ fontSize: 11, color: '#22c55e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {meta.label} Result
        </span>
      </div>
      <pre style={{
        fontFamily: 'var(--mono)', fontSize: 12, color: isDark ? '#8888aa' : '#333333',
        padding: '10px 14px', margin: 0,
        maxHeight: 180, overflowY: 'auto',
        overflowX: 'auto',
        background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.03)',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {content.slice(0, 1200)}{content.length > 1200 ? '\n… (truncated)' : ''}
      </pre>
    </motion.div>
  );
}

function StatusBadge({ event }) {
  const { isDark } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: '#a78bfa',
        boxShadow: '0 0 8px rgba(167,139,250,0.6)',
      }} />
      <span style={{ fontSize: 12, color: isDark ? '#6b6b8a' : '#666666', fontStyle: 'italic' }}>{event.content}</span>
    </motion.div>
  );
}

export function ThoughtStream({ events, status, iteration }) {
  const { isDark } = useTheme();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  if (events.length === 0 && status === 'idle') return null;

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '0 4px',
    }}>
      <AnimatePresence initial={false}>
        {events.map((event, i) => {
          if (event.type === 'thought')      return <ThoughtBubble key={event.id || i} event={event} />;
          if (event.type === 'tool_call')    return <ToolCallCard  key={event.id || i} event={event} />;
          if (event.type === 'tool_result')  return <ToolResultCard key={event.id || i} event={event} />;
          if (event.type === 'status')       return <StatusBadge   key={event.id || i} event={event} />;
          return null;
        })}
      </AnimatePresence>

      {status === 'running' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}
        >
          <div style={{
            width: 16, height: 16,
            border: '2px solid rgba(124,92,252,0.3)',
            borderTopColor: '#7c5cfc',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 12, color: isDark ? '#6b6b8a' : '#666666' }}>
            Thinking... · Iteration {iteration}
          </span>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}