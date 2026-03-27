# Nginx / HTTPS 配置示例

以下为示意配置，请按实际域名调整：

- 后台：`admin.example.com`
- 移动端：`m.example.com`
- API：`api.example.com`

## API 反向代理示例

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 后台站点示例

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /var/www/stage-workflow/admin-web;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

## 移动端站点示例

```nginx
server {
    listen 80;
    server_name m.example.com;

    root /var/www/stage-workflow/mobile-h5;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

## HTTPS 建议

- 推荐使用 Let's Encrypt / Certbot
- 正式环境统一跳转 HTTPS
- 上传附件目录建议限制访问策略或做鉴权下载
