import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const EXAMPLES = [
  "Research the top 5 AI companies in 2025 and summarize their latest products",
  "Write a Python script that generates Fibonacci numbers up to 1000 and run it",
  "Search for the latest news about quantum computing and write a brief report",
  "Calculate compound interest on $10,000 at 7% for 20 years",
  "Fetch the Wikipedia page for Alan Turing and summarize his key contributions",
];

export function TaskInput({ onSubmit, isRunning, onStop }) {
  const { isDark } = useTheme();
  const [task, setTask] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [task]);

  const handleSubmit = () => {
    if (!task.trim() || isRunning) return;
    onSubmit(task.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Example pills */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16,
      }}>
        {EXAMPLES.slice(0, 3).map((ex, i) => (
          <button
            key={i}
            onClick={() => setTask(ex)}
            disabled={isRunning}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
              color: isDark ? '#8888aa' : '#666',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font)',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'rgba(124,92,252,0.4)';
              e.target.style.color = '#a78bfa';
              e.target.style.background = 'rgba(124,92,252,0.06)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
              e.target.style.color = isDark ? '#8888aa' : '#666';
              e.target.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
            }}
          >
            {ex.slice(0, 40)}…
          </button>
        ))}
      </div>

      {/* Input box */}
      <motion.div
        animate={{ 
          borderColor: focused 
            ? 'rgba(124,92,252,0.5)' 
            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)',
          boxShadow: focused ? '0 0 0 3px rgba(124,92,252,0.1)' : 'none',
        }}
        style={{
          display: 'flex', gap: 12, alignItems: 'flex-end',
          border: '1px solid',
          borderRadius: 16,
          padding: '14px 14px 14px 18px',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
        }}
      >
        <textarea
          ref={textareaRef}
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Give ARIA a task to complete autonomously..."
          disabled={isRunning}
          rows={1}
          style={{
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            outline: 'none',
            color: isDark ? '#e8e8f0' : '#1a1a2e',  // Light text in dark mode, dark text in light mode
            fontFamily: 'var(--font)', 
            fontSize: 15,
            resize: 'none', 
            lineHeight: 1.6,
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {isRunning ? (
            <button
              onClick={onStop}
              style={{
                padding: '8px 18px', 
                borderRadius: 10,
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444', 
                fontFamily: 'var(--font)',
                fontSize: 13, 
                fontWeight: 600, 
                cursor: 'pointer',
              }}
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!task.trim()}
              style={{
                padding: '8px 20px', 
                borderRadius: 10,
                background: task.trim() ? 'linear-gradient(135deg, #7c5cfc, #a78bfa)' : (isDark ? 'rgba(124,92,252,0.1)' : 'rgba(0,0,0,0.1)'),
                border: 'none',
                color: task.trim() ? '#fff' : (isDark ? '#4444aa' : '#999'),
                fontFamily: 'var(--font)',
                fontSize: 13, 
                fontWeight: 600,
                cursor: task.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: task.trim() ? '0 4px 20px rgba(124,92,252,0.3)' : 'none',
              }}
            >
              Run ↵
            </button>
          )}
        </div>
      </motion.div>
      <div style={{ 
        marginTop: 8, 
        fontSize: 11, 
        color: isDark ? '#3a3a5c' : '#aaa',
        textAlign: 'right' 
      }}>
        Ctrl + Enter to run
      </div>
    </div>
  );
}