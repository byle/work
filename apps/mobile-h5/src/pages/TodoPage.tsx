import { useEffect, useState } from 'react';
import { InfoCard } from '../components/InfoCard';
import { StatusBanner } from '../components/StatusBanner';
import { fetchTodoSummary } from '../lib/api';
import { TodoSummary } from '../types/api';

export function TodoPage() {
  const [summary, setSummary] = useState<TodoSummary>({
    totalPending: 0,
    totalInProgress: 0,
    totalProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodoSummary()
      .then((data) => {
        setSummary(data);
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
      <InfoCard title="待处理工单" description="需要尽快认领或开始执行的工单数量。">
        <strong style={{ fontSize: 28 }}>{summary.totalPending}</strong>
      </InfoCard>
      <InfoCard title="执行中工单" description="现场正在处理中的任务数量。">
        <strong style={{ fontSize: 28 }}>{summary.totalInProgress}</strong>
      </InfoCard>
      <InfoCard title="关联项目数" description="当前我的工单涉及到的项目数量。">
        <strong style={{ fontSize: 28 }}>{summary.totalProjects}</strong>
      </InfoCard>
    </>
  );
}
