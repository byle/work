import { FormEvent, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { createProjectTemplate, fetchProjectTemplates } from '../lib/api';
import { ProjectTemplate } from '../types/api';

const initialForm = {
  name: '',
  category: '舞台租赁',
  description: '',
  workOrderName: '',
  workOrderType: 'setup',
  titleTemplate: '{{projectName}}-现场搭建'
};

export function TemplatesPage() {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = () => {
    setLoading(true);
    fetchProjectTemplates()
      .then((data) => {
        setTemplates(data.list);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createProjectTemplate({
        name: form.name,
        category: form.category,
        description: form.description,
        workOrderTemplates: [
          {
            name: form.workOrderName,
            type: form.workOrderType,
            titleTemplate: form.titleTemplate,
            defaultPriority: 'medium',
            sortOrder: 1
          }
        ]
      });
      setForm(initialForm);
      loadTemplates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection title="项目模板" description="沉淀标准项目和默认工单，创建项目时可一键生成。">
      <FormCard title="新建项目模板" description="先配置项目模板，再附带至少一个默认工单模板。" onSubmit={handleSubmit} submitting={submitting}>
        <FormField label="模板名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <FormField label="模板分类" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <FormField label="模板说明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <FormField label="默认工单名称" value={form.workOrderName} onChange={(e) => setForm({ ...form, workOrderName: e.target.value })} required />
        <FormField label="默认工单类型" value={form.workOrderType} onChange={(e) => setForm({ ...form, workOrderType: e.target.value })} required />
        <FormField label="标题模板" value={form.titleTemplate} onChange={(e) => setForm({ ...form, titleTemplate: e.target.value })} required />
      </FormCard>
      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
        <DataTable
          data={templates}
          emptyText="当前还没有项目模板。"
          columns={[
            { key: 'name', title: '模板名称' },
            { key: 'category', title: '分类' },
            { key: 'description', title: '说明' },
            { key: 'version', title: '版本' },
            { key: 'status', title: '状态' },
            { key: 'workOrderTemplates', title: '默认工单', render: (item) => item.workOrderTemplates.map((entry) => entry.name).join('、') }
          ]}
        />
      ) : null}
    </PageSection>
  );
}
