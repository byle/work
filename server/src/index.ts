import { createApp } from './app';
import { env } from './config/env';
import { ensureAuditLogTable } from './modules/audit/audit.repository';
import { seedDefaultAdmin } from './modules/auth/auth.repository';
import { seedDefaultTemplates } from './modules/template/template.repository';

async function bootstrap() {
  await ensureAuditLogTable();
  await seedDefaultAdmin();
  await seedDefaultTemplates();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
