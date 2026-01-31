import React, { useState } from 'react';
import { UserCredentials } from '../types';
import { ApiService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (creds: UserCredentials) => void;
  onClose?: () => void;
  canClose: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin, onClose, canClose }) => {
  const [view, setView] = useState<'welcome' | 'login'>('welcome');
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginKey, setLoginKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateNew = async () => {
    setLoading(true);
    setError('');
    try {
      const creds = await ApiService.createAccount();
      onLogin(creds);
    } catch (err) {
      setError('Failed to generate ID. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = () => {
    if (!loginEmail.trim() || !loginKey.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    onLogin({ email: loginEmail.trim(), accessKey: loginKey.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl rounded-3xl overflow-hidden animate-slide-in border border-white/10">
        
        {view === 'welcome' && (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-3xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 shadow-inner">
              <span className="text-4xl material-symbols-rounded">mark_email_unread</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create a secure disposable identity or access an existing inbox.
            </p>

            {error && <div className="mt-4 p-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded">{error}</div>}

            <div className="mt-8 space-y-3">
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="flex items-center justify-center w-full gap-2 py-4 font-bold text-white transition-all shadow-lg shadow-brand-500/25 bg-brand-600 rounded-2xl hover:bg-brand-700 active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                ) : (
                  <>
                    <span className="material-symbols-rounded">add_circle</span>
                    Create New ID
                  </>
                )}
              </button>
              
              <button
                onClick={() => setView('login')}
                className="w-full py-4 font-bold text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl active:scale-95"
              >
                Login with Key
              </button>

              {canClose && onClose && (
                <button 
                    onClick={onClose}
                    className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => { setView('welcome'); setError(''); }}
                className="p-1 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <span className="material-symbols-rounded">arrow_back</span>
              </button>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Access Inbox</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="user@domain.com"
                  className="w-full px-4 py-3 text-sm font-medium border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Access Key
                </label>
                <input
                  type="text"
                  value={loginKey}
                  onChange={(e) => setLoginKey(e.target.value)}
                  placeholder="Secret key..."
                  className="w-full px-4 py-3 text-sm font-medium border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400 text-slate-800 dark:text-white"
                />
              </div>

              {error && <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded">{error}</div>}

              <button
                onClick={handleManualLogin}
                className="w-full py-4 mt-2 font-bold text-white transition-all bg-slate-800 dark:bg-brand-600 rounded-2xl hover:bg-slate-900 dark:hover:bg-brand-700 active:scale-95 shadow-lg"
              >
                Open Inbox
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};