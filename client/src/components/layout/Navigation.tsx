import React from 'react';
import {
  Home,
  CheckSquare,
  ListTodo,
  BarChart3,
  Users,
  Share2,
  LogOut,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import type { Team } from '../../types';

export type TabType = 'home' | 'my-work' | 'contributions' | 'analytics' | 'my-teams';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeTeam: Team | null;
  pendingReviewsCount: number;
  onShareCode: () => void;
  onOpenAbout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  activeTeam,
  pendingReviewsCount,
  onShareCode,
  onOpenAbout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <>
      {/* ================= DESKTOP & LAPTOP SIDEBAR (>= 768px - md and above) ================= */}
      <aside className="hidden md:flex w-64 h-screen fixed left-0 top-0 flex-col justify-between border-r border-[var(--bd)] bg-[var(--card)] p-5 z-30 transition-all">
        <div>
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <img src="/icon.png" alt="Credly" className="h-9 w-auto rounded-lg shadow-sm" />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--tx)]">Credly</h1>
              <p className="text-[11px] text-[var(--mu)] truncate max-w-[140px]">
                {activeTeam ? activeTeam.name : 'Contribution Tracker'}
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5" aria-label="Main Navigation">
            <button
              onClick={() => onTabChange('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-semibold transition-all ${
                currentTab === 'home'
                  ? 'bg-[var(--ac)] text-[var(--act)] shadow-sm'
                  : 'text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onTabChange('my-work')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-semibold transition-all ${
                currentTab === 'my-work'
                  ? 'bg-[var(--ac)] text-[var(--act)] shadow-sm'
                  : 'text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)]'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>My Work</span>
            </button>

            <button
              onClick={() => onTabChange('contributions')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-control text-sm font-semibold transition-all ${
                currentTab === 'contributions'
                  ? 'bg-[var(--ac)] text-[var(--act)] shadow-sm'
                  : 'text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListTodo className="w-4 h-4" />
                <span>Contributions</span>
              </div>
              {pendingReviewsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--no)] text-white shadow-sm">
                  {pendingReviewsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-semibold transition-all ${
                currentTab === 'analytics'
                  ? 'bg-[var(--ac)] text-[var(--act)] shadow-sm'
                  : 'text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => onTabChange('my-teams')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-semibold transition-all ${
                currentTab === 'my-teams'
                  ? 'bg-[var(--ac)] text-[var(--act)] shadow-sm'
                  : 'text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>My Teams</span>
            </button>
          </nav>
        </div>

        {/* Desktop Bottom Actions: Share code, Theme, About, Logout */}
        <div className="pt-4 border-t border-[var(--bd)] space-y-2">
          {activeTeam && (
            <button
              onClick={onShareCode}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-control text-xs font-semibold text-[var(--tx)] bg-[var(--sf)] hover:bg-[var(--bd)] transition-colors border border-[var(--bd)] shadow-sm"
            >
              <Share2 className="w-4 h-4 text-[var(--ac)]" />
              <span>Share code: <span className="font-mono">{activeTeam.joinCode}</span></span>
            </button>
          )}

          <div className="flex items-center justify-between px-2 pt-1">
            <button
              onClick={onOpenAbout}
              className="text-xs text-[var(--mu)] hover:text-[var(--tx)] flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded-control text-[var(--mu)] hover:text-[var(--tx)] hover:bg-[var(--sf)] transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-[var(--bd)] flex items-center justify-between px-2">
            <div className="text-xs truncate max-w-[130px]">
              <span className="font-semibold block text-[var(--tx)] truncate">{user?.displayName}</span>
              <span className="text-[10px] text-[var(--mu)] truncate block">{user?.email}</span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-2 rounded-control text-[var(--mu)] hover:text-[var(--no)] hover:bg-[var(--sf)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV (< 768px) ================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/90 backdrop-blur-md border-t border-[var(--bd)] pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Mobile Navigation"
      >
        <div className="max-w-md mx-auto flex items-center justify-around px-1 py-1 overflow-x-auto no-scrollbar">
          {/* 1. Home */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center flex-1 min-w-[46px] py-2 px-1 text-[10px] font-semibold transition-colors relative ${
              currentTab === 'home' ? 'text-[var(--ac)]' : 'text-[var(--mu)]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          {/* 2. My Work */}
          <button
            onClick={() => onTabChange('my-work')}
            className={`flex flex-col items-center justify-center flex-1 min-w-[46px] py-2 px-1 text-[10px] font-semibold transition-colors relative ${
              currentTab === 'my-work' ? 'text-[var(--ac)]' : 'text-[var(--mu)]'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span>My Work</span>
          </button>

          {/* 3. Contributions */}
          <button
            onClick={() => onTabChange('contributions')}
            className={`flex flex-col items-center justify-center flex-1 min-w-[50px] py-2 px-1 text-[10px] font-semibold transition-colors relative ${
              currentTab === 'contributions' ? 'text-[var(--ac)]' : 'text-[var(--mu)]'
            }`}
          >
            <div className="relative">
              <ListTodo className="w-5 h-5 mb-0.5" />
              {pendingReviewsCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 rounded-full bg-[var(--no)] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {pendingReviewsCount}
                </span>
              )}
            </div>
            <span>Contribs</span>
          </button>

          {/* 4. Analytics */}
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex flex-col items-center justify-center flex-1 min-w-[46px] py-2 px-1 text-[10px] font-semibold transition-colors relative ${
              currentTab === 'analytics' ? 'text-[var(--ac)]' : 'text-[var(--mu)]'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Analytics</span>
          </button>

          {/* 5. My Teams */}
          <button
            onClick={() => onTabChange('my-teams')}
            className={`flex flex-col items-center justify-center flex-1 min-w-[46px] py-2 px-1 text-[10px] font-semibold transition-colors relative ${
              currentTab === 'my-teams' ? 'text-[var(--ac)]' : 'text-[var(--mu)]'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Teams</span>
          </button>

          {/* 6. Share code */}
          <button
            onClick={onShareCode}
            aria-label="Share team join code"
            className="flex flex-col items-center justify-center flex-1 min-w-[46px] py-2 px-1 text-[10px] font-semibold text-[var(--mu)] hover:text-[var(--ac)] transition-colors"
          >
            <Share2 className="w-5 h-5 mb-0.5" />
            <span>Share</span>
          </button>

          {/* 7. Login/Logout */}
          <button
            onClick={logout}
            aria-label="Logout"
            className="flex flex-col items-center justify-center flex-1 min-w-[46px] py-2 px-1 text-[10px] font-semibold text-[var(--mu)] hover:text-[var(--no)] transition-colors"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};
