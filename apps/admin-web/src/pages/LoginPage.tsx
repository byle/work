import { FormEvent, useState } from 'react';

type LoginPageProps = {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
};

export function LoginPage({ onLogin, error }: LoginPageProps) {
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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>舞台租赁工单系统</h1>
        <p style={{ color: '#6b7280' }}>请先登录后台，默认账号已预置。</p>
        <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          <span>用户名</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #d1d5db' }} />
        </label>
        <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          <span>密码</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid #d1d5db' }} />
        </label>
        {error ? <div style={{ marginBottom: 12, color: '#b91c1c' }}>{error}</div> : null}
        <button type="submit" disabled={submitting} style={{ width: '100%', border: 'none', background: '#2563eb', color: '#fff', borderRadius: 10, padding: 12, cursor: 'pointer' }}>
          {submitting ? '登录中...' : '登录'}
        </button>
        <p style={{ marginTop: 12, color: '#6b7280', fontSize: 12 }}>默认账号：admin / admin123</p>
      </form>
    </div>
  );
}
