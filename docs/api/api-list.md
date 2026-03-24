# 舞台租赁工单系统 API 清单

## 1. 文档信息

- 项目名称：舞台租赁工单系统
- 文档版本：V0.1
- 文档日期：2026-03-25
- 适用阶段：MVP
- 服务对象：`Web` 后台、手机 `H5`

## 2. 设计说明

本文件用于定义首期 MVP 的接口清单，帮助前后端统一接口范围、字段方向和调用关系。

建议首期采用：

- 协议：`HTTPS`
- 风格：`RESTful API`
- 数据格式：`JSON`
- 认证方式：`Bearer Token`
- 时间格式：`YYYY-MM-DD HH:mm:ss`

## 3. 通用约定

## 3.1 请求头

建议统一请求头：

- `Authorization: Bearer {token}`
- `Content-Type: application/json`

文件上传接口使用：

- `Content-Type: multipart/form-data`

## 3.2 通用响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 字段说明

- `code`：业务状态码，`0` 表示成功
- `message`：响应提示信息
- `data`：业务数据

## 3.3 分页结构

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

## 4. 接口模块总览

MVP 建议分为以下模块：

- 认证模块
- 用户与角色模块
- 项目模块
- 工单模块
- 模板模块
- 搭建清单模块
- 导入模块
- 附件模块
- 手机端待办模块

---

## 5. 认证模块

## 5.1 登录

- 方法：`POST`
- 路径：`/api/auth/login`
- 说明：账号密码登录

### 请求参数

```json
{
  "username": "admin",
  "password": "123456"
}
```

