type LoadStateProps = {
  loading: boolean;
  error: string | null;
};

export function LoadState({ loading, error }: LoadStateProps) {
  if (loading) {
    return <div style={{ padding: 24 }}>加载中...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: '#b91c1c', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
        {error}
      </div>
    );
  }

  return null;
}
