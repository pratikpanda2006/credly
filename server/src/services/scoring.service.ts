export const MEMBER_COLORS = [
  '#2f8f78',
  '#e0a030',
  '#6b7fd7',
  '#d9667a',
  '#8a6bbf',
  '#4aa3c7',
];

export interface MemberRawStats {
  userId: string;
  displayName: string;
  posts: number;
  groupVotes: number;
  selfVotes: number;
  downvotes: number;
  pendingVotes: number;
}

export interface ComputedMemberShare {
  userId: string;
  displayName: string;
  color: string;
  totalPosts: number;
  upvotesReceived: number;
  groupVotesReceived: number;
  selfVotesReceived: number;
  downvotesReceived: number;
  ratio: number;
  score: number;
  sharePercentage: number;
  pendingVotesCount: number;
}

export interface ScoringResult {
  hasChart: boolean;
  scoringMode: 'quality' | 'volume';
  totalTeamPosts: number;
  totalTeamUpvotes: number;
  totalVotesPending: number;
  memberShares: ComputedMemberShare[];
}

export function computeShares(
  statsList: MemberRawStats[],
  weightByPosts: boolean = false
): ScoringResult {
  const scoringMode = weightByPosts ? 'volume' : 'quality';

  let totalTeamPosts = 0;
  let totalTeamUpvotes = 0;
  let totalVotesPending = 0;

  const memberShares: ComputedMemberShare[] = statsList.map((stat, index) => {
    const totalPosts = stat.posts;
    const upvotesReceived = stat.groupVotes + stat.selfVotes;
    const ratio = totalPosts > 0 ? upvotesReceived / totalPosts : 0;

    totalTeamPosts += totalPosts;
    totalTeamUpvotes += upvotesReceived;
    totalVotesPending += stat.pendingVotes;

    // Mode 1 (Quality): ratio = upvotes / posts (0 if posts == 0)
    // Mode 2 (Volume): score = upvotes
    const score = weightByPosts ? upvotesReceived : ratio;

    return {
      userId: stat.userId,
      displayName: stat.displayName,
      color: MEMBER_COLORS[index % MEMBER_COLORS.length],
      totalPosts,
      upvotesReceived,
      groupVotesReceived: stat.groupVotes,
      selfVotesReceived: stat.selfVotes,
      downvotesReceived: stat.downvotes,
      ratio: Math.round(ratio * 100) / 100,
      score: Math.round(score * 100) / 100,
      sharePercentage: 0, // computed below
      pendingVotesCount: stat.pendingVotes,
    };
  });

  const totalScore = memberShares.reduce((sum, m) => sum + m.score, 0);

  if (totalScore > 0) {
    memberShares.forEach((m) => {
      m.sharePercentage = Math.round((m.score / totalScore) * 1000) / 10;
    });
  }

  return {
    hasChart: totalScore > 0,
    scoringMode,
    totalTeamPosts,
    totalTeamUpvotes,
    totalVotesPending,
    memberShares,
  };
}