### 响应数据

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "xxx",
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "管理员",
      "roles": ["admin"]
    }
  }
}
```

## 5.2 获取当前登录用户信息

- 方法：`GET`
- 路径：`/api/auth/me`
- 说明：获取当前用户基础信息和角色信息

## 5.3 退出登录

- 方法：`POST`
- 路径：`/api/auth/logout`
- 说明：退出当前登录状态

---

## 6. 用户与角色模块

## 6.1 用户列表

- 方法：`GET`
- 路径：`/api/users`
- 说明：分页查询用户列表

### 查询参数

- `keyword`
- `status`
- `page`
- `pageSize`

## 6.2 创建用户

- 方法：`POST`
- 路径：`/api/users`
- 说明：创建新用户

## 6.3 更新用户

- 方法：`PUT`
- 路径：`/api/users/{id}`
- 说明：编辑用户信息

## 6.4 用户详情

- 方法：`GET`
- 路径：`/api/users/{id}`
- 说明：查看用户详情

## 6.5 角色列表

- 方法：`GET`
- 路径：`/api/roles`
- 说明：获取角色列表

## 6.6 分配用户角色

- 方法：`POST`
- 路径：`/api/users/{id}/roles`
- 说明：为用户分配角色

### 请求参数

```json
{
  "roleIds": [1, 2]
}
```

---

## 7. 项目模块

## 7.1 项目列表

- 方法：`GET`
- 路径：`/api/projects`
- 说明：分页查询项目列表

### 查询参数

- `keyword`
- `status`
- `managerId`
- `eventDateStart`
- `eventDateEnd`
- `page`
- `pageSize`

## 7.2 创建项目

- 方法：`POST`
- 路径：`/api/projects`
- 说明：创建项目

### 请求参数示例

```json
{
  "name": "第三届新突围所长沙龙",
  "customerName": "某客户",
  "location": "广西北海喜来登度假酒店多功能厅",
  "eventDate": "2026-03-26",
  "moveInAt": "2026-03-25 14:00:00",
  "rehearsalAt": "2026-03-25 17:00:00",
  "moveOutAt": "2026-03-26 21:00:00",
  "managerId": 2,
  "remark": "重要客户活动"
}
```

## 7.3 项目详情

- 方法：`GET`
- 路径：`/api/projects/{id}`
- 说明：获取项目详情，建议附带工单数、清单数等摘要信息

## 7.4 更新项目

- 方法：`PUT`
- 路径：`/api/projects/{id}`
- 说明：更新项目信息

## 7.5 项目状态更新

- 方法：`PATCH`
- 路径：`/api/projects/{id}/status`
- 说明：更新项目状态

### 请求参数

```json
{
  "status": "in_progress"
}
```

## 7.6 项目成员列表

- 方法：`GET`
- 路径：`/api/projects/{id}/members`
- 说明：查询项目成员

## 7.7 添加项目成员

- 方法：`POST`
- 路径：`/api/projects/{id}/members`
- 说明：添加项目参与人员

### 请求参数

```json
{
  "userId": 3,
  "roleInProject": "现场负责人"
}
```

---

## 8. 工单模块

## 8.1 工单列表

- 方法：`GET`
- 路径：`/api/work-orders`
- 说明：分页查询工单列表

### 查询参数

- `projectId`
- `type`
- `status`
- `assigneeId`
- `page`
- `pageSize`

## 8.2 创建工单

- 方法：`POST`
- 路径：`/api/work-orders`
- 说明：手工创建工单

### 请求参数示例

```json
{
  "projectId": 1,
  "title": "主舞台搭建工单",
  "type": "setup",
  "priority": "high",
  "assigneeId": 5,
  "plannedStartAt": "2026-03-25 14:00:00",
  "plannedEndAt": "2026-03-25 18:00:00",
  "description": "完成舞台、LED 屏和背景板搭建"
}
```

## 8.3 工单详情

- 方法：`GET`
- 路径：`/api/work-orders/{id}`
- 说明：获取工单详情

## 8.4 更新工单

- 方法：`PUT`
- 路径：`/api/work-orders/{id}`
- 说明：编辑工单

## 8.5 分配工单

- 方法：`POST`
- 路径：`/api/work-orders/{id}/assign`
- 说明：为工单分配执行人

### 请求参数

```json
{
  "assigneeId": 5
}
```

## 8.6 更新工单状态

- 方法：`PATCH`
- 路径：`/api/work-orders/{id}/status`
- 说明：更新工单状态

### 请求参数

```json
{
  "status": "in_progress",
  "remark": "已到场开始施工"
}
```

## 8.7 工单执行日志列表

- 方法：`GET`
- 路径：`/api/work-orders/{id}/logs`
- 说明：查看工单操作记录

## 8.8 新增工单备注/反馈

- 方法：`POST`
- 路径：`/api/work-orders/{id}/logs`
- 说明：新增工单备注、异常或执行反馈

### 请求参数

```json
{
  "actionType": "remark",
  "content": "舞台区域已完成 80%"
}
```

---

## 9. 模板模块

## 9.1 项目模板列表

- 方法：`GET`
- 路径：`/api/project-templates`
- 说明：查询项目模板

## 9.2 创建项目模板

- 方法：`POST`
- 路径：`/api/project-templates`
- 说明：新增项目模板

## 9.3 项目模板详情

- 方法：`GET`
- 路径：`/api/project-templates/{id}`
- 说明：查看项目模板详情

## 9.4 从项目模板创建项目

- 方法：`POST`
- 路径：`/api/project-templates/{id}/generate-project`
- 说明：根据模板生成项目及相关基础数据

## 9.5 工单模板列表

- 方法：`GET`
- 路径：`/api/work-order-templates`
- 说明：查询工单模板列表

## 9.6 创建工单模板

- 方法：`POST`
- 路径：`/api/work-order-templates`
- 说明：新增工单模板

## 9.7 从模板生成工单

- 方法：`POST`
- 路径：`/api/projects/{id}/generate-work-orders`
- 说明：按项目模板或工单模板批量生成工单

---

## 10. 搭建清单模块

## 10.1 搭建清单列表

- 方法：`GET`
- 路径：`/api/setup-lists`
- 说明：分页查询搭建清单

### 查询参数

- `projectId`
- `status`
- `page`
- `pageSize`

## 10.2 创建搭建清单

- 方法：`POST`
- 路径：`/api/setup-lists`
- 说明：手工创建搭建清单表头

## 10.3 搭建清单详情

- 方法：`GET`
- 路径：`/api/setup-lists/{id}`
- 说明：查看清单详情与表头信息

## 10.4 搭建清单明细列表

- 方法：`GET`
- 路径：`/api/setup-lists/{id}/items`
- 说明：获取清单明细

## 10.5 新增清单明细

- 方法：`POST`
- 路径：`/api/setup-lists/{id}/items`
- 说明：新增清单明细项

### 请求参数示例

```json
{
  "sequenceNo": "1.2.2",
  "categoryName": "大屏&舞台设备",
  "itemName": "LED 屏幕",
  "specification": "L6*H4m",
  "quantity": 24,
  "unit": "平方",
  "remark": "上舞台边搭建"
}
```

## 10.6 更新清单明细

- 方法：`PUT`
- 路径：`/api/setup-list-items/{id}`
- 说明：编辑清单项

## 10.7 更新清单项执行状态

- 方法：`PATCH`
- 路径：`/api/setup-list-items/{id}/status`
- 说明：更新单条清单项执行状态

### 请求参数

```json
{
  "executeStatus": "completed",
  "remark": "已完成安装"
}
```

## 10.8 发布搭建清单

- 方法：`POST`
- 路径：`/api/setup-lists/{id}/publish`
- 说明：将清单发布给现场执行人员

---

## 11. 导入模块

## 11.1 下载导入模板

- 方法：`GET`
- 路径：`/api/import-templates/setup-list`
- 说明：下载搭建清单 Excel 模板

## 11.2 导入搭建清单

- 方法：`POST`
- 路径：`/api/setup-lists/import`
- 说明：上传 Excel 并导入搭建清单

### 请求方式

- `multipart/form-data`

### 表单参数

- `projectId`：项目 ID
- `file`：Excel 文件

### 响应示例

```json
{
  "code": 0,
  "message": "import success",
  "data": {
    "importTaskId": 1001,
    "setupListId": 2001,
    "totalCount": 48,
    "successCount": 48,
    "failCount": 0
  }
}
```

## 11.3 导入记录列表

- 方法：`GET`
- 路径：`/api/import-tasks`
- 说明：分页查看导入记录

## 11.4 导入记录详情

- 方法：`GET`
- 路径：`/api/import-tasks/{id}`
- 说明：查看导入结果详情和失败原因

---

## 12. 附件模块

## 12.1 文件上传

- 方法：`POST`
- 路径：`/api/files/upload`
- 说明：上传图片或附件

### 请求方式

- `multipart/form-data`

### 表单参数

- `file`
- `bizType`
- `bizId`

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "fileName": "现场照片1.jpg",
    "fileUrl": "https://example.com/uploads/1.jpg"
  }
}
```

