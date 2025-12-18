import React from 'react';
import { AppTab } from '../types';

interface TabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: AppTab; icon: string }[] = [
    { id: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'notes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'todo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'google', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V20a2 2 0 002 2h14a2 2 0 002-2v-6.745zM3.187 9.263l8.7 4.6a.25.25 0 00.226 0l8.7-4.6M3.724 7h16.552a2 2 0 011.928 2.522l-1.383 5.3A24.015 24.015 0 0112 17a24.015 24.015 0 01-8.821-2.178l-1.383-5.3A2 2 0 013.724 7z' },
    { id: 'ai', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div className="fixed bottom-12 left-0 right-0 px-10 z-50 pointer-events-none">
      <nav className="max-w-sm mx-auto bg-nordic/80 backdrop-blur-3xl border border-white/5 rounded-full h-20 px-2 flex items-center justify-around shadow-2xl pointer-events-auto ring-1 ring-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-700 relative ${
              activeTab === tab.id ? 'text-white' : 'text-zinc-600'
            }`}
          >
            {activeTab === tab.id && (
              <span className="absolute inset-2 bg-white/5 rounded-full border border-white/10 animate-in zoom-in-90 duration-700"></span>
            )}
            <svg className="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === tab.id ? 1.5 : 1} d={tab.icon} />
            </svg>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabBar;