import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import {
  createSetupList,
  createSetupListItem,
  deleteSetupListItem,
  exportSetupListItems,
  fetchProjects,
  fetchSetupListItems,
  fetchSetupLists,
  importSetupListItems,
  updateSetupListItem
} from '../lib/api';
import { Project, SetupList, SetupListItem } from '../types/api';
import { getSetupItemStatusLabel, getSetupListStatusLabel } from '../lib/dicts';

const initialForm = {
  projectId: '',
  title: '',
  projectNameSnapshot: '',
  locationSnapshot: '',
  eventDateSnapshot: ''
};

const initialItemForm = {
  id: '',
  setupListId: '',
  sequenceNo: '',
  categoryName: '',
  itemName: '',
  specification: '',
  quantity: '1',
  unit: '项',
  remark: '',
  sortOrder: '1'
};

const initialImportText = 'sequenceNo,categoryName,itemName,specification,quantity,unit,remark,sortOrder\n1,舞台,主舞台,12x8,1,套,标准主舞台,1';

function parseCsvRows(input: string) {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = lines[0].split(',').map((item) => item.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(',').map((item) => item.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));

    return {
      sequenceNo: row.sequenceNo,
      categoryName: row.categoryName,
      itemName: row.itemName,
      specification: row.specification,
      quantity: Number(row.quantity || 0),
      unit: row.unit,
      remark: row.remark,
      sortOrder: Number(row.sortOrder || 0)
    };
  });
}

