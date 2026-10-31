import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { generateJoinCode } from '../utils/code';

const createTeamSchema = z.object({
  name: z.string().trim().min(3, 'Give your team a name (3+ characters).'),
});

const joinTeamSchema = z.object({
  joinCode: z.string().trim().length(6, 'Team codes have 6 characters.'),
});

const updateTeamSchema = z.object({
  name: z.string().trim().min(3, 'Team name needs 3+ characters.').optional(),
  weightByPosts: z.boolean().optional(),
});

export async function createTeam(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parseResult = createTeamSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { name } = parseResult.data;

    // Generate unique unambiguous join code
    let joinCode = generateJoinCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.team.findUnique({ where: { joinCode } });
      if (!existing) break;
      joinCode = generateJoinCode();
      attempts++;
    }

    const team = await prisma.team.create({
      data: {
        name,
        joinCode,
        createdById: userId,
        memberships: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, createdAt: true },
            },
          },
        },
      },
    });

    res.status(201).json({ team });
  } catch (err: any) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Failed to create team.' });
  }
}

export async function joinTeam(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parseResult = joinTeamSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const code = parseResult.data.joinCode.toUpperCase();
    const team = await prisma.team.findUnique({
      where: { joinCode: code },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, createdAt: true },
            },
          },
        },
      },
    });

    if (!team) {
      res.status(404).json({ error: 'No team found with this code. Please check it with your team admin.' });
      return;
    }

    const isMember = team.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      await prisma.membership.create({
        data: {
          userId,
          teamId: team.id,
          role: 'MEMBER',
        },
      });

      // Refetch updated team
      const updatedTeam = await prisma.team.findUnique({
        where: { id: team.id },
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, email: true, displayName: true, createdAt: true },
              },
            },
          },
        },
      });
      res.json({ team: updatedTeam });
      return;
    }

    // Already in team -> simply open it
    res.json({ team });
  } catch (err: any) {
    console.error('Error joining team:', err);
    res.status(500).json({ error: 'Failed to join team.' });
  }
}

export async function getTeams(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            memberships: {
              include: {
                user: {
                  select: { id: true, email: true, displayName: true, createdAt: true },
                },
              },
            },
            posts: {
              where: { deletedAt: null },
              include: {
                votes: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    const teams = memberships.map((m) => {
      const team = m.team;
      // Calculate how many posts in this team need the current user's review:
      // (Post author is NOT the current user AND current user hasn't voted yet)
      const unreadReviewCount = team.posts.filter((post) => {
        if (post.authorId === userId) return false;
        const userVoted = post.votes.some((v) => v.voterId === userId);
        return !userVoted;
      }).length;

      return {
        id: team.id,
        name: team.name,
        joinCode: team.joinCode,
        weightByPosts: team.weightByPosts,
        createdById: team.createdById,
        createdAt: team.createdAt,
        role: m.role,
        memberships: team.memberships,
        _count: {
          memberships: team.memberships.length,
          posts: team.posts.length,
        },
        unreadReviewCount,
      };
    });

    res.json({ teams });
  } catch (err: any) {
    console.error('Error getting teams:', err);
    res.status(500).json({ error: 'Failed to retrieve teams.' });
  }
}

export async function getTeam(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teamId = req.params.id;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_teamId: {
          userId: userId!,
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
            user: {
              select: { id: true, email: true, displayName: true, createdAt: true },
            },
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

    const unreadReviewCount = team.posts.filter((post) => {
      if (post.authorId === userId) return false;
      return !post.votes.some((v) => v.voterId === userId);
    }).length;

    res.json({
      team: {
        ...team,
        unreadReviewCount,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch team.' });
  }
}

export async function updateTeam(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teamId = req.params.id;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_teamId: {
          userId: userId!,
          teamId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this team.' });
      return;
    }

    if (membership.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only team administrators can modify team settings.' });
      return;
    }

    const parseResult = updateTeamSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: parseResult.data,
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, createdAt: true },
            },
          },
        },
      },
    });

    res.json({ team: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update team.' });
  }
}

