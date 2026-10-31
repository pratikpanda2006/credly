export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export type Role = 'ADMIN' | 'MEMBER';

export interface Membership {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface Team {
  id: string;
  name: string;
  joinCode: string;
  weightByPosts: boolean;
  createdById: string;
  createdAt: string;
  memberships: Membership[];
  _count?: {
    memberships: number;
    posts: number;
  };
  unreadReviewCount?: number;
}

export type VoteType = 'GROUP' | 'SELF' | 'NO';

export interface Vote {
  id: string;
  postId: string;
  voterId: string;
  type: VoteType;
  reason?: string | null;
  createdAt: string;
  voter?: {
    id: string;
    displayName: string;
  };
}

export interface Post {
  id: string;
  teamId: string;
  authorId: string;
  text: string;
  createdAt: string;
  deletedAt?: string | null;
  author: {
    id: string;
    displayName: string;
    email: string;
  };
  votes: Vote[];
  groupVotesCount: number;
  selfVotesCount: number;
  upvotesCount: number;
  downvotesCount: number;
  pendingReviewsCount: number;
  hasUserReviewed: boolean;
  userVote?: VoteType;
}

export interface MemberShare {
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

export interface AnalyticsData {
  hasChart: boolean;
  scoringMode: 'quality' | 'volume';
  weightByPosts: boolean;
  totalTeamPosts: number;
  totalTeamUpvotes: number;
  totalVotesPending: number;
  memberShares: MemberShare[];
  timeline: {
    date: string;
    postsCount: number;
    upvotesCount: number;
  }[];
  insights: {
    fewestPostsMember?: string;
    highestRatioMember?: string;
    pendingReviewsCount: number;
  };
}
