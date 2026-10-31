import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import {
  createTeam,
  joinTeam,
  getTeams,
  getTeam,
  updateTeam,
  leaveTeam,
  removeMember,
  createDemoTeam,
} from '../controllers/team.controller';
import { createPost, getTeamPosts } from '../controllers/post.controller';
import { getTeamAnalytics } from '../controllers/analytics.controller';
import { sseHub } from '../services/sse.service';

const router = Router();

const joinCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: { error: 'Too many join attempts. Please try again shortly.' },
});

router.use(requireAuth);

// Team CRUD & Members
router.get('/', getTeams);
router.post('/', createTeam);
router.post('/join', joinCodeLimiter, joinTeam);
router.post('/demo', createDemoTeam);
router.get('/:id', getTeam);
router.patch('/:id', updateTeam);
router.delete('/:id/members/me', leaveTeam);
router.delete('/:id/members/:userId', removeMember);

// Team Posts & Analytics
router.get('/:teamId/posts', getTeamPosts);
router.post('/:teamId/posts', createPost);
router.get('/:teamId/analytics', getTeamAnalytics);

// Realtime Server-Sent Events (SSE)
router.get('/:teamId/events', (req, res) => {
  const teamId = req.params.teamId;
  const clientId = `${req.user?.userId || 'anon'}-${Date.now()}`;
  sseHub.addClient(teamId, clientId, res);
});

export default router;
