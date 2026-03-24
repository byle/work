import { ReactNode } from 'react';

type TabKey = 'todo' | 'workOrders';

type MobileShellProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  children: ReactNode;
};

export function MobileShell({ activeTab, onChangeTab, children }: MobileShellProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#111827', paddingBottom: 72 }}>
      <header style={{ background: '#111827', color: '#fff', padding: '16px 20px' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>现场操作 H5</h1>
        <p style={{ margin: '6px 0 0', color: '#d1d5db', fontSize: 14 }}>我的待办 / 我的工单</p>
      </header>
      <main style={{ padding: 16 }}>{children}</main>
      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: 12,
          background: '#fff',
          borderTop: '1px solid #e5e7eb'
        }}
      >
        <button
          onClick={() => onChangeTab('todo')}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '12px 0',
            background: activeTab === 'todo' ? '#2563eb' : '#f3f4f6',
            color: activeTab === 'todo' ? '#fff' : '#111827'
          }}
        >
          我的待办
        </button>
        <button
          onClick={() => onChangeTab('workOrders')}
          style={{
            border: 'none',
            borderRadius: 12,
            padding: '12px 0',
            background: activeTab === 'workOrders' ? '#2563eb' : '#f3f4f6',
            color: activeTab === 'workOrders' ? '#fff' : '#111827'
          }}
        >
          我的工单
        </button>
      </nav>
    </div>
  );
}
