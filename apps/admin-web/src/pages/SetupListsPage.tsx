import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { fetchSetupLists } from '../lib/api';
import { SetupList } from '../types/api';

export function SetupListsPage() {
  const [setupLists, setSetupLists] = useState<SetupList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSetupLists()
      .then((data) => {
        setSetupLists(data.list);
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
    <PageSection title="清单列表" description="查看搭建清单表头、项目快照和执行状态。">
      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
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
      ) : null}
    </PageSection>
  );
}
