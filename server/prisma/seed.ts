import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo team...');

  // Create demo user
  const passwordHash = await argon2.hash('demopassword123');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@credly.app' },
    update: {},
    create: {
      email: 'demo@credly.app',
      displayName: 'Demo User',
      passwordHash,
    },
  });

  const riya = await prisma.user.upsert({
    where: { email: 'riya.demo@credly.internal' },
    update: {},
    create: {
      email: 'riya.demo@credly.internal',
      displayName: 'Riya',
      passwordHash: 'demo-account',
    },
  });

  const kabir = await prisma.user.upsert({
    where: { email: 'kabir.demo@credly.internal' },
    update: {},
    create: {
      email: 'kabir.demo@credly.internal',
      displayName: 'Kabir',
      passwordHash: 'demo-account',
    },
  });

  const meera = await prisma.user.upsert({
    where: { email: 'meera.demo@credly.internal' },
    update: {},
    create: {
      email: 'meera.demo@credly.internal',
      displayName: 'Meera',
      passwordHash: 'demo-account',
    },
  });

  // Check if sample team already exists
  const existingTeam = await prisma.team.findFirst({
    where: { name: { startsWith: 'Sample project' } },
  });

  if (!existingTeam) {
    const demoTeam = await prisma.team.create({
      data: {
        name: 'Sample project (demo data - to create/join your team click on My Teams)',
        joinCode: 'SAMPLE',
        createdById: demoUser.id,
        memberships: {
          create: [
            { userId: demoUser.id, role: 'ADMIN' },
            { userId: riya.id, role: 'MEMBER' },
            { userId: kabir.id, role: 'MEMBER' },
            { userId: meera.id, role: 'MEMBER' },
          ],
        },
      },
    });

    // Seed sample posts
    await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: riya.id,
        text: 'Wrote the intro and problem statement (2 pages)',
        votes: {
          create: [
            { voterId: demoUser.id, type: 'GROUP' },
            { voterId: kabir.id, type: 'GROUP' },
            { voterId: meera.id, type: 'SELF' },
          ],
        },
      },
    });

    await prisma.post.create({
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

    await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: meera.id,
        text: 'Made the slide template',
        votes: {
          create: [
            { voterId: demoUser.id, type: 'GROUP' },
            { voterId: riya.id, type: 'GROUP' },
          ],
        },
      },
    });

    await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: demoUser.id,
        text: 'Collected survey data from 20 people',
        votes: {
          create: [
            { voterId: riya.id, type: 'GROUP' },
            { voterId: meera.id, type: 'GROUP' },
          ],
        },
      },
    });

    await prisma.post.create({
      data: {
        teamId: demoTeam.id,
        authorId: riya.id,
        text: 'Booked the meeting room for Friday',
      },
    });

    console.log('Sample demo team seeded successfully with join code SAMPLE!');
  } else {
    console.log('Sample demo team already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
