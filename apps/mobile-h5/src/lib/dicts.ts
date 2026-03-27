export const workOrderTypeMap: Record<string, string> = {
  setup: '现场搭建',
  survey: '现场勘察',
  warehouse: '设备备货',
  teardown: '撤场回收'
};

export const workOrderPriorityMap: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低'
};

export const workOrderStatusMap: Record<string, string> = {
  pending_assign: '待分配',
  in_progress: '执行中',
  pending_review: '待审核',
  approved: '已通过',
  rejected: '已驳回'
};

export function getWorkOrderTypeLabel(value: string) {
  return workOrderTypeMap[value] || value;
}

export function getWorkOrderPriorityLabel(value: string) {
  return workOrderPriorityMap[value] || value;
}

export function getWorkOrderStatusLabel(value: string) {
  return workOrderStatusMap[value] || value;
}
