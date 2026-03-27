import { useEffect, useState } from 'react';
import { InfoCard } from '../components/InfoCard';
import { StatusBanner } from '../components/StatusBanner';
import { fetchMyWorkOrders } from '../lib/api';
import { WorkOrder } from '../types/api';

type WorkOrdersPageProps = {
  onOpenDetail: (workOrderId: number) => void;
};

export function WorkOrdersPage({ onOpenDetail }: WorkOrdersPageProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyWorkOrders()
      .then((data) => {
        setWorkOrders(data.list);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <StatusBanner loading={loading} error={error} />
      {workOrders.length === 0 && !loading && !error ? <InfoCard title="暂无工单" description="当前没有分配给你的工单。" /> : null}
      {workOrders.map((workOrder) => (
        <InfoCard key={workOrder.id} title={workOrder.title} description={`工单编号：${workOrder.workOrderNo}`}>
          <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <div>项目 ID：{workOrder.projectId}</div>
            <div>类型：{workOrder.type}</div>
            <div>优先级：{workOrder.priority}</div>
            <div>状态：{workOrder.status}</div>
          </div>
          <button onClick={() => onOpenDetail(workOrder.id)} style={{ marginTop: 12, border: 'none', background: '#2563eb', color: '#fff', padding: '10px 12px', borderRadius: 10, width: '100%' }}>
            查看详情
          </button>
        </InfoCard>
      ))}
    </>
  );
}
