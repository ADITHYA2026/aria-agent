import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { HistoryProvider } from './context/HistoryContext';
import Home from './pages/Home';
import AgentPage from './pages/Agent';
import './index.css';

export default function App() {
  return (
    <ThemeProvider>
      <HistoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"      element={<Home />} />
            <Route path="/agent" element={<AgentPage />} />
          </Routes>
        </BrowserRouter>
      </HistoryProvider>
    </ThemeProvider>
  );
}