import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './pages/AuthPage';
import { AddTeamPage } from './pages/AddTeamPage';
import { HomePage } from './pages/HomePage';
import { MyWorkPage } from './pages/MyWorkPage';
import { ContributionsPage } from './pages/ContributionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { MyTeamsPage } from './pages/MyTeamsPage';
import { Navigation, type TabType } from './components/layout/Navigation';
import { WalkthroughModal } from './components/walkthrough/WalkthroughModal';
import { AboutModal } from './components/about/AboutModal';
import { useShareCode } from './hooks/useShareCode';
import { useSSE } from './hooks/useSSE';
import { api } from './services/api';
import type { Team } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

const MEMBER_COLORS = [
  '#2f8f78',
  '#e0a030',
  '#6b7fd7',
  '#d9667a',
  '#8a6bbf',
  '#4aa3c7',
];

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { shareTeamCode } = useShareCode();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeTeamId, setActiveTeamId] = useState<string | null>(() => {
    return localStorage.getItem('credly_active_team_id');
  });

  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [initialContributionsFilter, setInitialContributionsFilter] = useState<
    'all' | 'needs-review' | 'mine'
  >('all');

  // Fetch teams for authenticated user
  const {
    data: teamsData,
    isLoading: teamsLoading,
    refetch: refetchTeams,
  } = useQuery({
    queryKey: ['teams'],
    queryFn: () => api.getTeams(),
    enabled: !!user,
  });

  const teams = teamsData?.teams || [];

  // Determine active team
  const activeTeam = useMemo(() => {
    if (teams.length === 0) return null;
    if (activeTeamId) {
      const found = teams.find((t) => t.id === activeTeamId);
      if (found) return found;
    }
    return teams[0];
  }, [teams, activeTeamId]);

  // Sync active team ID to state and localStorage
  useEffect(() => {
    if (activeTeam) {
      setActiveTeamId(activeTeam.id);
      localStorage.setItem('credly_active_team_id', activeTeam.id);
    }
  }, [activeTeam]);

  // First-time walkthrough check
  useEffect(() => {
    if (user && !localStorage.getItem('credly_has_completed_walkthrough')) {
      setIsWalkthroughOpen(true);
    }
  }, [user]);

  // Realtime Server-Sent Events hook for active team
  useSSE(activeTeam?.id || null);

  // Fetch posts for active team
  const { data: postsData, refetch: refetchPosts } = useQuery({
    queryKey: ['team-posts', activeTeam?.id],
    queryFn: () => api.getTeamPosts(activeTeam!.id),
    enabled: !!activeTeam,
  });

  // Fetch analytics for active team
  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['team-analytics', activeTeam?.id],
    queryFn: () => api.getTeamAnalytics(activeTeam!.id),
    enabled: !!activeTeam,
  });

  const posts = postsData?.posts || [];
  const analytics = analyticsData || null;

  // Compute pending reviews count for current user
  const pendingReviewsCount = useMemo(() => {
    if (!user) return 0;
    return posts.filter((p) => p.authorId !== user.id && !p.hasUserReviewed).length;
  }, [posts, user]);

  // Compute deterministic member colors mapping
  const memberColorsMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!activeTeam?.memberships) return map;
    activeTeam.memberships.forEach((m, idx) => {
      map[m.userId] = MEMBER_COLORS[idx % MEMBER_COLORS.length];
    });
    return map;
  }, [activeTeam]);

  // Handlers
  const handleWalkthroughClose = () => {
    setIsWalkthroughOpen(false);
    localStorage.setItem('credly_has_completed_walkthrough', 'true');
  };

  const handleShareCodeAction = () => {
    if (activeTeam) {
      shareTeamCode(activeTeam.name, activeTeam.joinCode);
    }
  };

  const handleReviewNowAction = () => {
    setInitialContributionsFilter('needs-review');
    setCurrentTab('contributions');
  };

  const handleRefreshAll = () => {
    refetchPosts();
    refetchAnalytics();
    refetchTeams();
  };

  const handleTeamCreatedOrJoined = (newTeam: Team) => {
    setActiveTeamId(newTeam.id);
    localStorage.setItem('credly_active_team_id', newTeam.id);
    setIsAddTeamOpen(false);
    refetchTeams();
    setCurrentTab('home');
  };

  // 1. Loading state
  if (authLoading || (user && teamsLoading && !teamsData)) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--tx)]">
        <img src="/logo.png" alt="Credly" className="h-14 w-auto rounded-xl animate-pulse mb-4" />
        <div className="flex items-center gap-2 text-xs text-[var(--mu)]">
          <span className="w-3.5 h-3.5 border-2 border-[var(--ac)] border-t-transparent rounded-full animate-spin" />
          <span>Opening Credly...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Auth Page
  if (!user) {
    return <AuthPage />;
  }

  // 3. Authenticated but has NO teams, or explicitly opened "Add a team"
  if (teams.length === 0 || isAddTeamOpen) {
    return (
      <>
        <AddTeamPage
          onTeamSelected={handleTeamCreatedOrJoined}
          onCancel={teams.length > 0 ? () => setIsAddTeamOpen(false) : undefined}
          hasExistingTeams={teams.length > 0}
        />
        <WalkthroughModal isOpen={isWalkthroughOpen} onClose={handleWalkthroughClose} />
      </>
    );
  }

  // Determine if current user is admin of active team
  const currentMembership = activeTeam?.memberships?.find((m) => m.userId === user.id);
  const isTeamAdmin = currentMembership?.role === 'ADMIN';

  // 4. Main App Screens
  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--tx)] flex">
      {/* Navigation (Desktop Sidebar & Mobile Bottom Bar) */}
      <Navigation
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'contributions') {
            setInitialContributionsFilter('all');
          }
          setCurrentTab(tab);
        }}
        activeTeam={activeTeam}
        pendingReviewsCount={pendingReviewsCount}
        onShareCode={handleShareCodeAction}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 min-h-screen flex flex-col justify-between">
        {/* Mobile-only header (< 768px) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--bd)] bg-[var(--card)] sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Credly" className="h-7 w-auto rounded-md" />
            <span className="font-bold text-sm tracking-tight text-[var(--tx)]">Credly</span>
          </div>
          <span className="text-xs font-semibold text-[var(--mu)] truncate max-w-[180px]">
            {activeTeam?.name}
          </span>
        </div>

        <div className="w-full px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 max-w-5xl mx-auto">
          {currentTab === 'home' && activeTeam && (
            <HomePage
              activeTeam={activeTeam}
              analytics={analytics}
              pendingReviewsCount={pendingReviewsCount}
              onSwitchTeam={() => setCurrentTab('my-teams')}
              onReviewNow={handleReviewNowAction}
              onPostCreated={handleRefreshAll}
            />
          )}

          {currentTab === 'my-work' && activeTeam && (
            <MyWorkPage
              activeTeam={activeTeam}
              posts={posts}
              currentUserId={user.id}
              isTeamAdmin={isTeamAdmin}
              memberColorsMap={memberColorsMap}
              onPostCreated={handleRefreshAll}
              onPostUpdated={handleRefreshAll}
            />
          )}

          {currentTab === 'contributions' && (
            <ContributionsPage
              posts={posts}
              currentUserId={user.id}
              isTeamAdmin={isTeamAdmin}
              memberColorsMap={memberColorsMap}
              initialFilter={initialContributionsFilter}
              onPostUpdated={handleRefreshAll}
              onPostDeleted={handleRefreshAll}
            />
          )}

          {currentTab === 'analytics' && activeTeam && (
            <AnalyticsPage
              analytics={analytics}
              activeTeam={activeTeam}
              currentUserId={user.id}
            />
          )}

          {currentTab === 'my-teams' && (
            <MyTeamsPage
              teams={teams}
              activeTeamId={activeTeam?.id || null}
              currentUserId={user.id}
              onSelectTeam={(t) => {
                setActiveTeamId(t.id);
                setCurrentTab('home');
              }}
              onOpenAddTeam={() => setIsAddTeamOpen(true)}
              onReplayWalkthrough={() => setIsWalkthroughOpen(true)}
              onTeamModified={handleRefreshAll}
            />
          )}
        </div>
      </main>

      {/* Modals & Dialogs */}
      <WalkthroughModal isOpen={isWalkthroughOpen} onClose={handleWalkthroughClose} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
