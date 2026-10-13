import React from 'react';
import {
  LayoutDashboard,
  Trash2,
  TrendingUp,
  ClipboardList,
  BarChart3,
  Settings,
  Leaf,
  Info,
} from 'lucide-react';
import { useWasteManagement } from '../../context/WasteManagementContext';
import { PageTab } from '../../types';

interface NavItem {
  id: PageTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: (metrics: any) => number | null;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, metrics } = useWasteManagement();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'monitoring',
      label: 'Bin Monitoring',
      icon: Trash2,
      badgeCount: (m) => m.totalBins,
    },
    {
      id: 'predictions',
      label: 'Fill-Level Predictions',
      icon: TrendingUp,
      badgeCount: (m) => (m.urgentCount > 0 ? m.urgentCount : null),
    },
    {
      id: 'planning',
      label: 'Collection Planning',
      icon: ClipboardList,
      badgeCount: (m) => (m.needCollection > 0 ? m.needCollection : null),
    },
    {
      id: 'reports',
      label: 'Reports and Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#0A1628] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 z-30 select-none">
      {/* Brand & Emblem */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white leading-tight">
              SMART WASTE
            </div>
            <div className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
              GHMC · LB Nagar Zone
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Menu
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.badgeCount ? item.badgeCount(metrics) : null;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {badge !== null && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full tabular-nums shrink-0 ${
                      isActive
                        ? 'bg-emerald-800 text-emerald-100'
                        : item.id === 'planning' || item.id === 'predictions'
                        ? 'bg-red-900/60 text-red-300 border border-red-700/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Project Academic / Municipal Notice Card */}
      <div className="p-4 border-t border-slate-800/80 bg-[#071120]">
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>LB Nagar Circle · Hyderabad</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Covering LB Nagar, Vanasthalipuram, and Hayathnagar sectors. Pallavi Engineering College.
          </p>
        </div>
      </div>
    </aside>
  );
};
