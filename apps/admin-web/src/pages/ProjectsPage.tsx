import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { createProject, fetchProjectDetail, fetchProjectTemplates, fetchProjects, fetchUsers } from '../lib/api';
import { getProjectStatusLabel } from '../lib/dicts';
import { Project, ProjectTemplate, User } from '../types/api';

const initialForm = {
  name: '',
  location: '',
  eventDate: '',
  customerName: '',
  templateId: '',
  managerId: '',
  memberIds: ''
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [detail, setDetail] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadProjects = () => {
    setLoading(true);
    Promise.all([fetchProjects(keyword), fetchProjectTemplates(), fetchUsers()])
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
  }, [keyword]);

  const templateOptions = useMemo(() => [{ label: '手动创建（不使用模板）', value: '' }, ...templates.map((item) => ({ label: item.name, value: String(item.id) }))], [templates]);
  const managerOptions = useMemo(() => [{ label: '请选择项目负责人', value: '' }, ...users.map((item) => ({ label: `${item.realName} (${item.username})`, value: String(item.id) }))], [users]);
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user.realName])), [users]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await createProject({ ...form, status: 'draft', templateId: form.templateId ? Number(form.templateId) : undefined, managerId: form.managerId ? Number(form.managerId) : undefined, members: form.memberIds.split(',').map((item) => item.trim()).filter(Boolean).map((item) => ({ userId: Number(item), roleInProject: 'member' })) });
      setForm(initialForm);
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

  return (
    <PageSection title="项目列表" description="查看活动项目、时间、地点和当前状态，可基于模板一键创建工单。">
      <FormCard title="新建项目" description="录入项目基础信息；可设置负责人、项目成员，并基于模板自动生成工单。" onSubmit={handleSubmit} submitting={submitting}>
        <FormField label="项目名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <FormField label="项目地点" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <FormField label="活动日期" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
        <FormField label="客户名称" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <FormSelect label="项目模板" options={templateOptions} value={form.templateId} onChange={(e) => setForm({ ...form, templateId: e.target.value })} />
        <FormSelect label="项目负责人" options={managerOptions} value={form.managerId} onChange={(e) => setForm({ ...form, managerId: e.target.value })} />
        <FormField label="项目成员 ID 列表" value={form.memberIds} onChange={(e) => setForm({ ...form, memberIds: e.target.value })} placeholder="例如：4,5" />
      </FormCard>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <FormField label="搜索项目" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="项目名称 / 编号 / 地点" />
      </div>
      {detail ? <pre style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap', marginBottom: 20 }}>{JSON.stringify({ ...detail, managerName: detail.managerId ? userMap[detail.managerId] : null }, null, 2)}</pre> : null}
      <LoadState loading={loading} error={error} />
      {!loading && !error ? <DataTable data={projects} emptyText="当前还没有项目数据。" columns={[{ key: 'projectNo', title: '项目编号' }, { key: 'name', title: '项目名称' }, { key: 'location', title: '项目地点' }, { key: 'eventDate', title: '活动时间' }, { key: 'managerId', title: '负责人', render: (item) => (item.managerId ? userMap[item.managerId] || item.managerId : '未设置') }, { key: 'sourceType', title: '来源' }, { key: 'status', title: '状态', render: (item) => getProjectStatusLabel(item.status) }, { key: 'detail', title: '详情', render: (item) => <button onClick={() => handleViewDetail(item.id)} style={{ border: 'none', background: '#dbeafe', color: '#1d4ed8', padding: '6px 10px', borderRadius: 8 }}>查看</button> }]} /> : null}
    </PageSection>
  );
}
