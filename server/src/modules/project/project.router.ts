import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { success } from '../../shared/http';
import { createProject, deleteProject, getProjectById, listProjects, updateProjectStatus } from './project.repository';

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const projects = await listProjects(
      typeof req.query.keyword === 'string' ? req.query.keyword : undefined,
      req.query.category === 'history' ? 'history' : 'current'
    );

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

projectRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const project = await updateProjectStatus(Number(req.params.id), req.body.status || 'draft');
    return success(res, project, 'project status updated');
  })
);

projectRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await deleteProject(Number(req.params.id));
    return success(res, deleted, 'project deleted');
  })
);
