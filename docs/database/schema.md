# 舞台租赁工单系统数据库设计

## 1. 文档信息

- 项目名称：舞台租赁工单系统
- 文档版本：V0.1
- 文档日期：2026-03-25
- 推荐数据库：`PostgreSQL`
- 兼容方案：`MySQL`

## 2. 设计目标

本设计用于支撑以下核心业务：

- 项目管理
- 工单管理
- 模板化创建
- 搭建清单录入与导入
- 手机端现场执行反馈
- 附件上传与操作日志记录

数据库设计遵循以下原则：

- 以项目为中心组织业务数据
- 以工单为执行主体
- 以搭建清单为现场操作依据
- 支持模板复用和后续版本迭代
- 预留物料、仓库、排期等后续扩展能力

## 3. 核心实体关系

核心实体如下：

- 用户 `users`
- 角色 `roles`
- 用户角色关系 `user_roles`
- 项目 `projects`
- 项目成员 `project_members`
- 工单 `work_orders`
- 工单执行记录 `work_order_logs`
- 项目模板 `project_templates`
- 工单模板 `work_order_templates`
- 搭建清单 `setup_lists`
- 搭建清单明细 `setup_list_items`
- 附件 `attachments`
- 数据导入记录 `import_tasks`

建议的主关系：

- 一个项目可关联多个工单
- 一个项目可关联一个或多个搭建清单
- 一个搭建清单可包含多个清单明细
- 一个项目可关联多个项目成员
- 一个工单可关联多条执行日志和多个附件
- 模板可用于快速生成项目、工单、清单

## 4. 通用字段规范

建议所有主表包含以下通用字段：

- `id`：主键
- `created_at`：创建时间
- `updated_at`：更新时间
- `created_by`：创建人 ID
- `updated_by`：更新人 ID
- `is_deleted`：逻辑删除标记，默认 `false`

建议：

- `id` 使用 `bigint` 或 `uuid`
- 首期若团队偏传统开发习惯，可使用 `bigserial`
- 所有时间字段建议统一使用带时区时间，或由应用层统一时区处理

## 5. 数据表设计

## 5.1 用户表 `users`

### 用途

存储系统账号信息。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| username | varchar(50) | 登录账号，唯一 |
| password_hash | varchar(255) | 密码摘要 |
| real_name | varchar(50) | 真实姓名 |
| mobile | varchar(20) | 手机号 |
| email | varchar(100) | 邮箱，可空 |
| status | varchar(20) | 状态：active / disabled |
| last_login_at | timestamp | 最近登录时间 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

### 索引建议

- 唯一索引：`username`
- 普通索引：`mobile`

## 5.2 角色表 `roles`

### 用途

定义系统角色。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| code | varchar(50) | 角色编码，唯一 |
| name | varchar(50) | 角色名称 |
| description | varchar(255) | 描述 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

## 5.3 用户角色关系表 `user_roles`

### 用途

维护用户与角色的多对多关系。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| user_id | bigint | 用户 ID |
| role_id | bigint | 角色 ID |
| created_at | timestamp | 创建时间 |

### 索引建议

- 唯一索引：`(user_id, role_id)`

## 5.4 项目表 `projects`

### 用途

存储活动项目主信息。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| project_no | varchar(50) | 项目编号，唯一 |
| name | varchar(200) | 项目名称 |
| customer_name | varchar(100) | 客户名称 |
| location | varchar(255) | 项目地点 |
| event_date | date | 活动日期 |
| move_in_at | timestamp | 进场时间 |
| rehearsal_at | timestamp | 彩排时间 |
| move_out_at | timestamp | 撤场时间 |
| manager_id | bigint | 项目经理 ID |
| status | varchar(30) | 项目状态 |
| source_type | varchar(30) | 来源：manual / template |
| template_id | bigint | 来源模板 ID，可空 |
| remark | text | 备注 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

### 状态建议

- draft
- pending
- in_progress
- completed
- closed

### 索引建议

- 唯一索引：`project_no`
- 普通索引：`manager_id`
- 普通索引：`event_date`
- 普通索引：`status`

## 5.5 项目成员表 `project_members`

### 用途

