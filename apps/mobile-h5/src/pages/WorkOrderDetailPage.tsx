import { useEffect, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { InfoCard } from '../components/InfoCard';
import { StatusBanner } from '../components/StatusBanner';
import { fetchWorkOrderDetail } from '../lib/api';
import { WorkOrder } from '../types/api';

type WorkOrderDetailPageProps = {
  workOrderId: number;
  onBack: () => void;
};

export function WorkOrderDetailPage({ workOrderId, onBack }: WorkOrderDetailPageProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrderDetail(workOrderId)
      .then((data) => {
        setWorkOrder(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [workOrderId]);

  return (
    <>
      <BackButton onClick={onBack} />
      <StatusBanner loading={loading} error={error} />
      {workOrder ? (
        <InfoCard title={workOrder.title} description={`工单编号：${workOrder.workOrderNo}`}>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div>项目 ID：{workOrder.projectId}</div>
            <div>工单类型：{workOrder.type}</div>
            <div>优先级：{workOrder.priority}</div>
            <div>状态：{workOrder.status}</div>
            <div>执行人：{workOrder.assigneeId ?? '未分配'}</div>
            <div>计划开始：{workOrder.plannedStartAt || '未设置'}</div>
            <div>计划结束：{workOrder.plannedEndAt || '未设置'}</div>
            <div>实际开始：{workOrder.actualStartAt || '未开始'}</div>
            <div>实际结束：{workOrder.actualEndAt || '未完成'}</div>
            <div>说明：{workOrder.description || '暂无说明'}</div>
          </div>
        </InfoCard>
      ) : null}
    </>
  );
}
