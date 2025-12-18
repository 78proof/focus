import React from 'react';
import { AppTab } from '../types';

interface TabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: AppTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'notes', label: 'Vault', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'todo', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'google', label: 'Work', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V20a2 2 0 002 2h14a2 2 0 002-2v-6.745zM3.187 9.263l8.7 4.6a.25.25 0 00.226 0l8.7-4.6M3.724 7h16.552a2 2 0 011.928 2.522l-1.383 5.3A24.015 24.015 0 0112 17a24.015 24.015 0 01-8.821-2.178l-1.383-5.3A2 2 0 013.724 7z' },
    { id: 'ai', label: 'AI', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 px-6 z-50 pointer-events-none">
      <nav className="max-w-md mx-auto bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-gray-100 dark:border-zinc-800 rounded-full h-20 px-4 flex items-center justify-around shadow-2xl pointer-events-auto ring-1 ring-black/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-14 rounded-full transition-all duration-300 relative ${
              activeTab === tab.id 
                ? 'text-zinc-900 dark:text-white scale-110' 
                : 'text-gray-300 dark:text-zinc-700'
            }`}
          >
            {activeTab === tab.id && (
              <span className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full -z-10 animate-in fade-in zoom-in-90 duration-300"></span>
            )}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === tab.id ? 2.5 : 2} d={tab.icon} />
            </svg>
            <span className={`text-[7px] font-black tracking-widest uppercase mt-1 transition-opacity ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabBar;