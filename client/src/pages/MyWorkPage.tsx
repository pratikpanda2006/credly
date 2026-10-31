import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Post, Team } from '../types';
import { PostBox } from '../components/shared/PostBox';
import { PostCard } from '../components/shared/PostCard';

interface MyWorkPageProps {
  activeTeam: Team;
  posts: Post[];
  currentUserId: string;
  isTeamAdmin: boolean;
  memberColorsMap: Record<string, string>;
  onPostCreated: () => void;
  onPostUpdated: () => void;
}

export const MyWorkPage: React.FC<MyWorkPageProps> = ({
  activeTeam,
  posts,
  currentUserId,
  isTeamAdmin,
  memberColorsMap,
  onPostCreated,
  onPostUpdated,
}) => {
  // Filter ONLY the user's own posts
  const myPosts = posts.filter((p) => p.authorId === currentUserId);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--tx)]">
          My Work
        </h2>
        <p className="text-xs text-[var(--mu)] mt-0.5">
          Record your contributions and monitor reviews from teammates.
        </p>
      </div>

      {/* Post Box */}
      <PostBox teamId={activeTeam.id} onPostCreated={onPostCreated} />

      {/* List of user's own posts */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between text-xs text-[var(--mu)] font-semibold px-1">
          <span>Your Contributions ({myPosts.length})</span>
          <span>Newest First</span>
        </div>

        {myPosts.length === 0 ? (
          <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-8 text-center shadow-card flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[var(--sf)] text-[var(--ac)] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--tx)] mb-1">No work recorded yet</h3>
            <p className="text-xs text-[var(--mu)] max-w-sm">
              Write what you did in the box above. Every contribution, big or small, helps establish your fair share of the work.
            </p>
          </div>
        ) : (
          myPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isTeamAdmin={isTeamAdmin}
              memberColor={memberColorsMap[post.authorId]}
              onPostUpdated={onPostUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
};
