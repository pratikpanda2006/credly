import { describe, it, expect } from 'vitest';
import { computeShares, MemberRawStats } from './scoring.service';

describe('Share of Work Scoring System', () => {
  describe('Mode 1: Quality-based scoring (Default, OFF)', () => {
    it('calculates ratio as total_upvotes / total_posts and normalizes to 100%', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'Alice',
          posts: 2,
          groupVotes: 4,
          selfVotes: 2, // total upvotes = 6 -> ratio = 3.0
          downvotes: 0,
          pendingVotes: 0,
        },
        {
          userId: 'u2',
          displayName: 'Bob',
          posts: 1,
          groupVotes: 1,
          selfVotes: 0, // total upvotes = 1 -> ratio = 1.0
          downvotes: 1,
          pendingVotes: 0,
        },
      ];

      const result = computeShares(stats, false);

      expect(result.hasChart).toBe(true);
      expect(result.scoringMode).toBe('quality');

      const alice = result.memberShares.find((m) => m.userId === 'u1')!;
      const bob = result.memberShares.find((m) => m.userId === 'u2')!;

      expect(alice.totalPosts).toBe(2);
      expect(alice.upvotesReceived).toBe(6);
      expect(alice.ratio).toBe(3);
      expect(alice.score).toBe(3);

      expect(bob.totalPosts).toBe(1);
      expect(bob.upvotesReceived).toBe(1);
      expect(bob.ratio).toBe(1);
      expect(bob.score).toBe(1);

      // Total score = 3 + 1 = 4. Alice share = 3/4 * 100 = 75%, Bob share = 1/4 * 100 = 25%
      expect(alice.sharePercentage).toBe(75);
      expect(bob.sharePercentage).toBe(25);
    });

    it('gives a member with zero posts a score and ratio of 0', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'Active Member',
          posts: 3,
          groupVotes: 6,
          selfVotes: 0,
          downvotes: 0,
          pendingVotes: 0,
        },
        {
          userId: 'u2',
          displayName: 'Inactive Member',
          posts: 0,
          groupVotes: 0,
          selfVotes: 0,
          downvotes: 0,
          pendingVotes: 0,
        },
      ];

      const result = computeShares(stats, false);
      const inactive = result.memberShares.find((m) => m.userId === 'u2')!;

      expect(inactive.score).toBe(0);
      expect(inactive.ratio).toBe(0);
      expect(inactive.sharePercentage).toBe(0);
    });

    it('gives a member with posts but zero upvotes a score and ratio of 0', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'Member A',
          posts: 2,
          groupVotes: 4,
          selfVotes: 0,
          downvotes: 0,
          pendingVotes: 0,
        },
        {
          userId: 'u2',
          displayName: 'Member B',
          posts: 2,
          groupVotes: 0,
          selfVotes: 0,
          downvotes: 2,
          pendingVotes: 0,
        },
      ];

      const result = computeShares(stats, false);
      const memberB = result.memberShares.find((m) => m.userId === 'u2')!;

      expect(memberB.upvotesReceived).toBe(0);
      expect(memberB.ratio).toBe(0);
      expect(memberB.sharePercentage).toBe(0);
    });
  });

  describe('Mode 2: Volume-weighted scoring (ON)', () => {
    it('sets member score directly equal to total upvotes received', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'High Volume Contributor',
          posts: 10,
          groupVotes: 15,
          selfVotes: 5, // upvotes = 20
          downvotes: 1,
          pendingVotes: 0,
        },
        {
          userId: 'u2',
          displayName: 'Low Volume Contributor',
          posts: 1,
          groupVotes: 3,
          selfVotes: 2, // upvotes = 5
          downvotes: 0,
          pendingVotes: 0,
        },
      ];

      const result = computeShares(stats, true);

      expect(result.scoringMode).toBe('volume');
      const u1 = result.memberShares.find((m) => m.userId === 'u1')!;
      const u2 = result.memberShares.find((m) => m.userId === 'u2')!;

      expect(u1.score).toBe(20);
      expect(u2.score).toBe(5);

      // Total score = 25. u1 share = 20/25 * 100 = 80%, u2 share = 5/25 * 100 = 20%
      expect(u1.sharePercentage).toBe(80);
      expect(u2.sharePercentage).toBe(20);
    });
  });

  describe('Zero-Score & Empty State Safeguard', () => {
    it('returns hasChart: false when total upvotes across all members is zero', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'Alice',
          posts: 1,
          groupVotes: 0,
          selfVotes: 0,
          downvotes: 1,
          pendingVotes: 2,
        },
        {
          userId: 'u2',
          displayName: 'Bob',
          posts: 1,
          groupVotes: 0,
          selfVotes: 0,
          downvotes: 0,
          pendingVotes: 3,
        },
      ];

      const result = computeShares(stats, false);

      // Must never display an artificial equal split
      expect(result.hasChart).toBe(false);
      result.memberShares.forEach((m) => {
        expect(m.sharePercentage).toBe(0);
      });
    });

    it('returns hasChart: false when no posts exist in the team', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'Alice',
          posts: 0,
          groupVotes: 0,
          selfVotes: 0,
          downvotes: 0,
          pendingVotes: 0,
        },
      ];

      const result = computeShares(stats, false);
      expect(result.hasChart).toBe(false);
    });
  });

  describe('Voting Rules Integration', () => {
    it('correctly treats GROUP and SELF as 1 upvote each, and NO as 0', () => {
      const stats: MemberRawStats[] = [
        {
          userId: 'u1',
          displayName: 'Dev',
          posts: 1,
          groupVotes: 2, // +2 upvotes
          selfVotes: 3,  // +3 upvotes
          downvotes: 4,  // 0 upvotes
          pendingVotes: 5,
        },
      ];

      const result = computeShares(stats, false);
      const dev = result.memberShares[0];

      expect(dev.upvotesReceived).toBe(5);
      expect(dev.downvotesReceived).toBe(4);
      expect(dev.ratio).toBe(5);
    });
  });
});
