# 独立页面与内容层级

用户已确认：GitHub Pages + Issues；最新文章自动主推；首页、索引、文章、关于独立页面；常驻导航、当前标记、面包屑、明显返回按钮，维持雨夜复古视觉。

实现与验收顺序：
1. tests/site.test.mjs 先验证静态文件、无 JS 正文、首页排序与分层、仓库子路径、Issue 作者/状态/分页/API 错误。
2. assets/views.js 共用安全 HTML 渲染；scripts/templates.mjs 生成首页/索引/文章/关于；index.html 变为带 root/page/nav 占位符的外壳。
3. scripts/issues.mjs 保留 GitHub Issue 数据源，scripts/build.mjs 输出真正的静态 HTML、RSS、sitemap。构建到隔离暂存目录，发布前替换旧 dist，确保关闭文章不会遗留页面。
4. assets/app.js 只负责主题、索引筛选、五击解锁与内存中的隐藏手记，公开内容不再依赖 hash 路由。旧公开 hash 链接迁移到独立地址。
5. assets/navigation.css 缩短首页氛围区；一主两次、其余文章精简列表；sticky 导航、文章路径、顶部与底部返回。
6. 浏览器验证根路径与 /sovue-blog/ 仓库子路径、直接访问和刷新文章、浏览器返回与分类保留、无 JS 浏览、手机、暗色、五击/解密/锁定、无溢出和 404 资源。

不部署远端，先交付本地可审阅页面。隐藏原文继续只在解密后进入浏览器内存，不进入 HTML/RSS/索引。

## 完成与验证 · 2026-09-27

- 全部实现步骤完成。公开 HTML 包含完整正文，客户端只增强搜索、主题和动效；隐藏内容仍按原约定在内存中解密。
- 首页采用最新一篇主推、两篇次推及不重复的精简列表；胶片和编者按移至内容后方。手机优先显示文章推荐。
- GitHub Actions 从 configure-pages 获取实际 base_url；生成链接兼容项目仓库子路径，无须服务器路由重写。
- `npm test`：5 项通过，涵盖加密、五击、静态页面、清理下架文章、Issue 分页和作者权限过滤、API 失败终止。
- `tests/browser.mjs`：1440px/390px，/sovue-blog/ 子路径的直接文章访问、刷新、面包屑、返回按钮、固定导航、分类与浏览器返回、主题、深层文章页解锁与锁定全部通过；无脚本错误或资源 404。独立浏览器进程验证无 JavaScript 的文章/索引/首页阅读及导航通过。
- `tests/edge-cases.mjs`：旧 hash 地址跳转、跳到正文、隐藏区刷新锁定、公开搜索隔离及 320/768/1280px 无溢出通过。
- `tests/atmosphere.mjs`：桌面/手机五击、点击超时重置、无选区高光、景深和滚动位移、卡片展开、减少动态偏好通过。
- `tests/filter-browser.mjs`：修复搜索“全部”被误当作分类清除的问题，回归通过。
- 已查看 docs/qa/multipage 下的桌面和手机首页、文章页截图。完整报告为 docs/qa/multipage/report.json。
- GitHub Actions 文件已配置，但未上传仓库、未远端部署；线上构建结果不在本轮验收范围。
