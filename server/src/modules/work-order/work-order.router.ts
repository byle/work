import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth, requireRole } from '../../shared/auth';
import { success } from '../../shared/http';
import { assignWorkOrder, createWorkOrder, getWorkOrderById, listMyWorkOrders, listWorkOrders, updateWorkOrderStatus } from './work-order.repository';

export const workOrderRouter = Router();

workOrderRouter.use(requireAuth);

workOrderRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const mine = req.query.mine === 'true';
    const workOrders = mine && req.user ? await listMyWorkOrders(req.user.id) : await listWorkOrders();

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
  requireRole(['admin', 'dispatcher']),
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

workOrderRouter.patch(
  '/:id/assign',
  requireRole(['admin', 'dispatcher']),
  asyncHandler(async (req, res) => {
    const workOrder = await assignWorkOrder(Number(req.params.id), req.body.assigneeId ?? null, req.body.reviewerId ?? null);

    return success(res, workOrder, 'work order assigned');
  })
);

workOrderRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const workOrder = await updateWorkOrderStatus(Number(req.params.id), req.body, req.user!.id);

    return success(res, workOrder, 'work order status updated');
  })
);
