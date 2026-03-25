import express from 'express';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { projectRouter } from './modules/project/project.router';
import { setupListRouter } from './modules/setup-list/setup-list.router';
import { workOrderRouter } from './modules/work-order/work-order.router';
import { failure } from './shared/http';

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && env.corsOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }

    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'server' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/work-orders', workOrderRouter);
  app.use('/api/setup-lists', setupListRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    return failure(res, 'internal server error');
  });

  return app;
}
