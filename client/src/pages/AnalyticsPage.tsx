import React from 'react';
import {
  BarChart3,
  TrendingUp,
  FileText,
  ThumbsUp,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { AnalyticsData, Team } from '../types';

interface AnalyticsPageProps {
  analytics: AnalyticsData | null;
  activeTeam: Team;
  currentUserId: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analytics,
  activeTeam,
  currentUserId,
}) => {
  if (!analytics || analytics.totalTeamPosts === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)]">
            Analytics & Insights
          </h2>
          <p className="text-xs text-[var(--mu)] mt-0.5">
            Transparent group statistics and contribution metrics.
          </p>
        </div>

        <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-10 text-center shadow-card flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[var(--sf)] text-[var(--mu)] flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--tx)] mb-1.5">No analytics data yet</h3>
          <p className="text-xs text-[var(--mu)] max-w-sm mb-4 leading-relaxed">
            As soon as team members start logging contributions and reviewing work, complete breakdown metrics, charts, and ratios will show up here.
          </p>
        </div>
      </div>
    );
  }

  // Find current user's stats
  const myShare = analytics.memberShares.find((m) => m.userId === currentUserId);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)]">
            Analytics & Insights
          </h2>
          <p className="text-xs text-[var(--mu)] mt-0.5">
            Fair, verified stats for team <span className="font-semibold text-[var(--tx)]">{activeTeam.name}</span>
          </p>
        </div>

        {/* Scoring Mode Badge */}
        <div className="self-start sm:self-center px-3 py-1 rounded-full bg-[var(--sf)] border border-[var(--bd)] text-xs flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--ac)]" />
          <span>
            {analytics.scoringMode === 'volume'
              ? 'Mode: Volume-weighted (ON)'
              : 'Mode: Quality-based (Default)'}
          </span>
        </div>
      </div>

      {/* Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* My Posts */}
        <div className="p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-none">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider block">
              My Posts
            </span>
            <div className="text-2xl font-extrabold text-[var(--tx)] tnum">
              {myShare?.totalPosts ?? 0}
            </div>
          </div>
        </div>

        {/* My Upvotes */}
        <div className="p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-none">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider block">
              My Upvotes Received
            </span>
            <div className="text-2xl font-extrabold text-[var(--tx)] tnum">
              {myShare?.upvotesReceived ?? 0}
            </div>
            <span className="text-[10px] text-[var(--mu)]">
              {myShare?.groupVotesReceived ?? 0} group · {myShare?.selfVotesReceived ?? 0} me
            </span>
          </div>
        </div>

        {/* Per-post Ratio */}
        <div className="p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-none">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider block">
              Helpfulness Ratio
            </span>
            <div className="text-2xl font-extrabold text-[var(--tx)] tnum">
              {myShare?.ratio ?? 0}
            </div>
            <span className="text-[10px] text-[var(--mu)]">Upvotes per post</span>
          </div>
        </div>
      </div>

      {/* Scoring Mode Explanation Banner */}
      <div className="p-4 rounded-card bg-[var(--sf)] border border-[var(--bd)] text-xs text-[var(--tx)] flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-[var(--ac)] flex-none mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-sm block">Active Calculation Formula</span>
          <p className="text-[var(--mu)] leading-relaxed">
            {analytics.scoringMode === 'volume' ? (
              <>
                <strong>Volume-Weighted Scoring is ACTIVE:</strong> Each member's score equals their
                total accepted upvotes (<code>score = upvotes</code>). Members who produce a higher
                volume of approved work receive a proportionally larger slice of the work chart.
              </>
            ) : (
              <>
                <strong>Quality-Based Scoring is ACTIVE (Default):</strong> Each member's score
                measures average helpfulness per contribution (
                <code>score = total_upvotes / total_posts</code>). Every post requires review to
                prove its value to the group.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Member Cards Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight text-[var(--tx)] px-1">
          Team Member Contribution Breakdown
        </h3>

        <div className="space-y-3">
          {analytics.memberShares.map((m) => (
            <div
              key={m.userId}
              className="p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-none"
                    style={{ backgroundColor: m.color }}
                  >
                    {m.displayName ? m.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--tx)]">{m.displayName}</span>
                      {m.userId === currentUserId && (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[var(--sf)] text-[var(--ac)] font-semibold border border-[var(--bd)]">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--mu)]">
                      {m.totalPosts} {m.totalPosts === 1 ? 'post' : 'posts'} ·{' '}
                      {m.upvotesReceived} upvotes · {m.downvotesReceived} downvotes
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-extrabold text-[var(--tx)] tnum block">
                    {m.sharePercentage}%
                  </span>
                  <span className="text-[10px] text-[var(--mu)] uppercase tracking-wider font-mono">
                    Score: {m.score}
                  </span>
                </div>
              </div>

              {/* Share Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[var(--sf)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(m.sharePercentage, 2)}%`,
                    backgroundColor: m.color,
                  }}
                />
              </div>

              {/* Detailed Metrics Line */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[var(--mu)]">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-[var(--mu)]">
                    Ratio
                  </span>
                  <span className="font-semibold text-[var(--tx)] tnum">{m.ratio} avg/post</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-[var(--mu)]">
                    Group Upvotes
                  </span>
                  <span className="font-semibold text-emerald-400 tnum">
                    {m.groupVotesReceived}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-[var(--mu)]">
                    "For Me" Upvotes
                  </span>
                  <span className="font-semibold text-indigo-400 tnum">
                    {m.selfVotesReceived}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-[var(--mu)]">
                    Pending Reviews
                  </span>
                  <span className="font-semibold text-amber-400 tnum">
                    {m.pendingVotesCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analytics.insights.highestRatioMember && (
          <div className="p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-none">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider block">
                Highest Helpfulness Ratio
              </span>
              <p className="text-sm font-bold text-[var(--tx)]">
                {analytics.insights.highestRatioMember}
              </p>
              <p className="text-[11px] text-[var(--mu)]">
                Highest average reviews per contribution
              </p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-none">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[var(--mu)] uppercase tracking-wider block">
              Team Review Backlog
            </span>
            <p className="text-sm font-bold text-[var(--tx)] tnum">
              {analytics.totalVotesPending} votes pending
            </p>
            <p className="text-[11px] text-[var(--mu)]">
              Across all contributions in this project
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Over Time Chart */}
      {analytics.timeline.length > 0 && (
        <div className="p-5 rounded-card border border-[var(--bd)] bg-[var(--card)] shadow-card space-y-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[var(--tx)]">
              Contribution Timeline
            </h3>
            <p className="text-[11px] text-[var(--mu)]">
              Daily posts and approved upvotes activity
            </p>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.timeline}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUpvotes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f8f78" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2f8f78" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--mu)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--mu)" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--bd)',
                    borderRadius: '12px',
                    color: 'var(--tx)',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="postsCount"
                  name="Posts"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorPosts)"
                />
                <Area
                  type="monotone"
                  dataKey="upvotesCount"
                  name="Upvotes"
                  stroke="#2f8f78"
                  fillOpacity={1}
                  fill="url(#colorUpvotes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
