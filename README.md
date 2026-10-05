# 素屿札记

独立静态博客，复古刊物设计。首页、索引、文章和关于页均为构建时生成的 HTML。当前文章为演示稿，不包含作者真实文章，不使用游戏素材。

## 本地预览

Node.js 22+。无 npm 依赖。

```sh
npm test
npm run build
npm run dev
```

访问 http://127.0.0.1:4175 。源代码修改后重新 build。

## 隐藏书房

连续点击刊名中的「屿」字五次；每次间隔不得超过 1.2 秒，点击别处会重置。没有入口文案、点击高光或进度提示。手机同样连点，键盘可聚焦后按五次 Enter。演示暗号：**雨停之后**。
AES-GCM 加密标题、摘要和正文，PBKDF2 SHA-256 310000 次派生。解锁状态仅在当前页面内存，刷新或点击「锁定」即清除。演示密钥是公开谜底，不是敏感数据保险箱。

正式私人稿保存在公开仓库之外，JSON 数组格式与 data/posts.json 相同，id 使用独立名称（如 private-01）。PowerShell 设置环境变量 BLOG_PASSPHRASE 后执行 `node scripts/seal.mjs <外部文件路径>`，随后移除该环境变量并重新 build。不要把原文提交到公开 Issue 或 Git 历史。

## 公开文章与部署

本地编辑 data/posts.json；当前正文支持段落、## 二级标题、> 引文，其他 Markdown 会作为安全文本展示。尚不支持图片、列表、链接和代码块的富文本解析。

把本目录作为独立仓库（默认分支 main），Settings → Pages → Source 选择 GitHub Actions。工作流通过 configure-pages 读取实际站点地址并传给构建器，自动适配 `username.github.io/repository/` 仓库子路径。site.json 的 URL 仅作为本地构建默认值。无须服务器、数据库或路由重写。

工作流仅收录仓库所有者创建、标题以 `[POST] ` 开头的打开状态 Issue；分类取第一个标签。按创建时间从新到旧排列，最新一篇自动成为首页主推，接下来两篇为次推，其余文章进入精简列表。编辑、关闭、重开、删除或修改标签都会触发重建。关闭的文章文件会从输出中移除。

读取 API 失败时终止部署，不以示例稿覆盖线上内容。搜索、RSS、sitemap 仅包含公开文章。私人内容通过本地加密文件更新。

本轮没有执行远端部署，GitHub Actions 的实际运行仍待仓库部署验证。构建产物：`index.html`、`archive/index.html`、`about/index.html`、`posts/<id>/index.html`、`404.html`、`feed.xml`、`sitemap.xml`。公开文章在关闭 JavaScript 时也可阅读与导航。旧版 `#post/<id>` 地址自动迁移到独立文章地址。隐藏手记继续在当前页面解密后通过片段地址切换，刷新、锁定或离开文档后需重新解锁。

## 动态档案版本

原创雨夜城市 SVG、CSS 落雨与灯光、鼠标景深纸张拼贴、旋转档案轨迹、循环胶片、滚动进入、桌面悬停展开文章。手机采用触摸友好布局，减少动态偏好关闭持续动画与视差，后台暂停 CSS 动画。

验收命令（先 build，测试自动启动临时静态服务器）：`node tests/atmosphere.mjs`、`node tests/browser.mjs`、`node tests/edge-cases.mjs`。浏览器脚本当前使用本机 Playwright 路径，覆盖根路径和 `/sovue-blog/` 子路径；`npm test` 不依赖浏览器，可在 GitHub Actions 运行。
