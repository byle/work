import { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { clearToken, fetchMe, login, logout } from './lib/api';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SetupListsPage } from './pages/SetupListsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { UsersPage } from './pages/UsersPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { AuthUser } from './types/api';

type TabKey = 'dashboard' | 'templates' | 'projects' | 'workOrders' | 'setupLists' | 'users';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
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
    if (activeTab === 'dashboard') return <DashboardPage />;
    if (activeTab === 'templates') return <TemplatesPage />;
    if (activeTab === 'projects') return <ProjectsPage />;
    if (activeTab === 'workOrders') return <WorkOrdersPage />;
    if (activeTab === 'users') return <UsersPage />;
    return <SetupListsPage />;
  }, [activeTab]);

  if (loading) return <div style={{ padding: 24 }}>加载中...</div>;
  if (!user) return <LoginPage onLogin={handleLogin} error={authError} />;

  return <Layout activeTab={activeTab} onChangeTab={setActiveTab} user={user} onLogout={handleLogout}>{content}</Layout>;
}
