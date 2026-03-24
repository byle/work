import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { FormSelect } from '../components/FormSelect';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import {
  createSetupList,
  createSetupListItem,
  fetchProjects,
  fetchSetupListItems,
  fetchSetupLists
} from '../lib/api';
import { Project, SetupList, SetupListItem } from '../types/api';

const initialSetupListForm = {
  projectId: '',
  title: '',
  projectNameSnapshot: '',
  locationSnapshot: '',
  eventDateSnapshot: ''
};

const initialItemForm = {
  setupListId: '',
  sequenceNo: '',
  categoryName: '',
  itemName: '',
  specification: '',
  quantity: '1',
  unit: '套',
  remark: '',
  sortOrder: '0'
};

export function SetupListsPage() {
  const [setupLists, setSetupLists] = useState<SetupList[]>([]);
  const [setupListItems, setSetupListItems] = useState<SetupListItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialSetupListForm);
  const [itemForm, setItemForm] = useState(initialItemForm);

  const loadItems = async (setupListId: string) => {
    if (!setupListId) {
      setSetupListItems([]);
      return;
    }

    const items = await fetchSetupListItems(Number(setupListId));
    setSetupListItems(items);
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchSetupLists(), fetchProjects()])
      .then(async ([setupListData, projectData]) => {
        setSetupLists(setupListData.list);
        setProjects(projectData.list);

        const firstProject = projectData.list[0];
        const firstSetupList = setupListData.list[0];

        setForm((current) => ({
          ...current,
          projectId: current.projectId || String(firstProject?.id || ''),
          projectNameSnapshot: current.projectNameSnapshot || firstProject?.name || '',
          locationSnapshot: current.locationSnapshot || firstProject?.location || '',
          eventDateSnapshot: current.eventDateSnapshot || firstProject?.eventDate || ''
        }));

        const nextSetupListId = firstSetupList ? String(firstSetupList.id) : '';
        setItemForm((current) => ({
          ...current,
          setupListId: current.setupListId || nextSetupListId
        }));

        if (nextSetupListId) {
          await loadItems(nextSetupListId);
        } else {
          setSetupListItems([]);
        }

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

  const setupListOptions = useMemo(
    () => [
      { label: '请选择清单', value: '' },
      ...setupLists.map((setupList) => ({
        label: `${setupList.title} (#${setupList.id})`,
        value: String(setupList.id)
      }))
    ],
    [setupLists]
  );

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find((project) => String(project.id) === projectId);

    setForm((current) => ({
      ...current,
      projectId,
      projectNameSnapshot: selectedProject?.name || '',
      locationSnapshot: selectedProject?.location || '',
      eventDateSnapshot: selectedProject?.eventDate || ''
    }));
  };

  const handleSetupListSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createSetupList({
        projectId: Number(form.projectId),
        title: form.title,
        projectNameSnapshot: form.projectNameSnapshot,
        locationSnapshot: form.locationSnapshot,
        eventDateSnapshot: form.eventDateSnapshot,
        status: 'draft'
      });
      setForm((current) => ({ ...initialSetupListForm, projectId: current.projectId }));
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

    try {
      await createSetupListItem(Number(itemForm.setupListId), {
        sequenceNo: itemForm.sequenceNo,
        categoryName: itemForm.categoryName,
        itemName: itemForm.itemName,
        specification: itemForm.specification,
        quantity: Number(itemForm.quantity),
        unit: itemForm.unit,
        remark: itemForm.remark,
        sortOrder: Number(itemForm.sortOrder)
      });
      setItemForm((current) => ({
        ...initialItemForm,
        setupListId: current.setupListId
      }));
      await loadItems(itemForm.setupListId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setItemSubmitting(false);
    }
  };

  return (
    <PageSection title="清单列表" description="查看搭建清单表头、项目快照和执行状态。">
      <FormCard title="新建清单" description="录入清单表头信息，后续再补充清单明细。" onSubmit={handleSetupListSubmit} submitting={submitting}>
        <FormSelect label="所属项目" options={projectOptions} value={form.projectId} onChange={(e) => handleProjectChange(e.target.value)} required />
        <FormField label="清单标题" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <FormField label="项目名称快照" value={form.projectNameSnapshot} onChange={(e) => setForm({ ...form, projectNameSnapshot: e.target.value })} required />
        <FormField label="地点快照" value={form.locationSnapshot} onChange={(e) => setForm({ ...form, locationSnapshot: e.target.value })} required />
        <FormField label="活动日期快照" type="date" value={form.eventDateSnapshot} onChange={(e) => setForm({ ...form, eventDateSnapshot: e.target.value })} required />
      </FormCard>

      <FormCard title="新增清单明细" description="为指定清单录入搭建项、规格、数量和备注。" onSubmit={handleItemSubmit} submitting={itemSubmitting}>
        <FormSelect
          label="所属清单"
          options={setupListOptions}
          value={itemForm.setupListId}
          onChange={async (e) => {
            const setupListId = e.target.value;
            setItemForm({ ...itemForm, setupListId });
            await loadItems(setupListId);
          }}
          required
        />
        <FormField label="序号" value={itemForm.sequenceNo} onChange={(e) => setItemForm({ ...itemForm, sequenceNo: e.target.value })} />
        <FormField label="分类" value={itemForm.categoryName} onChange={(e) => setItemForm({ ...itemForm, categoryName: e.target.value })} />
        <FormField label="内容" value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })} required />
        <FormField label="规格" value={itemForm.specification} onChange={(e) => setItemForm({ ...itemForm, specification: e.target.value })} />
        <FormField label="数量" type="number" min="0.01" step="0.01" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} required />
        <FormField label="单位" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} required />
        <FormField label="备注" value={itemForm.remark} onChange={(e) => setItemForm({ ...itemForm, remark: e.target.value })} />
        <FormField label="排序" type="number" value={itemForm.sortOrder} onChange={(e) => setItemForm({ ...itemForm, sortOrder: e.target.value })} />
      </FormCard>

      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
        <>
          <DataTable
            data={setupLists}
            emptyText="当前还没有搭建清单数据。"
            columns={[
              { key: 'title', title: '清单标题' },
              { key: 'projectId', title: '项目 ID' },
              { key: 'projectNameSnapshot', title: '项目快照' },
              { key: 'locationSnapshot', title: '地点快照' },
              { key: 'eventDateSnapshot', title: '活动时间' },
              { key: 'status', title: '状态' }
            ]}
          />

          <div style={{ height: 20 }} />

          <DataTable
            data={setupListItems}
            emptyText="当前所选清单还没有明细数据。"
            columns={[
              { key: 'sequenceNo', title: '序号' },
              { key: 'categoryName', title: '分类' },
              { key: 'itemName', title: '内容' },
              { key: 'specification', title: '规格' },
              { key: 'quantity', title: '数量' },
              { key: 'unit', title: '单位' },
              { key: 'remark', title: '备注' },
              { key: 'executeStatus', title: '执行状态' }
            ]}
          />
        </>
      ) : null}
    </PageSection>
  );
}
