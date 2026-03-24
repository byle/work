# Server

后端服务骨架，当前已包含基础应用入口、统一响应结构，以及认证与项目模块雏形。

## 当前目录

- `src/app.ts`：应用装配入口
- `src/index.ts`：服务启动入口
- `src/config`：环境变量配置
- `src/db`：数据库连接
- `src/shared`：通用能力
- `src/modules/auth`：认证模块
- `src/modules/project`：项目模块

## 环境变量

- `PORT`：服务端口
- `DATABASE_URL`：`PostgreSQL` 连接串

可参考 `server/.env.example`

## 启动方式

```bash
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
cd /Users/fengmianke/Documents/work
pnpm --filter server dev
```

## 下一步规划

- 增加工单模块、搭建清单模块、导入模块
- 增加参数校验、中间件、错误处理
- 增加数据库迁移与种子数据
