import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function FinalAnswer({ answer }) {
  const { isDark } = useTheme();
  
  if (!answer) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        marginTop: 24,
        padding: '24px 28px',
        borderRadius: 16,
        background: isDark 
          ? 'linear-gradient(135deg, rgba(0,212,170,0.06), rgba(124,92,252,0.06))'
          : 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(124,92,252,0.08))',
        border: `1px solid ${isDark ? 'rgba(0,212,170,0.2)' : 'rgba(0,212,170,0.3)'}`,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #00d4aa, #7c5cfc)',
      }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: isDark ? 'rgba(0,212,170,0.15)' : 'rgba(0,212,170,0.2)',
          border: `1px solid ${isDark ? 'rgba(0,212,170,0.3)' : 'rgba(0,212,170,0.4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#00d4aa',
        }}>
          ✦
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#00d4aa', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Final Answer
        </span>
      </div>
      
      <div style={{
        fontSize: 15, 
        color: isDark ? '#d0d0e8' : '#000000',
        lineHeight: 1.75,
      }}>
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={isDark ? vscDarkPlus : vs}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => <h1 style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: isDark ? '#e8e8f0' : '#000' }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: isDark ? '#e8e8f0' : '#000' }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontSize: 18, fontWeight: 'bold', marginTop: 14, marginBottom: 6, color: isDark ? '#e8e8f0' : '#000' }}>{children}</h3>,
            p: ({ children }) => <p style={{ marginBottom: 12, lineHeight: 1.7 }}>{children}</p>,
            ul: ({ children }) => <ul style={{ marginBottom: 12, paddingLeft: 24 }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ marginBottom: 12, paddingLeft: 24 }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
            strong: ({ children }) => <strong style={{ fontWeight: 'bold', color: isDark ? '#a78bfa' : '#7c5cfc' }}>{children}</strong>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#00d4aa', textDecoration: 'underline' }}>{children}</a>,
          }}
        >
          {answer}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}