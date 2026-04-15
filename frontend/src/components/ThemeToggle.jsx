import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 40, 
        height: 40, 
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: isDark ? 'rgba(30,30,50,0.8)' : 'rgba(255,255,255,0.9)',
        cursor: 'pointer',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 20,
        transition: 'all 0.2s',
        flexShrink: 0,
        color: isDark ? '#fbbf24' : '#7c5cfc',  // Yellow in dark mode, purple in light
        boxShadow: isDark ? '0 0 10px rgba(251,191,36,0.3)' : '0 0 10px rgba(124,92,252,0.2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.borderColor = isDark ? '#fbbf24' : '#7c5cfc';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 30, opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </motion.button>
  );
}