## 12.2 附件列表

- 方法：`GET`
- 路径：`/api/attachments`
- 说明：按业务对象查询附件

### 查询参数

- `bizType`
- `bizId`

---

## 13. 手机端 H5 模块

## 13.1 我的待办

- 方法：`GET`
- 路径：`/api/mobile/todos`
- 说明：获取当前用户待处理任务汇总

### 响应建议

返回：

- 待处理工单数量
- 执行中工单数量
- 今日项目数量
- 最近项目列表

## 13.2 我的项目

- 方法：`GET`
- 路径：`/api/mobile/projects`
- 说明：获取当前用户参与的项目列表

## 13.3 我的工单

- 方法：`GET`
- 路径：`/api/mobile/work-orders`
- 说明：获取当前用户的工单列表

### 查询参数

- `status`
- `page`
- `pageSize`

## 13.4 手机端工单详情

- 方法：`GET`
- 路径：`/api/mobile/work-orders/{id}`
- 说明：获取工单详情与关联清单摘要

## 13.5 手机端开始执行工单

- 方法：`POST`
- 路径：`/api/mobile/work-orders/{id}/start`
- 说明：现场人员开始执行工单

## 13.6 手机端完成工单

- 方法：`POST`
- 路径：`/api/mobile/work-orders/{id}/complete`
- 说明：现场人员提交完成结果

### 请求参数示例

```json
{
  "remark": "主舞台区域已搭建完成",
  "attachmentIds": [11, 12]
}
```

## 13.7 手机端清单详情

- 方法：`GET`
- 路径：`/api/mobile/setup-lists/{id}`
- 说明：获取手机端清单详情

## 13.8 手机端更新清单项状态

- 方法：`PATCH`
- 路径：`/api/mobile/setup-list-items/{id}/status`
- 说明：现场人员勾选清单项完成状态

### 请求参数

```json
{
  "executeStatus": "completed",
  "remark": "已完成",
  "attachmentIds": [20]
}
```

## 13.9 手机端异常反馈

- 方法：`POST`
- 路径：`/api/mobile/exceptions`
- 说明：提交现场异常、缺料、损坏、变更反馈

### 请求参数示例

```json
{
  "projectId": 1,
  "workOrderId": 10,
  "setupListItemId": 20,
  "type": "lack_of_material",
  "content": "缺少一块企业展板",
  "attachmentIds": [15]
}
```

---

## 14. 建议错误码

| 错误码 | 说明 |
|---|---|
| 0 | 成功 |
| 4001 | 参数错误 |
| 4002 | 未登录或登录失效 |
| 4003 | 无权限访问 |
| 4004 | 数据不存在 |
| 4005 | 状态流转不合法 |
| 4006 | 文件格式错误 |
| 4007 | 导入解析失败 |
| 5000 | 系统内部错误 |

## 15. MVP 必做接口清单

首期必须优先完成：

- 登录 / 当前用户信息
- 用户列表 / 角色分配
- 项目增删改查
- 工单增删改查 / 分配 / 状态流转
- 搭建清单增删改查
- 清单明细增删改查 / 执行状态更新
- Excel 导入
- 文件上传
- 手机端待办 / 工单 / 清单 / 执行反馈

## 16. 下一步建议

建议继续补齐：

1. PostgreSQL 建表 SQL 初稿
2. 后台页面字段清单
3. 手机端页面流程图
4. API 字段详细定义（Request / Response Schema）
