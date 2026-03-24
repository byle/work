type StatusBannerProps = {
  loading: boolean;
  error: string | null;
};

export function StatusBanner({ loading, error }: StatusBannerProps) {
  if (loading) {
    return <div style={{ padding: '12px 0' }}>加载中...</div>;
  }

  if (error) {
    return (
      <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 12, marginBottom: 12 }}>
        {error}
      </div>
    );
  }

  return null;
}
