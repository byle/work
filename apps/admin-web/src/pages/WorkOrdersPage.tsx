import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { createWorkOrder, fetchProjects, fetchWorkOrders } from '../lib/api';
import { Project, WorkOrder } from '../types/api';

const initialForm = {
  projectId: '',
  title: '',
  type: 'setup',
  priority: 'medium'
};

export function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchWorkOrders(), fetchProjects()])
      .then(([workOrderData, projectData]) => {
        setWorkOrders(workOrderData.list);
        setProjects(projectData.list);
        setForm((current) => ({
          ...current,
          projectId: current.projectId || String(projectData.list[0]?.id || '')
        }));
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
    loadData();
  }, []);

  const projectOptions = useMemo(
    () => [
      { label: '请选择项目', value: '' },
      ...projects.map((project) => ({
        label: `${project.name} (${project.projectNo})`,
        value: String(project.id)
      }))
    ],
    [projects]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createWorkOrder({
        projectId: Number(form.projectId),
        title: form.title,
        type: form.type,
        priority: form.priority
      });
      setForm({ ...initialForm, projectId: form.projectId });
      loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection title="工单列表" description="查看工单类型、优先级、状态和关联项目。">
      <FormCard title="新建工单" description="先录入工单主信息，后续可继续补充指派和时间。" onSubmit={handleSubmit} submitting={submitting}>
        <FormSelect label="所属项目" options={projectOptions} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
        <FormField label="工单标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <FormField label="工单类型" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        <FormField label="优先级" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} required />
      </FormCard>
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
