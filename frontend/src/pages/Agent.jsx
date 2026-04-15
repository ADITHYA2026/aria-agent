import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgent } from '../hooks/useAgent';
import { ThoughtStream } from '../components/ThoughtStream';
import { FinalAnswer } from '../components/FinalAnswer';
import { StatsBar } from '../components/StatsBar';
import { TaskInput } from '../components/TaskInput';
import { Sidebar } from '../components/Sidebar';
import { ThemeToggle } from '../components/ThemeToggle';
import { ExportPDF } from '../components/ExportPDF';
import { useTheme } from '../context/ThemeContext';
import { useHistory } from '../context/HistoryContext';
import { useState } from 'react';

export default function AgentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { addSession, updateSession } = useHistory();
  const task = location.state?.task;
  const initialSessionId = location.state?.sessionId;

  const { events, status, sessionId, finalAnswer, iteration, runTask, reset, stop } = useAgent();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sessionCreated = useRef(false);

  useEffect(() => {
    if (task) runTask(task);
    else navigate('/');
  }, []);

  // Save to history when task starts
  useEffect(() => {
    if (sessionId && task && !sessionCreated.current) {
      sessionCreated.current = true;
      addSession({
        id: sessionId,
        task,
        status: 'running',
        createdAt: new Date().toISOString(),
        toolsUsed: [],
      });
    }
  }, [sessionId]);

  // Update history on status/tool changes
  useEffect(() => {
    if (sessionId && sessionCreated.current) {
      const toolsUsed = events.filter(e => e.type === 'tool_call').map(e => e.tool_name).filter(Boolean);
      updateSession(sessionId, { status, toolsUsed, finalAnswer: finalAnswer || undefined });
    }
  }, [status, events.length, finalAnswer]);

  const handleNewTask = (newTask) => {
    sessionCreated.current = false;
    reset();
    runTask(newTask);
    navigate('/agent', { state: { task: newTask }, replace: true });
  };

  const handleSelectSession = (session) => {
    setSidebarOpen(false);
    sessionCreated.current = false;
    reset();
    navigate('/agent', { state: { task: session.task } });
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div className="orb orb-purple" style={{ opacity: 0.5 }} />
      <div className="orb orb-teal" style={{ opacity: 0.35 }} />
      <div className="grid-bg" />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onSelectSession={handleSelectSession} />

      {/* Navbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(20px)',
        background: isDark ? 'rgba(5,5,8,0.85)' : 'rgba(246,245,255,0.88)',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={() => { reset(); navigate('/'); }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'Syne, sans-serif', padding: '4px 8px', borderRadius: 8, transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-light)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          ← ARIA
        </button>

        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg2)',
            color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif',
            fontSize: 12, cursor: 'pointer',
          }}
        >
          ☰ History
        </button>

        <div style={{
          flex: 1, fontSize: 13, color: 'var(--text-muted)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task}
        </div>

        {/* Export PDF — only when done */}
        {finalAnswer && (
          <ExportPDF task={task} events={events} finalAnswer={finalAnswer} sessionId={sessionId} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          {status === 'running' && (
            <>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-light)', flexShrink: 0, boxShadow: '0 0 8px var(--accent)', animation: 'pulse-ring 1s ease infinite', display: 'inline-block' }} />
              Live
            </>
          )}
          {status === 'done'  && <span style={{ color: 'var(--green)' }}>✓ Complete</span>}
          {status === 'error' && <span style={{ color: 'var(--red)' }}>✗ Error</span>}
        </div>

        <ThemeToggle />
      </div>

      {/* Main layout */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: '1fr 360px',
        maxWidth: 1320, margin: '0 auto', width: '100%',
        minHeight: 'calc(100vh - 53px)',
      }}>
        {/* Left: thought stream */}
        <div style={{
          padding: '28px 32px',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto', maxHeight: 'calc(100vh - 53px)',
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 8 }}>
              Agent thought stream
            </div>
            {(events.length > 0 || status !== 'idle') && (
              <StatsBar events={events} iteration={iteration} status={status} />
            )}
          </div>
          <ThoughtStream events={events} status={status} iteration={iteration} />
          <FinalAnswer answer={finalAnswer} />
        </div>

        {/* Right: controls */}
        <div style={{
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', gap: 24,
          overflowY: 'auto', maxHeight: 'calc(100vh - 53px)',
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Current task</div>
            <div style={{
              padding: '12px 16px', borderRadius: 12,
              background: 'var(--accent-glow)',
              border: '1px solid rgba(124,92,252,0.2)',
              fontSize: 14, color: 'var(--text)', lineHeight: 1.6,
            }}>
              {task}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Run new task</div>
            <TaskInput onSubmit={handleNewTask} isRunning={status === 'running'} onStop={stop} />
          </div>

          {/* Tool status */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 10 }}>Tool status</div>
            {[
              ['⌕', 'web_search',    '#7c5cfc'],
              ['◈', 'execute_code',  '#00d4aa'],
              ['⊹', 'fetch_webpage', '#f59e0b'],
              ['∑', 'calculate',     '#a78bfa'],
              ['◻', 'read_file',     '#22c55e'],
              ['◼', 'write_file',    '#ef4444'],
            ].map(([icon, name, color]) => {
              const used = events.some(e => e.tool_name === name);
              return (
                <div key={name} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: used ? color : 'var(--text-dim)', width: 18, textAlign: 'center', fontSize: 15, transition: 'color 0.3s' }}>{icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: used ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.3s' }}>{name}</span>
                  <div style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: used ? color : 'var(--border)',
                    boxShadow: used ? `0 0 6px ${color}` : 'none',
                    transition: 'all 0.3s',
                  }} />
                </div>
              );
            })}
          </div>

          {/* Model info */}
          <div style={{ marginTop: 'auto', padding: '14px 16px', borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Model</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent-light)' }}>llama-3.3-70b-versatile</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>via Groq · Free tier · ~14k req/day</div>
          </div>
        </div>
      </div>
    </div>
  );
}