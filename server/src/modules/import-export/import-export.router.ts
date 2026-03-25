import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { success } from '../../shared/http';
import { exportSetupListItemsCsv, importSetupListItems } from './import-export.repository';

export const importExportRouter = Router();

importExportRouter.use(requireAuth);

importExportRouter.post(
  '/setup-lists/:id/items/import',
  asyncHandler(async (req, res) => {
    const result = await importSetupListItems(Number(req.params.id), req.body.rows ?? []);
    return success(res, result, 'setup list items imported');
  })
);

importExportRouter.get(
  '/setup-lists/:id/items/export',
  asyncHandler(async (req, res) => {
    const csv = await exportSetupListItemsCsv(Number(req.params.id));
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="setup-list-${req.params.id}-items.csv"`);
    return res.send(csv);
  })
);
