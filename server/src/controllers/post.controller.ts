import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { sseHub } from '../services/sse.service';

const createPostSchema = z.object({
  text: z
    .string()
    .trim()
    .min(8, 'Add a bit more detail (8+ characters).')
    .max(280, 'Post cannot exceed 280 characters.'),
});

const voteSchema = z.object({
  type: z.enum(['GROUP', 'SELF', 'NO'], {
    errorMap: () => ({ message: 'Vote must be GROUP, SELF, or NO.' }),
  }),
  reason: z.string().trim().optional(),
});

export async function createPost(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teamId = req.params.teamId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify membership
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

    const parseResult = createPostSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { text } = parseResult.data;

    // Check duplicate of same author in same team (case-insensitive)
    const existingPosts = await prisma.post.findMany({
      where: {
        teamId,
        authorId: userId,
        deletedAt: null,
      },
      select: { text: true },
    });

    const isDuplicate = existingPosts.some(
      (p) => p.text.toLowerCase().trim() === text.toLowerCase().trim()
    );

    if (isDuplicate) {
      res.status(400).json({ error: 'You already posted this.' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        teamId,
        authorId: userId,
        text,
      },
      include: {
        author: {
          select: { id: true, displayName: true, email: true },
        },
        votes: true,
      },
    });

    const postResponse = {
      ...post,
      groupVotesCount: 0,
      selfVotesCount: 0,
      upvotesCount: 0,
      downvotesCount: 0,
      pendingReviewsCount: 0, // Will be computed on client
      hasUserReviewed: false,
    };

    // Broadcast realtime event to team members
    sseHub.broadcast(teamId, 'POST_CREATED', { post: postResponse });

    res.status(201).json({ post: postResponse });
  } catch (err: any) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
}

export async function getTeamPosts(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teamId = req.params.teamId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify membership
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

    // Get total members to calculate pending reviews
    const totalMembers = await prisma.membership.count({
      where: { teamId },
    });
    const peersCount = Math.max(0, totalMembers - 1);

    const posts = await prisma.post.findMany({
      where: {
        teamId,
        deletedAt: null,
      },
      include: {
        author: {
          select: { id: true, displayName: true, email: true },
        },
        votes: {
          select: {
            id: true,
            postId: true,
            voterId: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPosts = posts.map((post) => {
      const groupVotesCount = post.votes.filter((v) => v.type === 'GROUP').length;
      const selfVotesCount = post.votes.filter((v) => v.type === 'SELF').length;
      const downvotesCount = post.votes.filter((v) => v.type === 'NO').length;
      const upvotesCount = groupVotesCount + selfVotesCount;
      const totalVotes = post.votes.length;
      const pendingReviewsCount = Math.max(0, peersCount - totalVotes);

      const userVoteObj = post.votes.find((v) => v.voterId === userId);
      const hasUserReviewed = !!userVoteObj;
      const userVote = userVoteObj ? (userVoteObj.type as 'GROUP' | 'SELF' | 'NO') : undefined;

      return {
        ...post,
        groupVotesCount,
        selfVotesCount,
        upvotesCount,
        downvotesCount,
        pendingReviewsCount,
        hasUserReviewed,
        userVote,
      };
    });

    res.json({ posts: formattedPosts });
  } catch (err: any) {
    console.error('Error getting posts:', err);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const postId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { team: { include: { memberships: true } } },
    });

    if (!post || post.deletedAt !== null) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const userMembership = post.team.memberships.find((m) => m.userId === userId);
    const isAdmin = userMembership?.role === 'ADMIN';
    const isAuthor = post.authorId === userId;

    if (!isAdmin && !isAuthor) {
      res.status(403).json({ error: 'You do not have permission to delete this post.' });
      return;
    }

    // Soft delete
    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });

    sseHub.broadcast(post.teamId, 'POST_DELETED', { postId });

    res.json({ success: true, message: 'Post removed.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
}

export async function voteOnPost(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const postId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parseResult = voteSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { type, reason } = parseResult.data;

    // NO vote requires written reason >= 5 characters
    if (type === 'NO') {
      if (!reason || reason.trim().length < 5) {
        res.status(400).json({ error: 'Please explain why (5+ characters).' });
        return;
      }
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        team: {
          include: { memberships: true },
        },
      },
    });

    if (!post || post.deletedAt !== null) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    // Verify voter is a member of the team
    const isMember = post.team.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      res.status(403).json({ error: 'Only team members can vote.' });
      return;
    }

    // No voting on your own post
    if (post.authorId === userId) {
      res.status(400).json({ error: 'You cannot vote on your own post.' });
      return;
    }

    // Check if user already voted on this post
    const existingVote = await prisma.vote.findUnique({
      where: {
        postId_voterId: {
          postId,
          voterId: userId,
        },
      },
    });

    if (existingVote) {
      res.status(400).json({ error: 'You already reviewed this post.' });
      return;
    }

    const vote = await prisma.vote.create({
      data: {
        postId,
        voterId: userId,
        type,
        reason: type === 'NO' ? reason?.trim() : null,
      },
    });

    // Notify connected team members via SSE
    sseHub.broadcast(post.teamId, 'VOTE_CAST', {
      postId,
      voterId: userId,
      type,
    });

    res.status(201).json({ vote, message: 'Vote recorded.' });
  } catch (err: any) {
    console.error('Error voting on post:', err);
    res.status(500).json({ error: 'Failed to record vote.' });
  }
}

export async function getPostReasons(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const postId = req.params.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        team: { include: { memberships: true } },
      },
    });

    if (!post || post.deletedAt !== null) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const isMember = post.team.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const noVotes = await prisma.vote.findMany({
      where: {
        postId,
        type: 'NO',
        reason: { not: null },
      },
      include: {
        voter: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reasons = noVotes.map((v) => ({
      id: v.id,
      voterName: v.voter.displayName,
      reason: v.reason || '',
      createdAt: v.createdAt.toISOString(),
    }));

    res.json({ reasons });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve reasons.' });
  }
}
