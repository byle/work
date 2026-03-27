import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth, requireRole } from '../../shared/auth';
import { success } from '../../shared/http';
import { listDictionaryItems, updateDictionaryItem, upsertDictionaryItem } from './dictionary.repository';

export const dictionaryRouter = Router();

dictionaryRouter.use(requireAuth);

dictionaryRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const dictType = typeof req.query.dictType === 'string' ? req.query.dictType : undefined;
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : undefined;
    const items = await listDictionaryItems(dictType, keyword);
    return success(res, {
      list: items,
      page: 1,
      pageSize: 200,
      total: items.length
    });
  })
);

dictionaryRouter.post(
  '/',
  requireRole(['admin', 'dispatcher']),
  asyncHandler(async (req, res) => {
    const item = await upsertDictionaryItem(req.body);
    return success(res, item, 'dictionary item saved');
  })
);

dictionaryRouter.patch(
  '/:id',
  requireRole(['admin', 'dispatcher']),
  asyncHandler(async (req, res) => {
    const item = await updateDictionaryItem(Number(req.params.id), req.body);
    return success(res, item, 'dictionary item updated');
  })
);