维护项目参与人员。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| project_id | bigint | 项目 ID |
| user_id | bigint | 用户 ID |
| role_in_project | varchar(50) | 项目内角色 |
| created_at | timestamp | 创建时间 |

### 索引建议

- 唯一索引：`(project_id, user_id, role_in_project)`

## 5.6 工单表 `work_orders`

### 用途

存储具体执行任务。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| work_order_no | varchar(50) | 工单编号，唯一 |
| project_id | bigint | 所属项目 ID |
| title | varchar(200) | 工单标题 |
| type | varchar(30) | 工单类型 |
| priority | varchar(20) | 优先级：low / medium / high |
| status | varchar(30) | 工单状态 |
| assignee_id | bigint | 当前执行人 |
| reviewer_id | bigint | 验收/负责人，可空 |
| planned_start_at | timestamp | 计划开始时间 |
| planned_end_at | timestamp | 计划结束时间 |
| actual_start_at | timestamp | 实际开始时间 |
| actual_end_at | timestamp | 实际完成时间 |
| description | text | 工单说明 |
| template_id | bigint | 来源模板 ID，可空 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

### 类型建议

- setup
- teardown
- transport
- replenishment
- emergency

### 状态建议

- pending_assign
- pending
- in_progress
- completed
- closed

### 索引建议

- 唯一索引：`work_order_no`
- 普通索引：`project_id`
- 普通索引：`assignee_id`
- 普通索引：`status`
- 普通索引：`type`

## 5.7 工单执行日志表 `work_order_logs`

### 用途

记录工单流转、反馈、备注、异常等执行记录。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| work_order_id | bigint | 工单 ID |
| action_type | varchar(30) | 操作类型 |
| operator_id | bigint | 操作人 |
| content | text | 内容 |
| from_status | varchar(30) | 原状态 |
| to_status | varchar(30) | 新状态 |
| created_at | timestamp | 创建时间 |

### 操作类型建议

- create
- assign
- start
- complete
- close
- remark
- exception
- upload

## 5.8 项目模板表 `project_templates`

### 用途

沉淀常用项目模板。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| name | varchar(100) | 模板名称 |
| category | varchar(50) | 模板分类 |
| description | text | 描述 |
| version | integer | 版本号 |
| status | varchar(20) | 状态：active / inactive |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

## 5.9 工单模板表 `work_order_templates`

### 用途

沉淀常用工单模板。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| project_template_id | bigint | 关联项目模板，可空 |
| name | varchar(100) | 模板名称 |
| type | varchar(30) | 工单类型 |
| title_template | varchar(200) | 标题模板 |
| description_template | text | 描述模板 |
| default_priority | varchar(20) | 默认优先级 |
| sort_order | integer | 排序 |
| status | varchar(20) | 状态 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

## 5.10 搭建清单表 `setup_lists`

### 用途

保存项目级搭建清单表头信息。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| project_id | bigint | 所属项目 ID |
| template_id | bigint | 来源模板 ID，可空 |
| title | varchar(200) | 清单标题 |
| project_name_snapshot | varchar(200) | 项目名称快照 |
| location_snapshot | varchar(255) | 地点快照 |
| event_date_snapshot | date | 活动日期快照 |
| move_in_at_snapshot | timestamp | 进场时间快照 |
| rehearsal_at_snapshot | timestamp | 彩排时间快照 |
| move_out_at_snapshot | timestamp | 撤场时间快照 |
| remark | text | 备注 |
| status | varchar(30) | 清单状态 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

### 状态建议

- draft
- published
- executing
- completed

## 5.11 搭建清单明细表 `setup_list_items`

### 用途

保存清单的每一项执行明细。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| setup_list_id | bigint | 清单 ID |
| parent_id | bigint | 父级 ID，可空，用于层级分组 |
| sequence_no | varchar(50) | 序号，如 1.1.1 |
| category_name | varchar(100) | 分类名称 |
| item_name | varchar(200) | 内容 |
| specification | varchar(255) | 规格 |
| quantity | numeric(12,2) | 数量 |
| unit | varchar(20) | 单位 |
| remark | varchar(255) | 备注 |
| execute_status | varchar(30) | 执行状态 |
| assignee_id | bigint | 执行人，可空 |
| completed_at | timestamp | 完成时间，可空 |
| sort_order | integer | 排序 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |
| created_by | bigint | 创建人 |
| updated_by | bigint | 更新人 |
| is_deleted | boolean | 逻辑删除 |

