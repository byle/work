import { FormEvent, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { fetchDictionaryItems, saveDictionaryItem } from '../lib/api';
import { DictionaryItem } from '../types/api';

const dictTypeOptions = [
  { label: '项目状态', value: 'project_status' },
  { label: '工单类型', value: 'work_order_type' },
  { label: '工单优先级', value: 'work_order_priority' },
  { label: '工单状态', value: 'work_order_status' },
  { label: '清单状态', value: 'setup_list_status' },
  { label: '清单执行状态', value: 'setup_item_status' }
];

const initialForm = {
  dictType: 'work_order_status',
  itemValue: '',
  itemLabel: '',
  sortOrder: '0'
};

export function DictionariesPage() {
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [dictType, setDictType] = useState('work_order_status');
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchDictionaryItems(dictType)
      .then((data) => {
        setItems(data.list);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [dictType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await saveDictionaryItem({
        dictType: form.dictType,
        itemValue: form.itemValue,
        itemLabel: form.itemLabel,
        sortOrder: Number(form.sortOrder || 0),
        status: 'active'
      });
      setForm({ ...initialForm, dictType: form.dictType });
      loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection title="数据字典" description="统一维护项目、工单、清单相关中文标签。">
      <FormCard title="新增 / 更新字典项" description="相同类型 + 值会自动更新标签。" onSubmit={handleSubmit} submitting={submitting}>
        <FormSelect label="字典类型" options={dictTypeOptions} value={form.dictType} onChange={(e) => setForm({ ...form, dictType: e.target.value })} required />
        <FormField label="值" value={form.itemValue} onChange={(e) => setForm({ ...form, itemValue: e.target.value })} required />
        <FormField label="中文标签" value={form.itemLabel} onChange={(e) => setForm({ ...form, itemLabel: e.target.value })} required />
        <FormField label="排序" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} required />
      </FormCard>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <FormSelect label="查看字典类型" options={dictTypeOptions} value={dictType} onChange={(e) => setDictType(e.target.value)} />
      </div>
      <LoadState loading={loading} error={error} />
      {!loading && !error ? <DataTable data={items} emptyText="暂无字典项。" columns={[{ key: 'dictType', title: '字典类型' }, { key: 'itemValue', title: '值' }, { key: 'itemLabel', title: '中文标签' }, { key: 'sortOrder', title: '排序' }, { key: 'status', title: '状态' }]} /> : null}
    </PageSection>
  );
}
