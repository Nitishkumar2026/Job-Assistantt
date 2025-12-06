import React from 'react';
import { MessageSquare, Database, FileText, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: MessageSquare, label: 'Simulator', path: '/' },
  { icon: Database, label: 'Job Database', path: '/database' },
  { icon: FileText, label: 'Docs & Prompts', path: '/docs' },
];

export const Sidebar = () => {
  const location = useLocation();

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
        <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">System Status</p>
            <div className="flex items-center gap-2 text-sm text-green-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
            </div>
        </div>
      </div>
    </div>
  );
};
