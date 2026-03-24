import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { fetchWorkOrders } from '../lib/api';
import { WorkOrder } from '../types/api';

export function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkOrders()
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
    <PageSection title="工单列表" description="查看工单类型、优先级、状态和关联项目。">
      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
        <DataTable
          data={workOrders}
          emptyText="当前还没有工单数据。"
          columns={[
            { key: 'workOrderNo', title: '工单编号' },
            { key: 'title', title: '工单标题' },
            { key: 'projectId', title: '项目 ID' },
            { key: 'type', title: '类型' },
            { key: 'priority', title: '优先级' },
            { key: 'status', title: '状态' }
          ]}
        />
      ) : null}
    </PageSection>
  );
}