export async function leaveTeam(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const teamId = req.params.id;

    const membership = await prisma.membership.findUnique({
      where: {
        userId_teamId: {
          userId: userId!,
          teamId,
        },
      },
    });

    if (!membership) {
      res.status(404).json({ error: 'Membership not found' });
      return;
    }

    await prisma.membership.delete({
      where: {
        userId_teamId: {
          userId: userId!,
          teamId,
        },
      },
    });

    res.json({ success: true, message: 'Successfully left team.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to leave team.' });
  }
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  try {
    const adminId = req.user?.userId;
    const { id: teamId, userId } = req.params;

    const adminMembership = await prisma.membership.findUnique({
      where: {
        userId_teamId: {
          userId: adminId!,
          teamId,
        },
      },
    });

    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only team admins can remove members.' });
      return;
    }

    await prisma.membership.delete({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    res.json({ success: true, message: 'Member removed.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to remove member.' });
  }
}

export async function createDemoTeam(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create 3 demo teammate accounts if they don't exist
    const demoTeammates = [
      { email: 'riya.demo@credly.internal', name: 'Riya' },
      { email: 'kabir.demo@credly.internal', name: 'Kabir' },
      { email: 'meera.demo@credly.internal', name: 'Meera' },
    ];

    const teammateUsers = [];
    for (const demo of demoTeammates) {
      let u = await prisma.user.findUnique({ where: { email: demo.email } });
      if (!u) {
        u = await prisma.user.create({
          data: {
            email: demo.email,
            displayName: demo.name,
            passwordHash: 'demo-account-not-for-login',
          },
        });
      }
      teammateUsers.push(u);
    }

    const riya = teammateUsers[0];
    const kabir = teammateUsers[1];
    const meera = teammateUsers[2];

    const joinCode = generateJoinCode();
    const demoTeam = await prisma.team.create({
      data: {
        name: 'Sample project (demo data - to create/join your team click on My Teams)',
        joinCode,
        createdById: userId,
        memberships: {
          create: [
            { userId, role: 'ADMIN' },
            { userId: riya.id, role: 'MEMBER' },
            { userId: kabir.id, role: 'MEMBER' },
            { userId: meera.id, role: 'MEMBER' },
          ],
        },
      },
    });

    // Sample posts matching requirements
    // Post 1 by Riya
    const p1 = await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: riya.id,
        text: 'Wrote the intro and problem statement (2 pages)',
        votes: {
          create: [
            { voterId: userId, type: 'GROUP' },
            { voterId: kabir.id, type: 'GROUP' },
            { voterId: meera.id, type: 'SELF' },
          ],
        },
      },
    });

    // Post 2 by Kabir
    const p2 = await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: kabir.id,
        text: 'Read the 3 reference papers',
        votes: {
          create: [
            { voterId: riya.id, type: 'SELF' },
            { voterId: meera.id, type: 'NO', reason: 'No notes shared, so I could not use it' },
          ],
        },
      },
    });

    // Post 3 by Meera
    const p3 = await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: meera.id,
        text: 'Made the slide template',
        votes: {
          create: [
            { voterId: userId, type: 'GROUP' },
            { voterId: riya.id, type: 'GROUP' },
          ],
        },
      },
    });

    // Post 4 by Current User
    const p4 = await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: userId,
        text: 'Collected survey data from 20 people',
        votes: {
          create: [
            { voterId: riya.id, type: 'GROUP' },
            { voterId: meera.id, type: 'GROUP' },
          ],
        },
      },
    });

    // Post 5 by Riya (unreviewed - for testing pending badge!)
    const p5 = await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: riya.id,
        text: 'Booked the meeting room for Friday',
      },
    });

    const fullTeam = await prisma.team.findUnique({
      where: { id: demoTeam.id },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, createdAt: true },
            },
          },
        },
      },
    });

    res.status(201).json({ team: fullTeam });
  } catch (err: any) {
    console.error('Error creating demo team:', err);
    res.status(500).json({ error: 'Failed to create sample team.' });
  }
}
