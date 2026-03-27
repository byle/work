export const workOrderTypeOptions = [
  { label: '现场搭建', value: 'setup' },
  { label: '现场勘察', value: 'survey' },
  { label: '设备备货', value: 'warehouse' },
  { label: '撤场回收', value: 'teardown' }
];

export const workOrderPriorityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
];

export const workOrderStatusOptions = [
  { label: '待分配', value: 'pending_assign' },
  { label: '执行中', value: 'in_progress' },
  { label: '待审核', value: 'pending_review' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
];

export function getWorkOrderTypeLabel(value: string) {
  return workOrderTypeOptions.find((item) => item.value === value)?.label || value;
}

export function getWorkOrderPriorityLabel(value: string) {
  return workOrderPriorityOptions.find((item) => item.value === value)?.label || value;
}

export function getWorkOrderStatusLabel(value: string) {
  return workOrderStatusOptions.find((item) => item.value === value)?.label || value;
}