### 执行状态建议

- pending
- in_progress
- completed
- exception

### 索引建议

- 普通索引：`setup_list_id`
- 普通索引：`assignee_id`
- 普通索引：`execute_status`

## 5.12 附件表 `attachments`

### 用途

统一保存图片、文件等附件。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| biz_type | varchar(30) | 业务类型：project / work_order / setup_item |
| biz_id | bigint | 业务主键 ID |
| file_name | varchar(255) | 文件名 |
| file_url | varchar(500) | 文件地址 |
| file_type | varchar(50) | 文件类型 |
| file_size | bigint | 文件大小 |
| uploaded_by | bigint | 上传人 |
| created_at | timestamp | 创建时间 |

### 索引建议

- 组合索引：`(biz_type, biz_id)`

## 5.13 导入任务表 `import_tasks`

### 用途

记录 Excel 导入过程与结果，便于排查失败原因。

### 字段设计

| 字段名 | 类型 | 说明 |
|---|---|---|
| id | bigint | 主键 |
| biz_type | varchar(30) | 导入业务类型：setup_list |
| biz_id | bigint | 关联业务 ID，可空 |
| file_name | varchar(255) | 导入文件名 |
| file_url | varchar(500) | 原文件地址 |
| status | varchar(30) | 导入状态 |
| total_count | integer | 总条数 |
| success_count | integer | 成功条数 |
| fail_count | integer | 失败条数 |
| error_message | text | 错误摘要 |
| operator_id | bigint | 操作人 |
| created_at | timestamp | 创建时间 |
| finished_at | timestamp | 完成时间 |

### 状态建议

- pending
- processing
- success
- partial_success
- failed

## 6. 关系与外键建议

建议在数据库层建立外键约束，至少覆盖以下关系：

- `project_members.project_id` -> `projects.id`
- `project_members.user_id` -> `users.id`
- `work_orders.project_id` -> `projects.id`
- `work_orders.assignee_id` -> `users.id`
- `work_order_logs.work_order_id` -> `work_orders.id`
- `setup_lists.project_id` -> `projects.id`
- `setup_list_items.setup_list_id` -> `setup_lists.id`
- `setup_list_items.assignee_id` -> `users.id`

如果考虑高并发写入、灵活迁移或历史数据导入，也可以在首期只做应用层约束，再逐步补充数据库强约束。

## 7. 推荐枚举字典

建议将以下字段沉淀为枚举或字典表：

- 项目状态
- 工单状态
- 工单类型
- 工单优先级
- 清单状态
- 清单项执行状态
- 导入任务状态

首期可采用字符串枚举，后期如需后台动态维护，再升级为字典表。

## 8. 推荐索引策略

重点查询场景：

- 按项目查询工单
- 按人员查询待办工单
- 按项目查询搭建清单和明细
- 按状态筛选执行中工单
- 按活动时间查询项目

建议优先添加以下索引：

- `projects(event_date)`
- `projects(manager_id, status)`
- `work_orders(project_id, status)`
- `work_orders(assignee_id, status)`
- `setup_lists(project_id)`
- `setup_list_items(setup_list_id, execute_status)`
- `attachments(biz_type, biz_id)`

## 9. 扩展设计建议

后续如果要扩展仓库与设备管理，可新增：

- 设备表 `equipment`
- 设备分类表 `equipment_categories`
- 仓库表 `warehouses`
- 出库单 / 入库单表
- 项目设备占用表

后续如果要扩展排期能力，可新增：

- 资源日历表
- 项目排班表
- 冲突检测记录表

## 10. 首期最小落地表

如果先做 MVP，建议优先开发以下表：

- `users`
- `roles`
- `user_roles`
- `projects`
- `project_members`
- `work_orders`
- `work_order_logs`
- `setup_lists`
- `setup_list_items`
- `attachments`
- `import_tasks`

## 11. 下一步建议

建议继续输出以下内容：

1. API 接口清单
2. Excel 导入模板规范
3. PostgreSQL 建表 SQL 初稿
4. Web 后台菜单与页面字段清单
