import { useEffect, useState } from 'react';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { fetchDashboardSummary } from '../lib/api';
import { DashboardSummary } from '../types/api';

function StatCard({ title, description, value }: { title: string; description: string; value: string | number }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ color: '#6b7280', marginBottom: 12 }}>{description}</div>
      <strong style={{ fontSize: 28 }}>{value}</strong>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => {
        setSummary(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageSection title="统计看板" description="快速查看项目、工单、清单的整体运行情况。">
      <LoadState loading={loading} error={error} />
      {summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <StatCard title="项目总数" description="系统中全部项目数量。" value={summary.projectsTotal} />
          <StatCard title="草稿项目" description="尚未进入正式执行阶段。" value={summary.projectsDraft} />
          <StatCard title="清单总数" description="当前系统搭建清单总量。" value={summary.setupListsTotal} />
          <StatCard title="工单总数" description="全部工单数量。" value={summary.workOrdersTotal} />
          <StatCard title="待处理工单" description="待分配或待审核。" value={summary.workOrdersPending} />
          <StatCard title="执行中 / 已通过" description="执行状态概览。" value={`${summary.workOrdersInProgress} / ${summary.workOrdersApproved}`} />
        </div>
      ) : null}
    </PageSection>
  );
}
