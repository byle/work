import { FormEvent, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { createProject, fetchProjects } from '../lib/api';
import { Project } from '../types/api';

const initialForm = {
  name: '',
  location: '',
  eventDate: '',
  customerName: ''
};

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadProjects = () => {
    setLoading(true);
    fetchProjects()
      .then((data) => {
        setProjects(data.list);
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
    loadProjects();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createProject({
        ...form,
        status: 'draft'
      });
      setForm(initialForm);
      loadProjects();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection title="项目列表" description="查看活动项目、时间、地点和当前状态。">
      <FormCard title="新建项目" description="录入项目基础信息，创建活动项目。" onSubmit={handleSubmit} submitting={submitting}>
        <FormField label="项目名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <FormField label="项目地点" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <FormField label="活动日期" type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} required />
        <FormField label="客户名称" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
      </FormCard>
      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
        <DataTable
          data={projects}
          emptyText="当前还没有项目数据。"
          columns={[
            { key: 'projectNo', title: '项目编号' },
            { key: 'name', title: '项目名称' },
            { key: 'location', title: '项目地点' },
            { key: 'eventDate', title: '活动时间' },
            { key: 'status', title: '状态' }
          ]}
        />
      ) : null}
    </PageSection>
  );
}
