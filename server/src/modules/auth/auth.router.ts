import { Router } from 'express';
import { success } from '../../shared/http';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { username } = req.body as { username?: string };

  return success(res, {
    token: 'demo-token',
    user: {
      id: 1,
      username: username || 'demo',
      realName: '演示用户',
      roles: ['admin']
    }
  });
});

authRouter.get('/me', (_req, res) => {
  return success(res, {
    id: 1,
    username: 'demo',
    realName: '演示用户',
    roles: ['admin']
  });
});

authRouter.post('/logout', (_req, res) => {
  return success(res, true);
});
