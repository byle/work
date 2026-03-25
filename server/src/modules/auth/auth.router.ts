import { Router } from 'express';
import { createToken, requireAuth } from '../../shared/auth';
import { failure, success } from '../../shared/http';
import { findUserById, validateUserPassword } from './auth.repository';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return failure(res, 'username and password are required', 4001, 400);
  }

  const user = await validateUserPassword(username, password);

  if (!user) {
    return failure(res, 'invalid username or password', 4002, 400);
  }

  return success(res, {
    token: createToken(user),
    user
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.user!.id);
  return success(res, user);
});

authRouter.post('/logout', requireAuth, (_req, res) => {
  return success(res, true);
});
