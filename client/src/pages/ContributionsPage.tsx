import React, { useState } from 'react';
import { CheckCircle2, Inbox } from 'lucide-react';
import type { Post } from '../types';
import { PostCard } from '../components/shared/PostCard';

interface ContributionsPageProps {
  posts: Post[];
  currentUserId: string;
  isTeamAdmin: boolean;
  memberColorsMap: Record<string, string>;
  initialFilter?: 'all' | 'needs-review' | 'mine';
  onPostUpdated: () => void;
  onPostDeleted?: () => void;
}

export const ContributionsPage: React.FC<ContributionsPageProps> = ({
  posts,
  currentUserId,
  isTeamAdmin,
  memberColorsMap,
  initialFilter = 'all',
  onPostUpdated,
  onPostDeleted,
}) => {
  const [filter, setFilter] = useState<'all' | 'needs-review' | 'mine'>(initialFilter);

  // Filter calculations
  const needsReviewPosts = posts.filter(
    (p) => p.authorId !== currentUserId && !p.hasUserReviewed
  );
  const myPosts = posts.filter((p) => p.authorId === currentUserId);

  const displayedPosts =
    filter === 'needs-review'
      ? needsReviewPosts
      : filter === 'mine'
      ? myPosts
      : posts;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)]">
          Contribution Details
        </h2>
        <p className="text-xs text-[var(--mu)] mt-0.5">
          Review teammates' work honestly and track all group activity.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 p-1 rounded-control bg-[var(--sf)] border border-[var(--bd)] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[var(--card)] text-[var(--tx)] shadow-sm'
              : 'text-[var(--mu)] hover:text-[var(--tx)]'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--bd)] text-[var(--tx)]">
            {posts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('needs-review')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'needs-review'
              ? 'bg-[var(--card)] text-[var(--tx)] shadow-sm'
              : 'text-[var(--mu)] hover:text-[var(--tx)]'
          }`}
        >
          <span>Needs my review</span>
          {needsReviewPosts.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--no)] text-white font-bold">
              {needsReviewPosts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('mine')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'mine'
              ? 'bg-[var(--card)] text-[var(--tx)] shadow-sm'
              : 'text-[var(--mu)] hover:text-[var(--tx)]'
          }`}
        >
          <span>Mine</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--bd)] text-[var(--tx)]">
            {myPosts.length}
          </span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-8 text-center shadow-card flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--sf)] text-[var(--mu)] flex items-center justify-center mb-3">
              {filter === 'needs-review' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Inbox className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-sm font-bold text-[var(--tx)] mb-1">
              {filter === 'needs-review'
                ? 'All caught up!'
                : filter === 'mine'
                ? 'No contributions yet'
                : 'No contributions recorded yet'}
            </h3>
            <p className="text-xs text-[var(--mu)] max-w-sm">
              {filter === 'needs-review'
                ? 'You have reviewed every post submitted by your teammates. Great teamwork!'
                : filter === 'mine'
                ? 'Head to Home or My Work to log what you accomplished.'
                : 'When team members post their work, it will appear here for review.'}
            </p>
          </div>
        ) : (
          displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isTeamAdmin={isTeamAdmin}
              memberColor={memberColorsMap[post.authorId]}
              onPostUpdated={onPostUpdated}
              onPostDeleted={onPostDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};
