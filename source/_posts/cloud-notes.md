---
title: 云端折腾手记：独立域名、Cloudflare 隧道与边缘加速实践
date: 2026-11-23 20:00:00
categories:
  - 技术笔记
tags:
  - Cloudflare
  - GitHub Pages
  - 网络优化
description: 记录一次从零配置独立域名、Cloudflare Tunnel 零端口暴露与静态博客边缘缓存的完整经验。
---

拥有一个自己的独立域名后，很多原本零散的个人服务都可以优雅地统一起来：

- **主站博客**：`zhangchenxu.uk` 指向 GitHub Pages，套上 Cloudflare 橙色云朵代理与边缘缓存规则，静态页面与封面图片秒开。
- **内网服务隐身**：通过 Cloudflare Tunnel（`cloudflared`），把服务器上的后台或工具接口映射到子域名，公网防火墙甚至无需开放对应端口，既美观又安全。
- **HTTPS 自动化**：全链路开启 `Full (Strict)`，无需手动操心证书续期。

## 踩过的一个小坑

在把仓库从 GitHub Pages 默认子路径 `/bgm/` 迁移到独立根域名 `zhangchenxu.uk` 时，如果构建脚本里写死了按 `GITHUB_REPOSITORY` 自动拼接 `root`，会导致样式表路径变成 `/bgm/css/style.css` 从而 404。

解决办法很简单：在 Hexo 的 `before_generate` 钩子里优先检测 `source/CNAME`，只要存在自定义域名，就自动将 `root` 锁定为 `/`，彻底一劳永逸。
