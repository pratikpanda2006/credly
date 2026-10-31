import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { MemberShare } from '../../types';

interface ShareDonutChartProps {
  memberShares: MemberShare[];
  hasChart: boolean;
  scoringMode: 'quality' | 'volume';
}

export const ShareDonutChart: React.FC<ShareDonutChartProps> = ({
  memberShares,
  hasChart,
  scoringMode,
}) => {
  if (!hasChart || memberShares.length === 0) {
    return (
      <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-8 shadow-card text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[var(--sf)] text-[var(--mu)] flex items-center justify-center mb-4 border border-[var(--bd)]">
          <PieChartIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[var(--tx)] mb-1">No chart yet</h3>
        <p className="text-xs text-[var(--mu)] max-w-sm mb-4 leading-relaxed">
          Contributions and teammate reviews will generate your team's live share-of-work breakdown here. Slices appear once upvotes are received.
        </p>
        <span className="text-[11px] font-semibold text-[var(--ac)] bg-[var(--sf)] px-3 py-1 rounded-full border border-[var(--bd)]">
          Fair Credit System Active
        </span>
      </div>
    );
  }

  // Filter members who have non-zero percentage for chart rendering
  const chartData = memberShares.map((m) => ({
    name: m.displayName,
    value: m.sharePercentage,
    color: m.color,
    score: m.score,
    ratio: m.ratio,
    posts: m.totalPosts,
    upvotes: m.upvotesReceived,
  }));

  return (
    <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-5 sm:p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-[var(--tx)]">Share of Work</h3>
          <p className="text-[11px] text-[var(--mu)]">
            {scoringMode === 'volume'
              ? 'Volume-weighted mode (Total accepted upvotes)'
              : 'Quality-based mode (Average upvotes per post)'}
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--sf)] text-[var(--ac)] border border-[var(--bd)] uppercase tracking-wider">
          Live
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Donut Chart */}
        <div className="w-48 h-48 relative flex-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                animationDuration={900}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, item: any) => [
                  `${value}% (${item.payload.upvotes} upvotes / ${item.payload.posts} posts)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--bd)',
                  borderRadius: '12px',
                  color: 'var(--tx)',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--mu)]">
              Total
            </span>
            <span className="text-lg font-extrabold text-[var(--tx)]">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2.5">
          {memberShares.map((m) => (
            <div
              key={m.userId}
              className="flex items-center justify-between text-xs p-2 rounded-control bg-[var(--sf)] border border-[var(--bd)]"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-none shadow-sm"
                  style={{ backgroundColor: m.color }}
                />
                <span className="font-semibold text-[var(--tx)]">{m.displayName}</span>
              </div>

              <div className="flex items-center gap-3 tnum">
                <span className="text-[11px] text-[var(--mu)]">
                  {scoringMode === 'volume'
                    ? `${m.upvotesReceived} upvotes`
                    : `${m.ratio} avg/post`}
                </span>
                <span className="font-bold text-sm text-[var(--tx)] min-w-[44px] text-right">
                  {m.sharePercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
