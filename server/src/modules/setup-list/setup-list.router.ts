import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { success } from '../../shared/http';
import {
  createSetupList,
  getSetupListById,
  listSetupListItems,
  listSetupLists
} from './setup-list.repository';

export const setupListRouter = Router();

setupListRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const setupLists = await listSetupLists();

    return success(res, {
      list: setupLists,
      page: 1,
      pageSize: 20,
      total: setupLists.length
    });
  })
);

setupListRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const setupList = await createSetupList(req.body);

    return success(res, setupList, 'setup list created');
  })
);

setupListRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const setupList = await getSetupListById(Number(req.params.id));

    return success(res, setupList);
  })
);

setupListRouter.get(
  '/:id/items',
  asyncHandler(async (req, res) => {
    const items = await listSetupListItems(Number(req.params.id));

    return success(res, items);
  })
);
