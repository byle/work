import { FormEvent, useState } from 'react';

type MobileLoginPageProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
};

export function MobileLoginPage({ onLogin, error }: MobileLoginPageProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onLogin(username, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: 20, background: '#f3f4f6' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 20, marginTop: 60 }}>
        <h2 style={{ marginTop: 0 }}>现场登录</h2>
        <p style={{ color: '#6b7280' }}>登录后查看我的工单与执行进度。</p>
        <div style={{ display: 'grid', gap: 10 }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用户名" style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }} />
        </div>
        {error ? <div style={{ color: '#b91c1c', marginTop: 12 }}>{error}</div> : null}
        <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: 16, border: 'none', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 10 }}>
          {submitting ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}
