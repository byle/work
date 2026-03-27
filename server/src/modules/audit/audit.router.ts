import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { success } from '../../shared/http';
import { listAuditLogs } from './audit.repository';

export const auditRouter = Router();

auditRouter.use(requireAuth);

auditRouter.get(
  '/:bizType/:bizId',
  asyncHandler(async (req, res) => {
    const list = await listAuditLogs(String(req.params.bizType), Number(req.params.bizId));
    return success(res, list);
  })
);
