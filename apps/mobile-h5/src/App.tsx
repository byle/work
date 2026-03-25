import { useMemo, useState } from 'react';
import { MobileShell } from './components/MobileShell';
import { TodoPage } from './pages/TodoPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';

type TabKey = 'todo' | 'workOrders';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('todo');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);

  const content = useMemo(() => {
    if (activeTab === 'todo') {
      return <TodoPage />;
    }

    if (selectedWorkOrderId) {
      return <WorkOrderDetailPage workOrderId={selectedWorkOrderId} onBack={() => setSelectedWorkOrderId(null)} />;
    }

    return <WorkOrdersPage onOpenDetail={setSelectedWorkOrderId} />;
  }, [activeTab, selectedWorkOrderId]);

  return (
    <MobileShell
      activeTab={activeTab}
      onChangeTab={(tab) => {
        setActiveTab(tab);
        setSelectedWorkOrderId(null);
      }}
    >
      {content}
    </MobileShell>
  );
}
