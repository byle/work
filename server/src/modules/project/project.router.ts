import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { success } from '../../shared/http';
import { createProject, getProjectById, listProjects } from './project.repository';

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await listProjects(typeof req.query.keyword === 'string' ? req.query.keyword : undefined);

    return success(res, {
      list: projects,
      page: 1,
      pageSize: 20,
      total: projects.length
    });
  })
);

projectRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const project = await createProject(req.body);

    return success(res, project, 'project created');
  })
);

projectRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const project = await getProjectById(Number(req.params.id));

    return success(res, project);
  })
);

projectRouter.put('/:id', (req, res) => {
  return success(
    res,
    {
      id: Number(req.params.id),
      ...req.body
    },
    'project updated'
  );
});

projectRouter.patch('/:id/status', (req, res) => {
  return success(
    res,
    {
      id: Number(req.params.id),
      status: req.body.status || 'draft'
    },
    'project status updated'
  );
});
