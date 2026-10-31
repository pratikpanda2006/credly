import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PORT, CLIENT_URL } from './config/constants';
import authRoutes from './routes/auth.routes';
import teamRoutes from './routes/team.routes';
import postRoutes from './routes/post.routes';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // Allow client development and Vite HMR
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        origin === CLIENT_URL ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production deployment
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'credly-api', timestamp: new Date().toISOString() });
});

// Auth Routes
app.use('/auth', authRoutes);

// Team Routes
app.use('/teams', teamRoutes);

// Post Routes
app.use('/posts', postRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error occurred' });
});

app.listen(PORT, () => {
  console.log(`🚀 Credly API server listening at http://localhost:${PORT}`);
});

export default app;
