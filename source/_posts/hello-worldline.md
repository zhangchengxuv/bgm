---
title: 你好，世界线观测站：把个人博客升级到 zhangchenxu.uk
date: 2026-11-23 21:30:00
categories:
  - 随笔
tags:
  - Hexo
  - 个人博客
  - Bangumi
description: 从单纯的追番收藏页升级为综合个人博客，绑定独立域名 zhangchenxu.uk 并接入 Cloudflare 边缘加速。
---

经过一番折腾，「世界线观测站」正式拥有了自己的独立域名 **`zhangchenxu.uk`**，并从原来的单页追番列表升级为了一个综合的个人博客！

## 本次升级了什么？

1. **全新综合首页**：整合了站点实时观测数据（动画、书籍、游戏收藏数与 GitHub 贡献数）、最新文章卡片以及快捷导航入口。
2. **完整保留书影音收藏馆**：原有的拼音字母索引、无限滚动加载、作品详情页以及每日 06:17 的 Bangumi 自动同步机制全部保留在 [收藏馆](/collection/) 中。
3. **支持深色 / 浅色双主题切换**：点击右上角图标即可在「深空蓝」与「纸感浅色」之间自由切换。
4. **独立域名与全球加速**：通过 GitHub Pages + Cloudflare 边缘缓存加速，让页面与封面图都能快速打开。

## 接下来怎么写新文章？

只需要在本地仓库的 `source/_posts/` 目录下新建一个 `.md` 文件，写完后执行：

```bash
git add .
git commit -m "post: 新文章标题"
git push
```

GitHub Actions 就会自动构建并发布到 `https://zhangchenxu.uk`。故事未完，继续记录！
