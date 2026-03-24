# PostgreSQL 初始化说明

## 文件说明

- 建表脚本：`sql/postgresql/init.sql`

## 使用方式

### 1. 创建数据库

```sql
CREATE DATABASE stage_workflow;
```

### 2. 执行初始化脚本

```bash
psql -U your_user -d stage_workflow -f sql/postgresql/init.sql
```

## 当前包含内容

- 角色表
- 用户表
- 用户角色关系表
- 项目模板表
- 工单模板表
- 项目表
- 项目成员表
- 工单表
- 工单执行日志表
- 搭建清单表
- 搭建清单明细表
- 附件表
- 导入任务表
- 默认角色初始化数据

## 说明

- 当前版本面向 `MVP`
- `updated_at` 字段暂由应用层维护
- 后续可补充触发器、字典表、审计表、示例测试数据
