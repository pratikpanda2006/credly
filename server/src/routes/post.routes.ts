import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { voteOnPost, getPostReasons, deletePost } from '../controllers/post.controller';

const router = Router();

router.use(requireAuth);

router.post('/:id/vote', voteOnPost);
router.get('/:id/reasons', getPostReasons);
router.delete('/:id', deletePost);

export default router;
