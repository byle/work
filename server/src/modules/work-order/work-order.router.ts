import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { success } from '../../shared/http';
import { createWorkOrder, getWorkOrderById, listWorkOrders } from './work-order.repository';

export const workOrderRouter = Router();

workOrderRouter.use(requireAuth);

workOrderRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const workOrders = await listWorkOrders();

    return success(res, {
      list: workOrders,
      page: 1,
      pageSize: 20,
      total: workOrders.length
    });
  })
);

workOrderRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const workOrder = await createWorkOrder(req.body);

    return success(res, workOrder, 'work order created');
  })
);

workOrderRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const workOrder = await getWorkOrderById(Number(req.params.id));

    return success(res, workOrder);
  })
);

workOrderRouter.patch('/:id/status', (req, res) => {
  return success(
    res,
    {
      id: Number(req.params.id),
      status: req.body.status || 'pending_assign'
    },
    'work order status updated'
  );
});