export function SetupListsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [setupLists, setSetupLists] = useState<SetupList[]>([]);
  const [setupListItems, setSetupListItems] = useState<SetupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [itemForm, setItemForm] = useState(initialItemForm);
  const [importText, setImportText] = useState(initialImportText);

  const loadItems = async (setupListId: string) => {
    if (!setupListId) {
      setSetupListItems([]);
      return;
    }

    const data = await fetchSetupListItems(Number(setupListId));
    setSetupListItems(data);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchProjects(), fetchSetupLists()])
      .then(async ([projectData, setupListData]) => {
        setProjects(projectData.list);
        setSetupLists(setupListData.list);

        const firstProject = projectData.list[0];
        const firstSetupList = setupListData.list[0];

        setForm((current) => ({
          ...current,
          projectId: current.projectId || String(firstProject?.id || ''),
          projectNameSnapshot: current.projectNameSnapshot || firstProject?.name || '',
          locationSnapshot: current.locationSnapshot || firstProject?.location || '',
          eventDateSnapshot: current.eventDateSnapshot || firstProject?.eventDate || ''
        }));

        setItemForm((current) => ({
          ...current,
          setupListId: current.setupListId || String(firstSetupList?.id || '')
        }));

        if (firstSetupList?.id) {
          await loadItems(String(firstSetupList.id));
        }

        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const projectOptions = useMemo(
    () => [{ label: '请选择项目', value: '' }, ...projects.map((project) => ({ label: `${project.name} (${project.projectNo})`, value: String(project.id) }))],
    [projects]
  );

  const setupListOptions = useMemo(
    () => [{ label: '请选择清单', value: '' }, ...setupLists.map((item) => ({ label: `${item.title} (#${item.id})`, value: String(item.id) }))],
    [setupLists]
  );

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((item) => String(item.id) === projectId);
    setForm({
      ...form,
      projectId,
      projectNameSnapshot: project?.name || '',
      locationSnapshot: project?.location || '',
      eventDateSnapshot: project?.eventDate || ''
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createSetupList({
        ...form,
        projectId: Number(form.projectId),
        status: 'draft'
      });
      setForm(initialForm);
      loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setItemSubmitting(true);

    const payload = {
      sequenceNo: itemForm.sequenceNo || undefined,
      categoryName: itemForm.categoryName || undefined,
      itemName: itemForm.itemName,
      specification: itemForm.specification || undefined,
      quantity: Number(itemForm.quantity),
      unit: itemForm.unit,
      remark: itemForm.remark || undefined,
      sortOrder: Number(itemForm.sortOrder || 0)
    };

    try {
      if (itemForm.id) {
        await updateSetupListItem(Number(itemForm.id), payload);
      } else {
        await createSetupListItem(Number(itemForm.setupListId), payload);
      }

      setItemForm({ ...initialItemForm, setupListId: itemForm.setupListId || '' });
      await loadItems(itemForm.setupListId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setItemSubmitting(false);
    }
  };

  const handleEditItem = (item: SetupListItem) => {
    setItemForm({
      id: String(item.id),
      setupListId: String(item.setupListId),
      sequenceNo: item.sequenceNo || '',
      categoryName: item.categoryName || '',
      itemName: item.itemName,
      specification: item.specification || '',
      quantity: String(item.quantity),
      unit: item.unit,
      remark: item.remark || '',
      sortOrder: String(item.sortOrder)
    });
  };

  const handleDeleteItem = async (item: SetupListItem) => {
    await deleteSetupListItem(item.id);
    await loadItems(String(item.setupListId));
  };

  const handleImport = async () => {
    if (!itemForm.setupListId) {
      setImportResult('请先选择清单');
      return;
    }

    const rows = parseCsvRows(importText);
    const result = await importSetupListItems(Number(itemForm.setupListId), rows);
    setImportResult(`导入完成：成功 ${result.successCount} / 失败 ${result.failCount}`);
    await loadItems(itemForm.setupListId);
  };

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    setImportText(text);
    const rows = parseCsvRows(text);

    if (!itemForm.setupListId) {
      setImportResult('请先选择清单');
      return;
    }

    const result = await importSetupListItems(Number(itemForm.setupListId), rows);
    setImportResult(`文件导入完成：成功 ${result.successCount} / 失败 ${result.failCount}`);
    await loadItems(itemForm.setupListId);
  };

  const handleExport = async () => {
    if (!itemForm.setupListId) {
      setImportResult('请先选择清单');
      return;
    }

    const csv = await exportSetupListItems(Number(itemForm.setupListId));
    setImportResult(csv);
  };

  return (
    <PageSection title="清单列表" description="维护搭建清单与明细，支持文本或文件批量导入导出。">
      <FormCard title="新建搭建清单" description="从项目生成清单快照，供现场执行。" onSubmit={handleSubmit} submitting={submitting}>
        <FormSelect label="所属项目" options={projectOptions} value={form.projectId} onChange={(e) => handleProjectChange(e.target.value)} required />
        <FormField label="清单标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <FormField label="项目名称快照" value={form.projectNameSnapshot} onChange={(e) => setForm({ ...form, projectNameSnapshot: e.target.value })} required />
        <FormField label="地点快照" value={form.locationSnapshot} onChange={(e) => setForm({ ...form, locationSnapshot: e.target.value })} required />
        <FormField label="活动日期快照" type="date" value={form.eventDateSnapshot} onChange={(e) => setForm({ ...form, eventDateSnapshot: e.target.value })} required />
      </FormCard>

      <FormCard title={itemForm.id ? '编辑清单明细' : '新增清单明细'} description="为指定清单录入搭建项、规格、数量和备注。" onSubmit={handleItemSubmit} submitting={itemSubmitting}>
        <FormSelect label="所属清单" options={setupListOptions} value={itemForm.setupListId} onChange={async (e) => { const setupListId = e.target.value; setItemForm({ ...itemForm, id: '', setupListId }); await loadItems(setupListId); }} required />
        <FormField label="序号" value={itemForm.sequenceNo} onChange={(e) => setItemForm({ ...itemForm, sequenceNo: e.target.value })} />
        <FormField label="分类" value={itemForm.categoryName} onChange={(e) => setItemForm({ ...itemForm, categoryName: e.target.value })} />
        <FormField label="内容" value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })} required />
        <FormField label="规格" value={itemForm.specification} onChange={(e) => setItemForm({ ...itemForm, specification: e.target.value })} />
        <FormField label="数量" type="number" min="0.01" step="0.01" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} required />
        <FormField label="单位" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} required />
        <FormField label="备注" value={itemForm.remark} onChange={(e) => setItemForm({ ...itemForm, remark: e.target.value })} />
        <FormField label="排序" type="number" value={itemForm.sortOrder} onChange={(e) => setItemForm({ ...itemForm, sortOrder: e.target.value })} />
      </FormCard>

      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>清单导入导出</h3>
        <p style={{ color: '#6b7280' }}>支持粘贴 CSV 文本，或直接选择 `.csv` 文件导入。</p>
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} style={{ width: '100%', minHeight: 140, borderRadius: 10, border: '1px solid #d1d5db', padding: 12 }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
          <button onClick={handleImport} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: '10px 16px', borderRadius: 10, cursor: 'pointer' }}>导入明细</button>
          <label style={{ background: '#f3f4f6', padding: '10px 16px', borderRadius: 10, cursor: 'pointer' }}>
            选择 CSV 文件
            <input type="file" accept=".csv,text/csv" onChange={handleFileImport} style={{ display: 'none' }} />
          </label>
          <button onClick={handleExport} style={{ border: 'none', background: '#0f766e', color: '#fff', padding: '10px 16px', borderRadius: 10, cursor: 'pointer' }}>导出 CSV</button>
        </div>
        {importResult ? <pre style={{ whiteSpace: 'pre-wrap', background: '#f8fafc', padding: 12, borderRadius: 10, marginTop: 12 }}>{importResult}</pre> : null}
      </div>

      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
        <>
          <DataTable data={setupLists} emptyText="当前还没有搭建清单数据。" columns={[{ key: 'title', title: '清单标题' }, { key: 'projectId', title: '项目 ID' }, { key: 'projectNameSnapshot', title: '项目快照' }, { key: 'locationSnapshot', title: '地点快照' }, { key: 'eventDateSnapshot', title: '活动时间' }, { key: 'status', title: '状态', render: (item) => item.statusLabel || getSetupListStatusLabel(item.status) }]} />
          <div style={{ height: 20 }} />
          <DataTable data={setupListItems} emptyText="当前所选清单还没有明细数据。" columns={[{ key: 'sequenceNo', title: '序号' }, { key: 'categoryName', title: '分类' }, { key: 'itemName', title: '内容' }, { key: 'specification', title: '规格' }, { key: 'quantity', title: '数量' }, { key: 'unit', title: '单位' }, { key: 'remark', title: '备注' }, { key: 'executeStatus', title: '执行状态', render: (item) => item.executeStatusLabel || getSetupItemStatusLabel(item.executeStatus) }, { key: 'action', title: '操作', render: (item) => (<div style={{ display: 'flex', gap: 8 }}><button onClick={() => handleEditItem(item)} style={{ border: 'none', background: '#dbeafe', color: '#1d4ed8', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>编辑</button><button onClick={() => handleDeleteItem(item)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>删除</button></div>) }]} />
        </>
      ) : null}
    </PageSection>
  );
}
