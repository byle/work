import { FormEvent, useEffect, useState } from 'react';
import { DataTable } from '../components/DataTable';
import { FormCard } from '../components/FormCard';
import { FormField } from '../components/FormField';
import { LoadState } from '../components/LoadState';
import { PageSection } from '../components/PageSection';
import { createUser, fetchUsers } from '../lib/api';
import { User } from '../types/api';

const initialForm = {
  username: '',
  password: '',
  realName: '',
  roleCodes: 'site'
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const loadData = () => {
    setLoading(true);
    fetchUsers()
      .then((data) => {
        setUsers(data.list);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createUser({
        username: form.username,
        password: form.password,
        realName: form.realName,
        roleCodes: form.roleCodes.split(',').map((item) => item.trim()).filter(Boolean)
      });
      setForm(initialForm);
      loadData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageSection title="用户与角色" description="维护后台用户、现场账号和角色分工。">
      <FormCard title="新建用户" description="可创建调度或现场账号，角色用逗号分隔。" onSubmit={handleSubmit} submitting={submitting}>
        <FormField label="用户名" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <FormField label="密码" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <FormField label="姓名" value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} required />
        <FormField label="角色代码" value={form.roleCodes} onChange={(e) => setForm({ ...form, roleCodes: e.target.value })} required />
      </FormCard>
      <LoadState loading={loading} error={error} />
      {!loading && !error ? (
        <DataTable
          data={users}
          emptyText="暂无用户。"
          columns={[
            { key: 'id', title: 'ID' },
            { key: 'username', title: '用户名' },
            { key: 'realName', title: '姓名' },
            { key: 'roles', title: '角色', render: (item) => item.roles.join('、') },
            { key: 'status', title: '状态' }
          ]}
        />
      ) : null}
    </PageSection>
  );
}
