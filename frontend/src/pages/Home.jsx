import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TaskInput } from '../components/TaskInput';
import { Sidebar } from '../components/Sidebar';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useHistory } from '../context/HistoryContext';

const CAPABILITIES = [
  { icon: '⌕', title: 'Web Search',     desc: 'Real-time internet research',         color: '#7c5cfc' },
  { icon: '◈', title: 'Code Execution', desc: 'Write & run Python autonomously',      color: '#00d4aa' },
  { icon: '⊹', title: 'Web Scraping',   desc: 'Extract content from any URL',        color: '#f59e0b' },
  { icon: '∑', title: 'Calculator',     desc: 'Complex math expression evaluation',  color: '#a78bfa' },
  { icon: '◻', title: 'File I/O',       desc: 'Read and write local files',          color: '#22c55e' },
  { icon: '◎', title: 'Reasoning',      desc: 'Multi-step autonomous decisions',     color: '#f472b6' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { sessions } = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = (task) => navigate('/agent', { state: { task } });

  const handleSelectSession = (session) => {
    navigate('/agent', { state: { task: session.task, sessionId: session.id, replay: true } });
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="orb orb-purple" />
      <div className="orb orb-teal" />
      <div className="grid-bg" />

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 24px',
        background: isDark ? 'rgba(5,5,8,0.7)' : 'rgba(246,245,255,0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 14px', borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg2)',
            color: 'var(--text-muted)',
            fontFamily: 'Syne, sans-serif',
            fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          ☰ History {sessions.length > 0 && <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 11, marginLeft: 2 }}>{sessions.length}</span>}
        </button>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onSelectSession={handleSelectSession} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 820, margin: '0 auto', padding: '120px 24px 60px',
        width: '100%',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 56 }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: 22, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, var(--accent-glow), var(--teal-glow))',
            border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, position: 'relative',
          }}>
            ◈
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent-light)', marginBottom: 14, fontWeight: 600 }}>
            Autonomous Research & Intelligence Agent
          </div>
          <h1 style={{
            fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, lineHeight: 1.0,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, var(--text) 0%, var(--accent-light) 50%, var(--teal) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 20,
          }}>
            ARIA
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Give me any task. I'll think, search, code, and reason my way to a complete answer — completely autonomously.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 56 }}>
          <TaskInput onSubmit={handleSubmit} isRunning={false} onStop={() => {}} />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'center', marginBottom: 18 }}>
            Capabilities
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                style={{
                  padding: '16px 18px', borderRadius: 14,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${cap.color}40`; e.currentTarget.style.background = `${cap.color}0a`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg2)'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${cap.color}18`, border: `1px solid ${cap.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: cap.color }}>
                  {cap.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{cap.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{cap.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Powered by <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Google</span> · Gemini 2.5-Flash · Free tier
          </div>
        </motion.div>
      </div>
    </div>
  );
}