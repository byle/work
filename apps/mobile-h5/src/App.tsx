import { useEffect, useMemo, useState } from 'react';
import { MobileShell } from './components/MobileShell';
import { clearToken, fetchMe, login, logout } from './lib/api';
import { MobileLoginPage } from './pages/LoginPage';
import { TodoPage } from './pages/TodoPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { AuthUser } from './types/api';

type TabKey = 'todo' | 'workOrders';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('todo');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setUser(data);
        setAuthError(null);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await login({ username, password });
      setUser(result.user);
      setAuthError(null);
    } catch (error) {
      setAuthError((error as Error).message);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearToken();
      setUser(null);
    }
  };

  const content = useMemo(() => {
    if (activeTab === 'todo') {
      return <TodoPage />;
    }

    if (selectedWorkOrderId) {
      return <WorkOrderDetailPage workOrderId={selectedWorkOrderId} onBack={() => setSelectedWorkOrderId(null)} />;
    }

    return <WorkOrdersPage onOpenDetail={setSelectedWorkOrderId} />;
  }, [activeTab, selectedWorkOrderId]);

  if (loading) {
    return <div style={{ padding: 20 }}>加载中...</div>;
  }

  if (!user) {
    return <MobileLoginPage onLogin={handleLogin} error={authError} />;
  }

  return (
    <>
      <div style={{ padding: '10px 16px', background: '#111827', color: '#fff', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span>{user.realName}</span>
        <button onClick={handleLogout} style={{ border: 'none', background: 'transparent', color: '#fff' }}>退出</button>
      </div>
      <MobileShell
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          setSelectedWorkOrderId(null);
        }}
      >
        {content}
      </MobileShell>
    </>
  );
}
