import { useState, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:8000';

export function useAgent() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [sessionId, setSessionId] = useState(null);
  const [finalAnswer, setFinalAnswer] = useState(null);
  const [iteration, setIteration] = useState(0);
  const esRef = useRef(null);

  const reset = useCallback(() => {
    if (esRef.current) esRef.current.close();
    setEvents([]);
    setStatus('idle');
    setSessionId(null);
    setFinalAnswer(null);
    setIteration(0);
  }, []);

  const runTask = useCallback(async (task) => {
    reset();
    setStatus('running');

    const sid = crypto.randomUUID();
    setSessionId(sid);

    const url = `${API_BASE}/api/stream/${sid}?task=${encodeURIComponent(task)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);

        if (event.type === 'done') {
          setStatus('done');
          es.close();
          return;
        }

        if (event.type === 'error') {
          setStatus('error');
          setEvents(prev => [...prev, event]);
          es.close();
          return;
        }

        if (event.type === 'iteration') {
          setIteration(event.iteration);
          return;
        }

        if (event.type === 'final_answer') {
          setFinalAnswer(event.content);
          setStatus('done');
          setEvents(prev => [...prev, event]);
          return;
        }

        setEvents(prev => [...prev, event]);
      } catch (err) {
        console.error('Parse error:', err);
      }
    };

    es.onerror = () => {
      setStatus(prev => prev === 'running' ? 'error' : prev);
      es.close();
    };
  }, [reset]);

  const stop = useCallback(() => {
    if (esRef.current) esRef.current.close();
    setStatus('done');
  }, []);

  return { events, status, sessionId, finalAnswer, iteration, runTask, reset, stop };
}