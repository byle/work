# 部署说明

## 服务组成

本项目包含 4 个部署单元：

- `postgres`：业务数据库
- `server`：后端 API 服务
- `admin-web`：后台管理前端
- `mobile-h5`：现场 H5 前端

## 推荐目录

- 根目录环境变量模板：`.env.example`
- 本地上传附件目录：`uploads/`
- 备份输出目录：`deploy/backup/`
- 一键脚本目录：`scripts/`

## 一键启动

### 前提

- 已安装 Docker Desktop / Docker Engine
- 已安装 Docker Compose

### 首次使用

```bash
cp .env.example .env
```

按需修改以下变量：

- `POSTGRES_PASSWORD`
- `SERVER_PORT`
- `ADMIN_WEB_PORT`
- `MOBILE_H5_PORT`
- `CORS_ORIGINS`
- `VITE_API_BASE_URL`

### 启动

```bash
./scripts/start.sh
```

### 停止

```bash
./scripts/stop.sh
```

### 重启

```bash
./scripts/restart.sh
```

### 访问地址

- 后端 API：`http://localhost:3000`
- 后台管理：`http://localhost:8080`
- 手机 H5：`http://localhost:8081`
- 数据库：`localhost:5432`

## 数据备份

### 备份 PostgreSQL

```bash
./scripts/backup-db.sh
```

备份文件输出到：`deploy/backup/`

## 手动部署

### 1. 数据库

创建数据库并导入：

```bash
createdb stage_workflow
psql -d stage_workflow -f sql/postgresql/init.sql
```

### 2. 后端

```bash
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
pnpm install
cp server/.env.example server/.env
pnpm --filter server build
pnpm --filter server start
```

### 3. 前端后台

```bash
export VITE_API_BASE_URL=http://your-server-host:3000
pnpm --filter admin-web build
```

构建产物目录：`apps/admin-web/dist`

### 4. 手机 H5

```bash
export VITE_API_BASE_URL=http://your-server-host:3000
pnpm --filter mobile-h5 build
```

构建产物目录：`apps/mobile-h5/dist`

## 生产环境建议

- 使用 Nginx 托管前端静态资源
- 使用容器编排或进程管理工具运行后端
- 将数据库放到独立主机或托管数据库服务
- 配置 HTTPS 和反向代理域名
- 定期执行 `./scripts/backup-db.sh`
- 对 `uploads/` 目录做磁盘备份
- 将 `CORS_ORIGINS` 改为正式域名列表
- 建议把附件目录挂载到持久卷或对象存储

## 环境变量

### 根目录 `.env`

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `SERVER_PORT`
- `ADMIN_WEB_PORT`
- `MOBILE_H5_PORT`
- `CORS_ORIGINS`
- `VITE_API_BASE_URL`
- `DATABASE_URL`（手动部署时可用）

### `server/.env`

- `PORT`
- `DATABASE_URL`
- `CORS_ORIGINS`

## 当前可部署结论

当前版本已具备以下上线前条件：

- 后端可构建并启动
- 后台与手机 H5 可构建静态资源
- PostgreSQL 初始化 SQL 已提供
- Docker Compose 部署文件已参数化
- 上传附件目录已挂载持久卷路径
- 一键启停与备份脚本已提供
- 审计日志、附件、工单审核流已可用
