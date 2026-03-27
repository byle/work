import { ChangeEvent, useEffect, useState } from 'react';
import { BackButton } from '../components/BackButton';
import { InfoCard } from '../components/InfoCard';
import { StatusBanner } from '../components/StatusBanner';
import { deleteAttachment, fetchAttachments, fetchWorkOrderDetail, updateWorkOrderStatus, uploadAttachment } from '../lib/api';
import { Attachment, WorkOrder } from '../types/api';

type WorkOrderDetailPageProps = {
  workOrderId: number;
  onBack: () => void;
};

export function WorkOrderDetailPage({ workOrderId, onBack }: WorkOrderDetailPageProps) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([fetchWorkOrderDetail(workOrderId), fetchAttachments(workOrderId)])
      .then(([detail, attachmentList]) => {
        setWorkOrder(detail);
        setAttachments(attachmentList);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [workOrderId]);

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    try {
      const result = await updateWorkOrderStatus(workOrderId, status, remark);
      setWorkOrder(result);
      setRemark('');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    const contentBase64 = btoa(binary);
    await uploadAttachment(workOrderId, {
      fileName: file.name,
      fileType: file.type,
      contentBase64
    });
    await load();
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    await deleteAttachment(attachmentId);
    await load();
  };

  return (
    <>
      <BackButton onClick={onBack} />
      <StatusBanner loading={loading} error={error} />
      {workOrder ? (
        <InfoCard title={workOrder.title} description={`工单编号：${workOrder.workOrderNo}`}>
          <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
            <div>项目 ID：{workOrder.projectId}</div>
            <div>工单类型：{workOrder.type}</div>
            <div>优先级：{workOrder.priority}</div>
            <div>状态：{workOrder.status}</div>
            <div>执行人：{workOrder.assigneeId ?? '未分配'}</div>
            <div>审核人：{workOrder.reviewerId ?? '未设置'}</div>
            <div>说明：{workOrder.description || '暂无说明'}</div>
          </div>
          <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="输入执行备注或审核意见" style={{ width: '100%', minHeight: 80, marginTop: 16, borderRadius: 10, border: '1px solid #d1d5db', padding: 12 }} />
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {workOrder.status === 'pending_assign' || workOrder.status === 'rejected' ? <button onClick={() => handleStatusChange('in_progress')} disabled={saving} style={{ border: 'none', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 10 }}>开始执行</button> : null}
            {workOrder.status === 'in_progress' ? <button onClick={() => handleStatusChange('pending_review')} disabled={saving} style={{ border: 'none', background: '#f59e0b', color: '#fff', padding: 12, borderRadius: 10 }}>提交审核</button> : null}
            {workOrder.status === 'pending_review' ? <button onClick={() => handleStatusChange('approved')} disabled={saving} style={{ border: 'none', background: '#059669', color: '#fff', padding: 12, borderRadius: 10 }}>审核通过</button> : null}
            {workOrder.status === 'pending_review' ? <button onClick={() => handleStatusChange('rejected')} disabled={saving} style={{ border: 'none', background: '#dc2626', color: '#fff', padding: 12, borderRadius: 10 }}>驳回返工</button> : null}
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'inline-block', background: '#f3f4f6', padding: '10px 16px', borderRadius: 10, cursor: 'pointer' }}>
              上传现场附件
              <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            {attachments.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <a href={`http://127.0.0.1:3000${item.fileUrl}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                  {item.fileName}
                </a>
                <button onClick={() => handleDeleteAttachment(item.id)} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '6px 10px', borderRadius: 8 }}>删除</button>
              </div>
            ))}
          </div>
        </InfoCard>
      ) : null}
    </>
  );
}
