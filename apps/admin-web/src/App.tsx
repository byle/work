import { useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { ProjectsPage } from './pages/ProjectsPage';
import { SetupListsPage } from './pages/SetupListsPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';

type TabKey = 'projects' | 'workOrders' | 'setupLists';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('projects');

  const content = useMemo(() => {
    if (activeTab === 'projects') {
      return <ProjectsPage />;
    }

    if (activeTab === 'workOrders') {
      return <WorkOrdersPage />;
    }

    return <SetupListsPage />;
  }, [activeTab]);

  return (
    <Layout activeTab={activeTab} onChangeTab={setActiveTab}>
      {content}
    </Layout>
  );
}
