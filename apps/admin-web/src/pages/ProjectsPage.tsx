import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { completeProject, createProject, deleteProject, fetchProjectDetail, fetchProjectTemplates, fetchProjects, fetchUsers } from '../lib/api';
import { formatChinaDateTime } from '../lib/format';
import { getProjectStatusLabel } from '../lib/dicts';
import { Project, ProjectTemplate, User } from '../types/api';

const initialForm = {
  name: '',
  location: '',
  customerName: '',
  eventAt: '',
  eventAtTbd: false,
  moveInAt: '',
  moveInAtTbd: false,
  moveOutAt: '',
  moveOutAtTbd: false,
  templateId: '',
  managerId: '',
  memberIds: ''
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<'current' | 'history'>('current');
  const [detail, setDetail] = useState<Project | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadProjects = () => {
    setLoading(true);
    Promise.all([fetchProjects(keyword, category), fetchProjectTemplates(), fetchUsers()])
      .then(([projectData, templateData, userData]) => {
        setProjects(projectData.list);
        setTemplates(templateData.list);
        setUsers(userData.list);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, [keyword, category]);

  const templateOptions = useMemo(() => [{ label: '手动创建（不使用模板）', value: '' }, ...templates.map((item) => ({ label: item.name, value: String(item.id) }))], [templates]);
  const managerOptions = useMemo(() => [{ label: '请选择项目负责人', value: '' }, ...users.map((item) => ({ label: `${item.realName} (${item.username})`, value: String(item.id) }))], [users]);
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user.realName])), [users]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setSubmitting(true);
    try {
      await createProject({
        name: form.name,
        location: form.location,
        customerName: form.customerName,
        eventAt: form.eventAtTbd ? undefined : form.eventAt || undefined,
        moveInAt: form.moveInAtTbd ? undefined : form.moveInAt || undefined,
        moveOutAt: form.moveOutAtTbd ? undefined : form.moveOutAt || undefined,
        status: 'draft',
        templateId: form.templateId ? Number(form.templateId) : undefined,
        managerId: form.managerId ? Number(form.managerId) : undefined,
        members: form.memberIds.split(',').map((item) => item.trim()).filter(Boolean).map((item) => ({ userId: Number(item), roleInProject: 'member' }))
      });
      setForm(initialForm);
      setStep(1);
      loadProjects();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = async (projectId: number) => {
    const data = await fetchProjectDetail(projectId);
    setDetail(data);
  };

  const handleComplete = async (projectId: number) => {
    await completeProject(projectId);
    loadProjects();
  };

  const handleDelete = async (projectId: number) => {
    const confirmed = window.confirm('确认删除这个项目吗？删除后将不再出现在项目列表中。');

    if (!confirmed) {
      return;
    }

    await deleteProject(projectId);
    loadProjects();
  };

  return (
    <PageSection title="项目列表" description="查看当前项目、历史项目，并支持完成与删除。">
      <FormCard title={`新建项目 · 第 ${step} 步`} description={step === 1 ? '先填写项目名称、地点、活动时间、布场时间、撤场时间。' : '再补充模板、负责人和项目成员。'} onSubmit={handleSubmit} submitting={submitting}>
        {step === 1 ? (
          <>
            <FormField label="项目名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <FormField label="项目地点" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <FormField label="客户名称" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <FormField label="活动时间" type="datetime-local" value={form.eventAt} onChange={(e) => setForm({ ...form, eventAt: e.target.value })} disabled={form.eventAtTbd} required={!form.eventAtTbd} />
            <label><input type="checkbox" checked={form.eventAtTbd} onChange={(e) => setForm({ ...form, eventAtTbd: e.target.checked, eventAt: e.target.checked ? '' : form.eventAt })} /> 活动时间待定</label>
            <FormField label="布场时间" type="datetime-local" value={form.moveInAt} onChange={(e) => setForm({ ...form, moveInAt: e.target.value })} disabled={form.moveInAtTbd} />
            <label><input type="checkbox" checked={form.moveInAtTbd} onChange={(e) => setForm({ ...form, moveInAtTbd: e.target.checked, moveInAt: e.target.checked ? '' : form.moveInAt })} /> 布场时间待定</label>
            <FormField label="撤场时间" type="datetime-local" value={form.moveOutAt} onChange={(e) => setForm({ ...form, moveOutAt: e.target.value })} disabled={form.moveOutAtTbd} />
            <label><input type="checkbox" checked={form.moveOutAtTbd} onChange={(e) => setForm({ ...form, moveOutAtTbd: e.target.checked, moveOutAt: e.target.checked ? '' : form.moveOutAt })} /> 撤场时间待定</label>
          </>
        ) : (
          <>
            <FormSelect label="项目模板" options={templateOptions} value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })} />
            <FormSelect label="项目负责人" options={managerOptions} value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} />
            <FormField label="项目成员 ID 列表" value={form.memberIds} onChange={(e) => setForm({ ...form, memberIds: e.target.value })} placeholder="例如：4,5" />
            <button type="button" onClick={() => setStep(1)} style={{ border: 'none', background: '#e5e7eb', padding: '10px 16px', borderRadius: 10 }}>返回上一步</button>
          </>
        )}
      </FormCard>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 20, display: 'grid', gap: 12, gridTemplateColumns: '1fr 220px' }}>
        <FormField label="搜索项目" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="项目名称 / 编号 / 地点" />
        <FormSelect label="项目分组" options={[{ label: '当前项目', value: 'current' }, { label: '历史项目', value: 'history' }]} value={category} onChange={(e) => setCategory(e.target.value as 'current' | 'history')} />
      </div>
      {detail ? <pre style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', marginBottom: 20 }}>{JSON.stringify({ ...detail, managerName: detail.managerId ? userMap[detail.managerId] : null }, null, 2)}</pre> : null}
      <LoadState loading={loading} error={error} />
      {!loading && !error ? <DataTable data={projects} emptyText={category === 'current' ? '当前还没有项目数据。' : '当前还没有历史项目。'} columns={[{ key: 'projectNo', title: '项目编号' }, { key: 'name', title: '项目名称' }, { key: 'location', title: '项目地点' }, { key: 'eventAt', title: '活动时间', render: (item) => formatChinaDateTime(item.eventAt || item.eventDate) }, { key: 'managerId', title: '负责人', render: (item) => (item.managerId ? userMap[item.managerId] || item.managerId : '未设置') }, { key: 'sourceType', title: '来源' }, { key: 'status', title: '状态', render: (item) => item.statusLabel || getProjectStatusLabel(item.status) }, { key: 'detail', title: '操作', render: (item) => <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button onClick={() => handleViewDetail(item.id)} style={{ border: 'none', background: '#dbeafe', color: '#1d4ed8', padding: '6px 10px', borderRadius: 8 }}>查看</button><button onClick={() => window.open(`/api/print/projects/${item.id}`, '_blank')} style={{ border: 'none', background: '#dcfce7', color: '#166534', padding: '6px 10px', borderRadius: 8 }}>打印</button>{category === 'current' ? <button onClick={() => handleComplete(item.id)} style={{ border: 'none', background: '#fef3c7', color: '#92400e', padding: '6px 10px', borderRadius: 8 }}>已完成</button> : null}<button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '6px 10px', borderRadius: 8 }}>删除</button></div> }]} /> : null}
    </PageSection>
  );
}
