import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth, requireRole } from '../../shared/auth';
import { success } from '../../shared/http';
import { createProjectTemplate, getProjectTemplateById, listProjectTemplates } from './template.repository';

export const templateRouter = Router();

templateRouter.use(requireAuth);

templateRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const list = await listProjectTemplates();

    return success(res, {
      list,
      page: 1,
      pageSize: 20,
      total: list.length
    });
  })
);

templateRouter.post(
  '/',
  requireRole(['admin', 'dispatcher']),
  asyncHandler(async (req, res) => {
    const template = await createProjectTemplate(req.body);
    return success(res, template, 'template created');
  })
);

templateRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const template = await getProjectTemplateById(Number(req.params.id));
    return success(res, template);
  })
);
