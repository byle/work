import { ReactNode } from 'react';
import { AuthUser } from '../types/api';

type TabKey = 'templates' | 'projects' | 'workOrders' | 'setupLists' | 'users';

type LayoutProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  children: ReactNode;
  user: AuthUser;
  onLogout: () => void;
};

const tabs: Array<{ key: TabKey; label: string; roles?: string[] }> = [
  { key: 'templates', label: '项目模板', roles: ['admin', 'dispatcher'] },
  { key: 'projects', label: '项目列表' },
  { key: 'workOrders', label: '工单列表' },
  { key: 'setupLists', label: '清单列表' },
  { key: 'users', label: '用户角色', roles: ['admin', 'dispatcher'] }
];

export function Layout({ activeTab, onChangeTab, children, user, onLogout }: LayoutProps) {
  const visibleTabs = tabs.filter((tab) => !tab.roles || tab.roles.some((role) => user.roles.includes(role)));

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fb', color: '#1f2937' }}>
      <header style={{ padding: '20px 24px', background: '#111827', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>舞台租赁工单系统 · Web 后台</h1>
          <p style={{ margin: '8px 0 0', color: '#d1d5db' }}>项目模板、工单、搭建清单与权限管理</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>{user.realName}（{user.username}）</div>
          <div style={{ color: '#d1d5db', fontSize: 12 }}>{user.roles.join(' / ')}</div>
          <button onClick={onLogout} style={{ marginTop: 8, border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>退出</button>
        </div>
      </header>
      <div style={{ display: 'flex' }}>
        <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #e5e7eb', padding: 16 }}>
          {visibleTabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                onClick={() => onChangeTab(tab.key)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  marginBottom: 8,
                  borderRadius: 10,
                  border: 'none',
                  background: active ? '#2563eb' : '#f3f4f6',
                  color: active ? '#fff' : '#111827',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </aside>
        <main style={{ flex: 1, padding: 24 }}>{children}</main>
      </div>
    </div>
  );
}
