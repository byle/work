import { useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { fetchProjects } from '../lib/api';
import { Project } from '../types/api';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <PageSection title="项目列表" description="查看活动项目、时间、地点和当前状态。">
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
