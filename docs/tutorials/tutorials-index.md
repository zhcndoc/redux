---
id: tutorials-index
slug: index
title: 'Redux 教程索引'
sidebar_label: '教程索引'
description: 'Redux 教程页面概览'
---

import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

# Redux 教程索引

本页是 Redux、Redux Toolkit 和 React-Redux 官方教程的统一索引。本网站的 Redux Toolkit 和 React-Redux 部分包含简短的快速开始页面；完整教程集中在此处，避免同一个概念被重复讲解。

<a id="quick-starts"></a>
## 快速开始

快速开始教程介绍了运行基础示例的最快方式，每篇只需几分钟。

- [**快速开始**](./quick-start.md)页面介绍如何在 React + TypeScript 应用中添加 Redux Toolkit 和 React-Redux、配置 counter slice，以及如何推断 `RootState` 和 `AppDispatch` 类型并定义预设类型 hooks。最后还简要介绍了纯 JavaScript 项目中可以省略的步骤。
- [**RTK Query 快速开始**](/toolkit/tutorials/rtk-query)介绍如何定义 API slice，并使用自动生成的 React hooks 获取数据。
- 如果你使用 Next.js，请参阅[**Next.js 配置指南**](../usage/nextjs.mdx)，了解如何为每个请求创建 store 并将其提供给 App Router。

<a id="full-tutorials"></a>
## 完整教程

我们有两个不同的完整教程：

- [**Redux Essentials 教程**](./essentials/part-1-overview-concepts)是一个“自顶向下”的教程，使用最新推荐的 API 和最佳实践，介绍“如何正确使用 Redux”（用 Redux Toolkit 编写逻辑、用 React-Redux hooks 构建 UI、用 RTK Query 获取和缓存数据）。教程会构建一个接近真实场景的示例应用，并在过程中讲解 Redux 概念。
- [**Redux Fundamentals 教程**](./fundamentals/part-1-overview.md)是一个“自底向上”的教程，不依赖任何抽象，从基础原理讲解“Redux 如何工作”以及为什么会有标准 Redux 使用模式。最后会展示 Redux Toolkit 如何简化这些模式。

:::tip

**我们推荐从 [Redux Essentials 教程](./essentials/part-1-overview-concepts) 开始学习**，因为它涵盖了如何使用我们现代 Redux Toolkit 包来编写实际应用程序的关键要点。

如果你想了解 Redux Toolkit 的 API 在底层替你完成了什么，以及我们为何推荐 RTK，可以接着阅读 Redux Fundamentals 教程。

:::

<a id="migrating-existing-redux-code-to-redux-toolkit"></a>
## 将现有 Redux 代码迁移到 Redux Toolkit

如果你已经了解 Redux，并想改造现有应用，可以阅读 [Redux Fundamentals 教程中的**“使用 Redux Toolkit 编写现代 Redux”页面**](./fundamentals/part-8-modern-redux.md)，了解 RTK API 如何简化 Redux 使用模式，以及如何完成迁移。[**迁移到现代 Redux**指南](../usage/migrating-to-modern-redux.mdx)会更深入地介绍如何改造各种旧版 Redux 代码，包括 store 配置、reducer、thunk、saga 和 `connect`。

<a id="using-typescript"></a>
## 使用 TypeScript

[**TypeScript 使用指南**](../usage/UsageWithTypescript.md)介绍 Redux store、hooks、reducer、thunk 和 middleware 的标准类型模式。[Redux Toolkit TypeScript 页面](/toolkit/usage/usage-with-typescript)记录了各 RTK API 的具体 TS 行为；[Vite 的 Redux + TypeScript 模板](https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux)则已预先配置好这些模式。

## Video Resources

### 学习现代 Redux 直播

Redux 维护者 Mark Erikson 做客“Learn with Jason”节目，介绍我们如今推荐的 Redux 用法。节目通过现场编写示例应用，展示如何结合 TypeScript 使用 Redux Toolkit 和 React-Redux hooks，以及 RTK Query 数据获取 API。

文字稿和示例应用源码链接请参阅[“Learn Modern Redux”节目说明页](https://www.learnwithjason.dev/let-s-learn-modern-redux)。

<LiteYouTubeEmbed
    id="9zySeP5vH9c"
    title="学习现代 Redux：Redux Toolkit、React-Redux Hooks 和 RTK Query"
/>

<a id="rtk-query-video-course"></a>
### RTK Query 视频课程

如果你更喜欢视频课程，可以在 Egghead 免费[观看 RTK Query 创建者 Lenz Weber-Tronic 的 RTK Query 视频课程](https://egghead.io/courses/rtk-query-basics-query-endpoints-data-flow-and-typescript-57ea3c43?af=7pnhj6)，也可以直接在此查看第一课：

<div style={{position:"relative",paddingTop:"56.25%"}}>
  <iframe
    src="https://app.egghead.io/lessons/redux-course-introduction-and-application-walk-through-for-rtk-query-basics/embed?af=7pnhj6"
    title="Egghead 上的 RTK Query 视频课程：RTK Query 基础课程介绍和应用演示"
    frameborder="0"
    allowfullscreen
    style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}
  ></iframe>
</div>

更多录制演讲和课程请参阅[视频](./videos.md)页面。

<a id="legacy-redux-toolkit-tutorials"></a>
## 旧版 Redux Toolkit 教程

Redux Toolkit 文档以前有一组“基础 / 中级 / 高级”教程。后来这些教程被上面的 Essentials 和 Fundamentals 教程取代。如果想查看旧教程，其内容文件仍保留在仓库历史中：

[Redux Toolkit 仓库：旧版“基础 / 中级 / 高级”教程文件](https://github.com/reduxjs/redux-toolkit/tree/e85eb17b39/docs/tutorials)
