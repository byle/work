import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { requireAuth } from '../../shared/auth';
import { getProjectById } from '../project/project.repository';
import { getSetupListById, listSetupListItems } from '../setup-list/setup-list.repository';
import { getWorkOrderById } from '../work-order/work-order.repository';

export const printRouter = Router();

printRouter.use(requireAuth);

function renderHtml(title: string, body: string) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #111827; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    h2 { font-size: 18px; margin: 24px 0 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; font-size: 14px; }
    .grid { display: grid; grid-template-columns: 180px 1fr; gap: 8px 12px; }
    .label { color: #6b7280; }
    @media print { button { display:none; } body { padding: 0; } }
  </style>
</head>
<body>
  <button onclick="window.print()">打印</button>
  ${body}
</body>
</html>`;
}

printRouter.get(
  '/projects/:id',
  asyncHandler(async (req, res) => {
    const project = await getProjectById(Number(req.params.id));
    if (!project) return res.status(404).send('Project not found');

    const members = (project.members || []).map((item) => `<tr><td>${item.userId}</td><td>${item.roleInProject}</td></tr>`).join('');
    const html = renderHtml(
      `项目单-${project.projectNo}`,
      `<h1>项目单</h1>
       <div class="grid">
         <div class="label">项目编号</div><div>${project.projectNo}</div>
         <div class="label">项目名称</div><div>${project.name}</div>
         <div class="label">项目地点</div><div>${project.location}</div>
         <div class="label">活动日期</div><div>${project.eventDate}</div>
         <div class="label">状态</div><div>${project.statusLabel}</div>
         <div class="label">来源</div><div>${project.sourceTypeLabel}</div>
         <div class="label">负责人</div><div>${project.managerId ?? '未设置'}</div>
       </div>
       <h2>项目成员</h2>
       <table><thead><tr><th>用户 ID</th><th>项目角色</th></tr></thead><tbody>${members || '<tr><td colspan="2">暂无成员</td></tr>'}</tbody></table>`
    );

    res.type('html').send(html);
  })
);

printRouter.get(
  '/work-orders/:id',
  asyncHandler(async (req, res) => {
    const workOrder = await getWorkOrderById(Number(req.params.id));
    if (!workOrder) return res.status(404).send('Work order not found');

    const html = renderHtml(
      `工单单-${workOrder.workOrderNo}`,
      `<h1>工单单</h1>
       <div class="grid">
         <div class="label">工单编号</div><div>${workOrder.workOrderNo}</div>
         <div class="label">工单标题</div><div>${workOrder.title}</div>
         <div class="label">项目 ID</div><div>${workOrder.projectId}</div>
         <div class="label">类型</div><div>${workOrder.typeLabel}</div>
         <div class="label">优先级</div><div>${workOrder.priorityLabel}</div>
         <div class="label">状态</div><div>${workOrder.statusLabel}</div>
         <div class="label">执行人</div><div>${workOrder.assigneeId ?? '未分配'}</div>
         <div class="label">审核人</div><div>${workOrder.reviewerId ?? '未设置'}</div>
         <div class="label">说明</div><div>${workOrder.description || '暂无说明'}</div>
       </div>`
    );

    res.type('html').send(html);
  })
);

printRouter.get(
  '/setup-lists/:id',
  asyncHandler(async (req, res) => {
    const setupList = await getSetupListById(Number(req.params.id));
    if (!setupList) return res.status(404).send('Setup list not found');
    const items = await listSetupListItems(setupList.id);
    const rows = items.map((item) => `<tr><td>${item.sequenceNo || ''}</td><td>${item.categoryName || ''}</td><td>${item.itemName}</td><td>${item.specification || ''}</td><td>${item.quantity}</td><td>${item.unit}</td><td>${item.executeStatusLabel}</td><td>${item.remark || ''}</td></tr>`).join('');

    const html = renderHtml(
      `清单单-${setupList.title}`,
      `<h1>搭建清单</h1>
       <div class="grid">
         <div class="label">清单标题</div><div>${setupList.title}</div>
         <div class="label">项目 ID</div><div>${setupList.projectId}</div>
         <div class="label">项目快照</div><div>${setupList.projectNameSnapshot}</div>
         <div class="label">地点快照</div><div>${setupList.locationSnapshot}</div>
         <div class="label">活动时间</div><div>${setupList.eventDateSnapshot}</div>
         <div class="label">状态</div><div>${setupList.statusLabel}</div>
       </div>
       <h2>清单明细</h2>
       <table><thead><tr><th>序号</th><th>分类</th><th>内容</th><th>规格</th><th>数量</th><th>单位</th><th>执行状态</th><th>备注</th></tr></thead><tbody>${rows || '<tr><td colspan="8">暂无明细</td></tr>'}</tbody></table>`
    );

    res.type('html').send(html);
  })
);
