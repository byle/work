import express from 'express';
import { authRouter } from './modules/auth/auth.router';
import { projectRouter } from './modules/project/project.router';
import { setupListRouter } from './modules/setup-list/setup-list.router';
import { workOrderRouter } from './modules/work-order/work-order.router';
import { failure } from './shared/http';

export function createApp() {
  const app = express();

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
