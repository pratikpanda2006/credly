import React from 'react';
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import type { Team, AnalyticsData } from '../types';
import { ShareDonutChart } from '../components/shared/ShareDonutChart';
import { PostBox } from '../components/shared/PostBox';

interface HomePageProps {
  activeTeam: Team;
  analytics: AnalyticsData | null;
  pendingReviewsCount: number;
  onSwitchTeam: () => void;
  onReviewNow: () => void;
  onPostCreated: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  activeTeam,
  analytics,
  pendingReviewsCount,
  onSwitchTeam,
  onReviewNow,
  onPostCreated,
}) => {
  // Format team name for demo team as requested:
  // "in brket after demo data in same beraket write to crete/join ur tema click on my teams"
  const displayName =
    activeTeam.name.includes('demo data') &&
    !activeTeam.name.includes('to create/join')
      ? activeTeam.name.replace(
          '(demo data)',
          '(demo data - to create/join your team click on My Teams)'
        )
      : activeTeam.name;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Team name with a "Switch" button that goes to My Teams */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--bd)]">
        <div>
          <span className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider block mb-0.5">
            Current Team
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)] leading-snug">
            {displayName}
          </h2>
        </div>

        <button
          onClick={onSwitchTeam}
          className="self-start sm:self-center px-3.5 py-1.5 rounded-control border border-[var(--bd)] bg-[var(--card)] hover:bg-[var(--sf)] transition-colors text-xs font-semibold text-[var(--mu)] hover:text-[var(--tx)] flex items-center gap-1.5 shadow-sm flex-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Switch</span>
        </button>
      </div>

      {/* 2. Share-of-work donut chart with legend (or the "No chart yet" empty state) */}
      <ShareDonutChart
        memberShares={analytics?.memberShares || []}
        hasChart={analytics?.hasChart || false}
        scoringMode={analytics?.scoringMode || 'quality'}
      />

      {/* 3. Review banner "N posts need your review" with a "Review now" button (only when N > 0) */}
      {pendingReviewsCount > 0 && (
        <div className="w-full p-4 rounded-card bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-none">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-300">
                {pendingReviewsCount} {pendingReviewsCount === 1 ? 'post needs' : 'posts need'} your review
              </p>
              <p className="text-[11px] text-amber-400/80">
                Help teammates confirm their honest contributions.
              </p>
            </div>
          </div>

          <button
            onClick={onReviewNow}
            className="px-3.5 py-1.5 rounded-control bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-sm flex-none"
          >
            <span>Review now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. "What did you do for the group?" post box with validation messages */}
      <PostBox teamId={activeTeam.id} onPostCreated={onPostCreated} />
    </div>
  );
};
