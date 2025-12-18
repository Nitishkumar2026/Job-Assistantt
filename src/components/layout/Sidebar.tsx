import React, { useEffect, useState } from 'react';
import { MessageSquare, Database, FileText, LayoutDashboard, Wifi, WifiOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

const navItems = [
  { icon: MessageSquare, label: 'Simulator', path: '/' },
  { icon: Database, label: 'Job Database', path: '/database' },
  { icon: FileText, label: 'Docs & Prompts', path: '/docs' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to fetch a simple count to see if DB is reachable and allows reads
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) throw error;
        setDbStatus('connected');
      } catch (e) {
        console.error("DB Connection Check Failed:", e);
        setDbStatus('error');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight">JobBot AI</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              location.pathname === item.path 
                ? "bg-green-600 text-white shadow-lg shadow-green-900/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className={cn(
            "rounded-lg p-4 transition-colors",
            dbStatus === 'error' ? "bg-red-900/20 border border-red-900/50" : "bg-slate-800"
        )}>
            <p className="text-xs text-slate-400 mb-2">Database Status</p>
            <div className={cn(
                "flex items-center gap-2 text-sm font-medium",
                dbStatus === 'connected' ? "text-green-400" : 
                dbStatus === 'error' ? "text-red-400" : "text-yellow-400"
            )}>
                {dbStatus === 'connected' && (
                    <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Connected
                    </>
                )}
                {dbStatus === 'error' && (
                    <>
                        <WifiOff size={14} />
                        Disconnected
                    </>
                )}
                {dbStatus === 'checking' && (
                    <>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        Checking...
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
