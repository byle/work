import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth, requireRole } from '../../shared/auth';
import { success } from '../../shared/http';
import { createUser, listUsers } from '../auth/auth.repository';

export const userRouter = Router();

userRouter.use(requireAuth, requireRole(['admin', 'dispatcher']));

userRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    return success(res, {
      list: users,
      page: 1,
      pageSize: 50,
      total: users.length
    });
  })
);

userRouter.post(
  '/',
  requireRole(['admin']),
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body);
    return success(res, user, 'user created');
  })
);
