# 舞台租赁工单系统

面向舞台租赁公司的项目执行系统，覆盖项目管理、工单协同、搭建清单、移动端现场执行、审核流与附件留痕。

## 已实现模块

- 登录与角色权限：`admin` / `dispatcher` / `site`
- 项目模板与模板化建单
- 项目负责人 / 成员管理
- 工单创建 / 指派 / 审核人 / 审核流
- 搭建清单明细录入
- 清单 CSV 文本导入 / 文件导入 / 导出
- 移动端我的工单 / 现场执行 / 审核备注
- 附件上传 / 删除 / 查看
- 审计日志
- 后台统计看板 / 搜索 / 详情查看
- Docker 一键部署 / 启停 / 备份脚本

## 技术栈

- 后端：Node.js + Express + TypeScript
- 数据库：PostgreSQL
- 后台：React + Vite + TypeScript
- 移动端：React + Vite + TypeScript
- 部署：Docker Compose + Nginx

## 快速开始

```bash
cp .env.example .env
./scripts/start.sh
```

访问：

- 后台：`http://localhost:8080`
- 移动端：`http://localhost:8081`
- 后端：`http://localhost:3000`

## 默认账号

- 管理员：`admin / admin123`
- 调度：`dispatcher / dispatcher123`
- 现场：`site01 / site123`

## 常用脚本

```bash
./scripts/start.sh
./scripts/stop.sh
./scripts/restart.sh
./scripts/backup-db.sh
```

## 文档索引

- 部署说明：`docs/deployment/DEPLOY.md`
- 上线检查：`docs/deployment/GO-LIVE.md`
- Nginx 示例：`docs/deployment/NGINX_EXAMPLE.md`
- 演示流程：`docs/demo/DEMO_FLOW.md`
