import express from 'express';
import path from 'path';
import { env } from './config/env';
import { attachmentRouter } from './modules/attachment/attachment.router';
import { dashboardRouter } from './modules/dashboard/dashboard.router';
import { dictionaryRouter } from './modules/dictionary/dictionary.router';
import { auditRouter } from './modules/audit/audit.router';
import { authRouter } from './modules/auth/auth.router';
import { importExportRouter } from './modules/import-export/import-export.router';
import { projectRouter } from './modules/project/project.router';
import { printRouter } from './modules/print/print.router';
import { setupListRouter } from './modules/setup-list/setup-list.router';
import { templateRouter } from './modules/template/template.router';
import { userRouter } from './modules/user/user.router';
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

  app.use(express.json({ limit: '20mb' }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'server' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/dictionaries', dictionaryRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/project-templates', templateRouter);
  app.use('/api/projects', projectRouter);
  app.use('/api/print', printRouter);
  app.use('/api/work-orders', workOrderRouter);
  app.use('/api/setup-lists', setupListRouter);
  app.use('/api/import-export', importExportRouter);
  app.use('/api/attachments', attachmentRouter);
  app.use('/api/audit-logs', auditRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    return failure(res, 'internal server error');
  });

  return app;
}
