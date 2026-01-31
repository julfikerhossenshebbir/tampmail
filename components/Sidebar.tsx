import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Message, UserCredentials } from '../types';

interface SidebarProps {
  credentials: UserCredentials | null;
  messages: Message[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  credentials, 
  messages, 
  selectedMessageId, 
  onSelectMessage,
  isLoading 
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showKey, setShowKey] = useState(false);
  const keyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    };
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleKeyClick = () => {
    if (!credentials) return;
    
    // Copy
    copyToClipboard(credentials.accessKey, 'key');
    
    // Reveal
    setShowKey(true);
    
    // Reset timer
    if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    keyTimeoutRef.current = setTimeout(() => {
        setShowKey(false);
    }, 3500);
  };

  const formatSenderName = (sender: string) => {
    if (sender.includes('<')) {
        return sender.split('<')[0].replace(/['"]/g, '').trim();
    }
    return sender;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    return isToday 
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-orange-500 to-amber-500',
      'from-green-500 to-emerald-500',
      'from-blue-500 to-cyan-500',
      'from-indigo-500 to-purple-500',
      'from-violet-500 to-fuchsia-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Filter messages based on search
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    const lowerQ = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.sender.toLowerCase().includes(lowerQ) || 
      msg.subject.toLowerCase().includes(lowerQ)
    );
  }, [messages, searchQuery]);

  return (
    <aside className="w-full md:w-[400px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-10 h-full transition-colors duration-200">
      
      {/* Credentials & Search Section */}
      <div className="flex flex-col gap-3 p-4 border-b bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800">
        
        {/* Credentials Card */}
        <div className="relative p-3 overflow-hidden transition-all bg-white border shadow-sm dark:bg-slate-800 dark:border-slate-700 rounded-2xl group space-y-3">
          {/* Email Row */}
          <div 
             onClick={() => credentials && copyToClipboard(credentials.email, 'email')}
             className="flex items-center justify-between cursor-pointer"
          >
             <div className="min-w-0">
               <div className="flex items-center gap-2 mb-0.5">
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Email</span>
                 {copiedField === 'email' && <span className="text-[10px] font-bold text-green-500 animate-fade-in">Copied!</span>}
               </div>
               <div className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200 font-mono select-all">
                 {credentials?.email || 'Generating...'}
               </div>
             </div>
             <button className="p-2 text-slate-400 transition-colors rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 shrink-0">
               <span className="text-lg material-symbols-rounded">content_copy</span>
             </button>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

          {/* Key Row */}
          <div 
             onClick={handleKeyClick}
             className="flex items-center justify-between cursor-pointer group/key"
          >
             <div className="min-w-0">
               <div className="flex items-center gap-2 mb-0.5">
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Access Key</span>
                 {copiedField === 'key' && <span className="text-[10px] font-bold text-green-500 animate-fade-in">Copied!</span>}
               </div>
               <div className={`text-sm font-semibold truncate text-slate-700 dark:text-slate-200 font-mono transition-all duration-300 ${showKey ? 'select-all blur-0' : 'select-none blur-[4px] opacity-60'}`}>
                 {credentials?.accessKey || '...'}
               </div>
             </div>
             <button className="p-2 text-slate-400 transition-colors rounded-lg bg-slate-50 dark:bg-slate-700/50 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 shrink-0">
               <span className="text-lg material-symbols-rounded">key</span>
             </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute transform -translate-y-1/2 left-3 top-1/2 text-slate-400 dark:text-slate-500 material-symbols-rounded text-[20px]">search</span>
          <input 
            type="text" 
            placeholder="Search inbox..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
        {isLoading && messages.length === 0 ? (
           <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-2/3 h-4 rounded bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-full h-3 rounded bg-slate-50 dark:bg-slate-800/50"></div>
                  </div>
                </div>
              ))}
           </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-slate-50 dark:bg-slate-800/50">
              <span className="text-4xl text-slate-300 dark:text-slate-600 material-symbols-rounded">inbox</span>
            </div>
            <p className="text-base font-semibold text-slate-600 dark:text-slate-300">Inbox Empty</p>
            <p className="max-w-[220px] mt-2 text-xs text-slate-400 dark:text-slate-500">
              Your temporary email is ready. Messages will appear here automatically.
            </p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No results found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredMessages.map((msg) => {
                const isSelected = selectedMessageId === msg.id;
                const senderName = formatSenderName(msg.sender);
                const initial = senderName.charAt(0).toUpperCase();
                
                return (
                    <div
                        key={msg.id}
                        onClick={() => onSelectMessage(msg.id)}
                        className={`group cursor-pointer p-3 rounded-xl transition-all border ${
                            isSelected 
                            ? 'bg-brand-50/80 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(senderName)} flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-sm`}>
                                {initial}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h4 className={`text-sm font-semibold truncate pr-2 ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-100'}`}>
                                        {senderName}
                                    </h4>
                                    <span className={`text-[10px] font-medium whitespace-nowrap ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                                <p className={`text-xs truncate leading-relaxed ${isSelected ? 'text-brand-600/80 dark:text-brand-200/70 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {msg.subject || '(No Subject)'}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
