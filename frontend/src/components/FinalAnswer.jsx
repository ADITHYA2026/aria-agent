import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

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
        color: isDark ? '#d0d0e8' : '#000000',  // Black in light mode
        lineHeight: 1.75,
        whiteSpace: 'pre-wrap',
      }}>
        {answer}
      </div>
    </motion.div>
  );
}