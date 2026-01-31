import React, { useEffect, useRef, useState } from 'react';
import { Message, UserCredentials } from '../types';
import { ApiService } from '../services/api';

interface ReadingPaneProps {
  message: Message | null;
  credentials: UserCredentials | null;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const ReadingPane: React.FC<ReadingPaneProps> = ({ message, credentials, onClose, theme }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!message || !credentials) return;
      
      setLoading(true);
      setContent('');
      
      try {
        const html = await ApiService.readMessage(credentials, message.id);
        setContent(html);
      } catch (err) {
        setContent('<div style="text-align:center; padding: 40px; color: #ef4444;">Failed to load message content.</div>');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [message?.id, credentials]);

  // Update iframe content
  useEffect(() => {
    if (iframeRef.current) {
        const doc = iframeRef.current.contentWindow?.document;
        if (doc) {
            doc.open();
            
            // Theme-based styles
            const isDark = theme === 'dark';
            const bgColor = isDark ? '#0f172a' : '#ffffff';
            const textColor = isDark ? '#e2e8f0' : '#1e293b';
            const linkColor = isDark ? '#60a5fa' : '#2563eb';
            const blockquoteBorder = isDark ? '#334155' : '#e2e8f0';
            const blockquoteColor = isDark ? '#94a3b8' : '#64748b';
            const preBg = isDark ? '#1e293b' : '#f1f5f9';
            const scrollThumb = isDark ? '#475569' : '#cbd5e1';

            const safeContent = loading 
                ? `<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:${isDark ? '#64748b' : '#94a3b8'};font-family:sans-serif;font-size:14px;">Loading content...</div>` 
                : `<!DOCTYPE html>
                   <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <base target="_blank">
                        <style>
                            body { 
                                background-color: ${bgColor}; 
                                color: ${textColor}; 
                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                                padding: 30px; 
                                margin: 0; 
                                font-size: 15px; 
                                line-height: 1.6; 
                                word-wrap: break-word; 
                                transition: background-color 0.2s, color 0.2s;
                            }
                            img { max-width: 100% !important; height: auto; display: block; margin: 10px 0; border-radius: 8px; }
                            a { color: ${linkColor}; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                            blockquote { border-left: 3px solid ${blockquoteBorder}; margin: 0; padding-left: 16px; color: ${blockquoteColor}; }
                            pre { background: ${preBg}; padding: 12px; border-radius: 8px; overflow-x: auto; color: ${textColor}; }
                            /* Scrollbar for iframe */
                            ::-webkit-scrollbar { width: 6px; height: 6px; }
                            ::-webkit-scrollbar-track { background: transparent; }
                            ::-webkit-scrollbar-thumb { background: ${scrollThumb}; border-radius: 3px; }
                        </style>
                    </head>
                    <body>${content}</body>
                   </html>`;
            doc.write(safeContent);
            doc.close();
        }
    }
  }, [content, loading, theme]);

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${message?.id || 'export'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatSenderParts = (sender: string) => {
    let name = sender;
    let email = '';
    if (sender.includes('<')) {
        const parts = sender.match(/(.*)<(.*)>/);
        if (parts) {
            name = parts[1].replace(/['"]/g, '').trim();
            email = parts[2].trim();
        }
    }
    return { name, email };
  };

  if (!message) {
    return (
      <div className="flex-col items-center justify-center hidden w-full h-full bg-slate-50 dark:bg-slate-950 md:flex transition-colors duration-200">
         <div className="flex flex-col items-center p-8 text-center animate-fade-in">
            <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-5xl opacity-20 text-slate-400 dark:text-slate-500 material-symbols-rounded">mark_email_unread</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Select a message</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Choose an email from the inbox list to read its content here.
            </p>
         </div>
      </div>
    );
  }

  const { name, email } = formatSenderParts(message.sender);
  const dateStr = new Date(message.timestamp * 1000).toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="absolute inset-0 z-30 flex flex-col w-full h-full transition-transform duration-300 transform bg-white dark:bg-slate-900 md:relative md:translate-x-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col px-6 py-5 border-b shadow-sm border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-20 transition-colors duration-200">
        
        {/* Mobile Nav */}
        <div className="flex items-center justify-between mb-4 md:hidden">
            <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 -ml-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-rounded">arrow_back</span>
                <span className="text-sm font-semibold">Inbox</span>
            </button>
            <button onClick={handleDownload} className="p-2 text-slate-500 dark:text-slate-400 rounded-lg bg-slate-50 dark:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400">
                <span className="material-symbols-rounded">download</span>
            </button>
        </div>

        <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold leading-tight text-slate-900 dark:text-white">{message.subject || '(No Subject)'}</h1>
            <button onClick={handleDownload} title="Download HTML" className="hidden md:flex p-2 text-slate-400 dark:text-slate-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400">
                <span className="material-symbols-rounded">download</span>
            </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-5">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-lg font-bold text-white uppercase rounded-full shadow-md bg-gradient-to-br from-brand-500 to-brand-700">
                    {name.charAt(0)}
                </div>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{name}</span>
                        {email && <span className="text-xs text-slate-500 dark:text-slate-500 hidden sm:inline">&lt;{email}&gt;</span>}
                    </div>
                    {email && <span className="text-xs text-slate-500 dark:text-slate-500 sm:hidden">{email}</span>}
                    <span className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">to me</span>
                </div>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                {dateStr}
            </div>
        </div>
      </div>

      {/* Content Area - Background now matches theme (dark/light) for seamless look */}
      <div className="relative flex-1 w-full h-full bg-slate-50 dark:bg-slate-950 p-0 md:p-6 overflow-hidden transition-colors duration-200">
        <div className="w-full h-full md:rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <iframe 
                ref={iframeRef} 
                className="w-full h-full border-0" 
                title="Email Content"
                sandbox="allow-same-origin"
            />
        </div>
      </div>
    </div>
  );
};