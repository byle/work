import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { assignWorkOrder, createWorkOrder, fetchProjects, fetchUsers, fetchWorkOrders } from '../lib/api';
import { Project, User, WorkOrder } from '../types/api';

const initialForm = {
  projectId: '',
  title: '',
  type: 'setup',
  priority: 'medium',
  reviewerId: ''
};

export function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [reviewerDraft, setReviewerDraft] = useState<Record<number, string>>({});

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchWorkOrders(), fetchProjects(), fetchUsers()])
      .then(([workOrderData, projectData, userData]) => {
        setWorkOrders(workOrderData.list);
        setProjects(projectData.list);
        setUsers(userData.list);
        setForm((current) => ({
          ...current,
          projectId: current.projectId || String(projectData.list[0]?.id || '')
        }));
        setReviewerDraft(Object.fromEntries(workOrderData.list.map((item) => [item.id, item.reviewerId ? String(item.reviewerId) : ''])));
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
      ...projects.map((project) => ({ label: `${project.name} (${project.projectNo})`, value: String(project.id) }))
    ],
    [projects]
  );

  const assigneeOptions = useMemo(
    () => [
      { label: '未分配', value: '' },
      ...users.filter((user) => user.roles.includes('site') || user.roles.includes('dispatcher')).map((user) => ({ label: `${user.realName} (${user.username})`, value: String(user.id) }))
    ],
    [users]
  );

  const reviewerOptions = assigneeOptions;
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user.realName])), [users]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createWorkOrder({
        projectId: Number(form.projectId),
        title: form.title,
        type: form.type,
        priority: form.priority,
        reviewerId: form.reviewerId ? Number(form.reviewerId) : undefined
      });
      setForm({ ...initialForm, projectId: form.projectId });
      loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (workOrderId: number, assigneeId: string) => {
    setAssigningId(workOrderId);

    try {
      await assignWorkOrder(workOrderId, assigneeId ? Number(assigneeId) : null, reviewerDraft[workOrderId] ? Number(reviewerDraft[workOrderId]) : null);
      loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <PageSection title="工单列表" description="查看工单类型、优先级、状态和关联项目，并进行执行人/审核人配置。">
      <FormCard title="新建工单" description="可同时设置审核人，后续再指派执行人。" onSubmit={handleSubmit} submitting={submitting}>
        <FormSelect label="所属项目" options={projectOptions} value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required />
        <FormField label="工单标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <FormField label="工单类型" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
        <FormField label="优先级" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} required />
        <FormSelect label="审核人" options={reviewerOptions} value={form.reviewerId} onChange={(e) => setForm({ ...form, reviewerId: e.target.value })} />
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
            { key: 'status', title: '状态' },
            { key: 'assigneeId', title: '执行人', render: (item) => (item.assigneeId ? userMap[item.assigneeId] || item.assigneeId : '未分配') },
            { key: 'reviewerText', title: '审核人', render: (item) => (item.reviewerId ? userMap[item.reviewerId] || item.reviewerId : '未设置') },
            {
              key: 'reviewerId',
              title: '审核人',
              render: (item) => (
                <select
                  value={reviewerDraft[item.id] ?? ''}
                  onChange={(e) => setReviewerDraft((current) => ({ ...current, [item.id]: e.target.value }))}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                >
                  {reviewerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )
            },
            {
              key: 'assign',
              title: '指派',
              render: (item) => (
                <select
                  value={item.assigneeId ? String(item.assigneeId) : ''}
                  onChange={(e) => handleAssign(item.id, e.target.value)}
                  disabled={assigningId === item.id}
                  style={{ padding: 8, borderRadius: 8, border: '1px solid #d1d5db' }}
                >
                  {assigneeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )
            }
          ]}
        />
      ) : null}
    </PageSection>
  );
}
