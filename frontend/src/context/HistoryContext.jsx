import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const HistoryContext = createContext();

export function HistoryProvider({ children }) {
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aria-history') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('aria-history', JSON.stringify(sessions.slice(0, 50)));
  }, [sessions]);

  const addSession = useCallback((session) => {
    setSessions(prev => [session, ...prev.filter(s => s.id !== session.id)].slice(0, 50));
  }, []);

  const updateSession = useCallback((id, patch) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const removeSession = useCallback((id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSessions([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ sessions, addSession, updateSession, removeSession, clearAll }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);