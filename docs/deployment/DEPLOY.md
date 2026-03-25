# 部署说明

## 服务组成

本项目包含 4 个部署单元：

- `postgres`：业务数据库
- `server`：后端 API 服务
- `admin-web`：后台管理前端
- `mobile-h5`：现场 H5 前端

## 本地 Docker 部署

### 前提

- 已安装 Docker
- 已安装 Docker Compose

### 启动命令

```bash
docker compose up --build -d
```

### 访问地址

- 后端 API：`http://localhost:3000`
- 后台管理：`http://localhost:8080`
- 手机 H5：`http://localhost:8081`
- 数据库：`localhost:5432`

### 停止命令

```bash
docker compose down
```

### 清理数据卷

```bash
docker compose down -v
```

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
- 使用进程管理工具运行后端，如 `pm2` 或容器编排
- 将数据库放到独立主机或托管数据库服务
- 配置 HTTPS 和反向代理
- 将 `CORS_ORIGINS` 改为正式域名列表

## 环境变量

### `server`

- `PORT`
- `DATABASE_URL`
- `CORS_ORIGINS`

### `admin-web` / `mobile-h5`

- `VITE_API_BASE_URL`

## 当前可部署结论

当前版本已经具备以下部署条件：

- 后端可构建并启动
- 前端后台可构建静态产物
- 手机 H5 可构建静态产物
- 数据库初始化 SQL 已提供
- Docker 部署文件已提供
