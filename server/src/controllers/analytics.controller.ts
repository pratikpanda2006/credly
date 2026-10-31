import { Request, Response } from 'express';
import { prisma } from '../db';
import { computeShares, MemberRawStats } from '../services/scoring.service';

export async function getTeamAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teamId = req.params.teamId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this team.' });
      return;
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        memberships: {
          include: {
            user: { select: { id: true, displayName: true, email: true } },
          },
        },
        posts: {
          where: { deletedAt: null },
          include: {
            votes: true,
          },
        },
      },
    });

    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const totalMembers = team.memberships.length;
    const peersCount = Math.max(0, totalMembers - 1);

    // Compute raw stats per member
    const rawStats: MemberRawStats[] = team.memberships.map((m) => {
      const memberPosts = team.posts.filter((p) => p.authorId === m.userId);
      let groupVotes = 0;
      let selfVotes = 0;
      let downvotes = 0;
      let pendingVotes = 0;

      for (const p of memberPosts) {
        for (const v of p.votes) {
          if (v.type === 'GROUP') groupVotes++;
          else if (v.type === 'SELF') selfVotes++;
          else if (v.type === 'NO') downvotes++;
        }
        const reviewedPeers = p.votes.length;
        pendingVotes += Math.max(0, peersCount - reviewedPeers);
      }

      return {
        userId: m.userId,
        displayName: m.user.displayName,
        posts: memberPosts.length,
        groupVotes,
        selfVotes,
        downvotes,
        pendingVotes,
      };
    });

    const scoring = computeShares(rawStats, team.weightByPosts);

    // Timeline grouping (last 7-14 days or by dates of existing posts)
    const timelineMap: Record<string, { date: string; postsCount: number; upvotesCount: number }> = {};
    for (const p of team.posts) {
      const dateKey = p.createdAt.toISOString().slice(0, 10);
      if (!timelineMap[dateKey]) {
        timelineMap[dateKey] = { date: dateKey, postsCount: 0, upvotesCount: 0 };
      }
      timelineMap[dateKey].postsCount++;
      const up = p.votes.filter((v) => v.type === 'GROUP' || v.type === 'SELF').length;
      timelineMap[dateKey].upvotesCount += up;
    }

    const timeline = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

    // Insights
    let fewestPostsMember: string | undefined;
    let highestRatioMember: string | undefined;

    const membersWithPosts = scoring.memberShares.filter((m) => m.totalPosts > 0);
    if (membersWithPosts.length > 0) {
      const sortedByPosts = [...membersWithPosts].sort((a, b) => a.totalPosts - b.totalPosts);
      fewestPostsMember = sortedByPosts[0].displayName;

      const sortedByRatio = [...membersWithPosts].sort((a, b) => b.ratio - a.ratio);
      highestRatioMember = sortedByRatio[0].displayName;
    }

    // Current user's pending reviews
    const myPendingReviewsCount = team.posts.filter((p) => {
      if (p.authorId === userId) return false;
      return !p.votes.some((v) => v.voterId === userId);
    }).length;

    res.json({
      hasChart: scoring.hasChart,
      scoringMode: scoring.scoringMode,
      weightByPosts: team.weightByPosts,
      totalTeamPosts: scoring.totalTeamPosts,
      totalTeamUpvotes: scoring.totalTeamUpvotes,
      totalVotesPending: scoring.totalVotesPending,
      memberShares: scoring.memberShares,
      timeline,
      insights: {
        fewestPostsMember,
        highestRatioMember,
        pendingReviewsCount: myPendingReviewsCount,
      },
    });
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to retrieve analytics.' });
  }
}
