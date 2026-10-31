import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  Users,
  User as UserIcon,
  ThumbsDown,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { Post, VoteType } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  isTeamAdmin: boolean;
  memberColor?: string;
  onPostUpdated: () => void;
  onPostDeleted?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  isTeamAdmin,
  memberColor = '#2f8f78',
  onPostUpdated,
  onPostDeleted,
}) => {
  const { showToast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [reasons, setReasons] = useState<
    { id: string; voterName: string; reason: string; createdAt: string }[] | null
  >(null);
  const [loadingReasons, setLoadingReasons] = useState(false);

  // Voting state
  const [isAskingNo, setIsAskingNo] = useState(false);
  const [noReason, setNoReason] = useState('');
  const [voteError, setVoteError] = useState<string | null>(null);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = post.authorId === currentUserId;
  const canDelete = isAuthor || isTeamAdmin;

  const handleVote = async (type: VoteType, reasonText?: string) => {
    setVoteError(null);
    setSubmittingVote(true);
    try {
      await api.voteOnPost(post.id, type, reasonText);
      showToast(
        type === 'NO' ? 'Feedback recorded.' : 'Vote registered!'
      );
      setIsAskingNo(false);
      setNoReason('');
      onPostUpdated();
    } catch (err: any) {
      setVoteError(err.message || 'Failed to submit vote.');
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleToggleDetails = async () => {
    if (!showDetails && reasons === null) {
      setLoadingReasons(true);
      try {
        const res = await api.getPostReasons(post.id);
        setReasons(res.reasons);
      } catch (err) {
        setReasons([]);
      } finally {
        setLoadingReasons(false);
      }
    }
    setShowDetails(!showDetails);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
    setDeleting(true);
    try {
      await api.deletePost(post.id);
      showToast('Post deleted.');
      if (onPostDeleted) onPostDeleted();
      else onPostUpdated();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete post.');
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const authorInitial = post.author.displayName
    ? post.author.displayName.trim()[0].toUpperCase()
    : 'U';

  return (
    <div className="w-full rounded-card border border-[var(--bd)] bg-[var(--card)] p-5 shadow-card transition-all">
      {/* Top Header: Author + Delete action */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full text-white font-bold text-sm flex items-center justify-center flex-none shadow-sm"
            style={{ backgroundColor: memberColor }}
          >
            {authorInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[var(--tx)]">
                {post.author.displayName}
              </span>
              {isAuthor && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sf)] text-[var(--ac)] font-semibold border border-[var(--bd)]">
                  You
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--mu)] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(post.createdAt)}</span>
            </span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-control text-[var(--mu)] hover:text-[var(--no)] hover:bg-[var(--sf)] transition-colors"
            title="Delete post"
            aria-label="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-sm text-[var(--tx)] leading-relaxed mb-4 whitespace-pre-wrap">
        {post.text}
      </p>

      {/* Tags / Statistics Chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--sf)] text-[var(--tx)] border border-[var(--bd)] font-medium">
          ⭐ 1 base
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tnum">
          <ThumbsUp className="w-3 h-3" />
          <span>{post.upvotesCount} upvotes</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium tnum">
          <Users className="w-3 h-3" />
          <span>{post.groupVotesCount} group</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium tnum">
          <UserIcon className="w-3 h-3" />
          <span>{post.selfVotesCount} me</span>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-[var(--no)] border border-red-500/20 font-medium tnum">
          <ThumbsDown className="w-3 h-3" />
          <span>{post.downvotesCount}</span>
        </span>
      </div>

      {/* Details toggle button (only shown if downvotes exist) */}
      {post.downvotesCount > 0 && (
        <div className="mb-3">
          <button
            type="button"
            onClick={handleToggleDetails}
            className="text-xs text-[var(--mu)] hover:text-[var(--tx)] inline-flex items-center gap-1 py-1 px-2 rounded-control bg-[var(--sf)] hover:bg-[var(--bd)] transition-colors font-medium"
          >
            <span>{showDetails ? 'Hide details' : 'Details'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2.5 pl-3 border-l-2 border-[var(--no)] space-y-2 overflow-hidden"
              >
                {loadingReasons ? (
                  <p className="text-xs text-[var(--mu)] py-1">Loading feedback reasons...</p>
                ) : reasons && reasons.length > 0 ? (
                  reasons.map((r) => (
                    <div key={r.id} className="text-xs py-1">
                      <span className="font-semibold text-[var(--tx)]">{r.voterName}: </span>
                      <span className="text-[var(--mu)] italic">"{r.reason}"</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[var(--mu)] italic">No written notes recorded.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Voting / Review Section */}
      <div className="pt-3 border-t border-[var(--bd)]">
        {isAuthor ? (
          <div className="text-xs text-[var(--mu)] flex items-center justify-between">
            <span>
              {post.pendingReviewsCount > 0
                ? `Waiting for ${post.pendingReviewsCount} teammate(s) to review`
                : '✓ All teammates reviewed'}
            </span>
          </div>
        ) : post.hasUserReviewed ? (
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>
              You reviewed this (
              {post.userVote === 'GROUP'
                ? 'For the group'
                : post.userVote === 'SELF'
                ? 'For me'
                : 'No'}
              )
            </span>
          </div>
        ) : isAskingNo ? (
          /* Inline "No" reason prompt */
          <div className="mt-2 p-3 rounded-control bg-[var(--sf)] border border-[var(--bd)] space-y-2.5">
            <p className="text-xs font-semibold text-[var(--tx)]">
              Why was it not helpful? <span className="text-[var(--mu)] font-normal">(5+ characters required)</span>
            </p>
            <textarea
              rows={2}
              placeholder="e.g. Incomplete notes, already completed by someone else, etc."
              value={noReason}
              onChange={(e) => setNoReason(e.target.value)}
              className="w-full p-2.5 rounded-control border border-[var(--bd)] bg-[var(--bg)] text-[var(--tx)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ac)] resize-none"
            />
            {voteError && (
              <p className="text-[11px] text-[var(--no)] flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-none" />
                <span>{voteError}</span>
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAskingNo(false);
                  setVoteError(null);
                  setNoReason('');
                }}
                className="px-3 py-1.5 text-xs text-[var(--mu)] hover:text-[var(--tx)] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingVote || noReason.trim().length < 5}
                onClick={() => handleVote('NO', noReason)}
                className="px-3 py-1.5 text-xs rounded-control bg-[var(--no)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {submittingVote ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        ) : (
          /* Main 3 Voting Buttons */
          <div>
            <p className="text-xs text-[var(--mu)] font-medium mb-2">Was this helpful?</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={submittingVote}
                onClick={() => handleVote('GROUP')}
                className="flex-1 min-w-[110px] py-2 px-2.5 rounded-control border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>For the group</span>
              </button>

              <button
                type="button"
                disabled={submittingVote}
                onClick={() => handleVote('SELF')}
                className="flex-1 min-w-[90px] py-2 px-2.5 rounded-control border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>For me</span>
              </button>

              <button
                type="button"
                disabled={submittingVote}
                onClick={() => {
                  setIsAskingNo(true);
                  setVoteError(null);
                }}
                className="py-2 px-3 rounded-control border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-[var(--no)] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
