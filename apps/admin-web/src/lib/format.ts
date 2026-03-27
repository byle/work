function normalizeDate(value: string) {
  const normalized = value.replace(' GMT+0000 (Coordinated Universal Time)', 'Z');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatChinaDateTime(value?: string | null) {
  if (!value) {
    return '待定';
  }

  const date = normalizeDate(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date).replace('/', '-').replace('/', '-');
}

export function formatChinaDate(value?: string | null) {
  if (!value) {
    return '待定';
  }

  const date = normalizeDate(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date).replace('/', '-').replace('/', '-');
}
