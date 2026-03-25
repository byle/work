type BackButtonProps = {
  onClick: () => void;
};

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        background: '#e5e7eb',
        color: '#111827',
        padding: '10px 14px',
        borderRadius: 10,
        marginBottom: 12
      }}
    >
      返回
    </button>
  );
}
