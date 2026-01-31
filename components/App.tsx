import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from './services/api';
import { Message, UserCredentials } from './types';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { ReadingPane } from './components/ReadingPane';

const STORAGE_KEY = 'jhs_mail_client_v2_final';
const THEME_KEY = 'jhs_theme';

function App() {
  const [credentials, setCredentials] = useState<UserCredentials | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Persistence Load
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.email && data.accessKey) {
          setCredentials({ email: data.email, accessKey: data.accessKey });
          if (data.messages) setMessages(data.messages);
        } else {
            setIsAuthModalOpen(true);
        }
      } catch (e) {
        setIsAuthModalOpen(true);
      }
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  // Save Persistence
  useEffect(() => {
    if (credentials) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        email: credentials.email,
        accessKey: credentials.accessKey,
        messages: messages
      }));
    }
  }, [credentials, messages]);

  // Click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMessages = useCallback(async (isManual = false) => {
    if (!credentials) return;
    
    if (isManual) setIsRefreshing(true);
    
    try {
      if (messages.length === 0 && isManual) setIsLoadingMessages(true);

      const newMessages = await ApiService.getMessages(credentials);
      
      setMessages(prev => {
        // MERGE STRATEGY:
        // We want to keep messages locally even if they are gone from the API.
        // 1. Identify existing message IDs.
        const existingIds = new Set(prev.map(m => m.id));
        
        // 2. Find messages in the new batch that we don't have yet.
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));

        // 3. If no new messages, return previous state to avoid re-renders.
        if (uniqueNewMessages.length === 0) {
            return prev;
        }

        // 4. Combine and sort by timestamp (newest first).
        const combined = [...uniqueNewMessages, ...prev];
        return combined.sort((a, b) => b.timestamp - a.timestamp);
      });
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      if (isManual) {
         setTimeout(() => setIsRefreshing(false), 500);
         setIsLoadingMessages(false);
      }
    }
  }, [credentials, messages]); // Added messages as dependency to allow safe merging

  // Polling Timer
  useEffect(() => {
    if (!credentials) return;
    // Initial fetch
    fetchMessages(true);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchMessages();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [credentials]);

  const handleLogin = (newCreds: UserCredentials) => {
    setCredentials(newCreds);
    setMessages([]);
    setSelectedMessageId(null);
    setIsAuthModalOpen(false);
    setCountdown(5);
  };

  const handleLogout = () => {
      localStorage.removeItem(STORAGE_KEY);
      setCredentials(null);
      setMessages([]);
      setSelectedMessageId(null);
      setIsAuthModalOpen(true);
      setShowProfileMenu(false);
  }

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || null;

  return (
    <div className="flex flex-col h-screen font-sans text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      
      {/* Header */}
      <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-40 md:px-6 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/20">
            <span className="text-2xl material-symbols-rounded">mail</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight text-slate-800 dark:text-white">TempMail</h1>
            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          {/* Refresh Info */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums mr-2">
              <span className={`material-symbols-rounded text-sm ${isRefreshing ? 'animate-spin' : ''}`}>update</span>
              <span className="w-3 text-brand-600 dark:text-brand-400">{countdown}</span>s
          </div>

          <button 
              onClick={() => fetchMessages(true)} 
              className="p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 active:scale-95" 
              title="Refresh Inbox"
          >
            <span className={`material-symbols-rounded text-xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
          </button>
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
          >
             <span className="material-symbols-rounded text-xl">
                 {theme === 'light' ? 'dark_mode' : 'light_mode'}
             </span>
          </button>

          <div className="w-px h-6 mx-1 bg-slate-200 dark:bg-slate-800"></div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
             <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
                <span className="material-symbols-rounded text-xl text-slate-600 dark:text-slate-300">person</span>
             </button>

             {/* Dropdown */}
             {showProfileMenu && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 animate-fade-in origin-top-right">
                     <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                         <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Signed in as</p>
                         <p className="text-xs font-medium truncate text-slate-700 dark:text-slate-300 mt-0.5">
                            {credentials?.email || 'Guest'}
                         </p>
                     </div>
                     
                     <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                     >
                        <span className="material-symbols-rounded text-base">logout</span> Logout
                     </button>
                 </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        
        {/* Sidebar (List) */}
        <Sidebar 
            credentials={credentials}
            messages={messages}
            selectedMessageId={selectedMessageId}
            onSelectMessage={setSelectedMessageId}
            isLoading={isLoadingMessages}
        />

        {/* Reading Pane (Details) */}
        <main className={`absolute inset-0 z-20 md:relative md:flex md:flex-1 bg-white dark:bg-slate-900 transition-transform duration-300 ${selectedMessageId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
             <ReadingPane 
                message={selectedMessage} 
                credentials={credentials}
                onClose={() => setSelectedMessageId(null)}
                theme={theme}
             />
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden shrink-0 h-[60px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 pb-safe z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <button 
            onClick={() => fetchMessages(true)} 
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 dark:text-slate-400 active:text-brand-600"
        >
            <span className={`material-symbols-rounded text-2xl ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
            <span className="text-[10px] font-bold">Refresh</span>
        </button>
        
        <button 
            onClick={() => {
                setShowProfileMenu(false);
                toggleTheme();
            }}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-slate-500 dark:text-slate-400 active:text-brand-600"
        >
             <span className="material-symbols-rounded text-2xl">
                 {theme === 'light' ? 'dark_mode' : 'light_mode'}
             </span>
            <span className="text-[10px] font-bold">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onLogin={handleLogin}
        onClose={() => setIsAuthModalOpen(false)}
        canClose={!!credentials}
      />

    </div>
  );
}

export default App;