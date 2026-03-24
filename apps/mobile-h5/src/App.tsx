import { useMemo, useState } from 'react';
import { MobileShell } from './components/MobileShell';
import { TodoPage } from './pages/TodoPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';

type TabKey = 'todo' | 'workOrders';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('todo');

  const content = useMemo(() => {
    if (activeTab === 'todo') {
      return <TodoPage />;
    }

    return <WorkOrdersPage />;
  }, [activeTab]);

  return (
    <MobileShell activeTab={activeTab} onChangeTab={setActiveTab}>
      {content}
    </MobileShell>
  );
}
