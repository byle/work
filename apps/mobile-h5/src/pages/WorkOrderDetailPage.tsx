import { useEffect, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { InfoCard } from '../components/InfoCard';
import { StatusBanner } from '../components/StatusBanner';
import { fetchWorkOrderDetail, updateWorkOrderStatus } from '../lib/api';
import { WorkOrder } from '../types/api';

type WorkOrderDetailPageProps = {
  workOrderId: number;
  onBack: () => void;
};

export function WorkOrderDetailPage({ workOrderId, onBack }: WorkOrderDetailPageProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    load();
  }, [workOrderId]);

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    try {
      const result = await updateWorkOrderStatus(workOrderId, status);
      setWorkOrder(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            <button onClick={() => handleStatusChange('in_progress')} disabled={saving} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 10 }}>开始执行</button>
            <button onClick={() => handleStatusChange('done')} disabled={saving} style={{ border: 'none', background: '#059669', color: '#fff', padding: 12, borderRadius: 10 }}>标记完成</button>
          </div>
        </InfoCard>
      ) : null}
    </>
  );
}
