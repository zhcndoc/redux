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

## Redux 官方教程

[**快速入门** 页面](./quick-start.md)简要介绍了如何搭建 Redux Toolkit + React 应用程序的基础知识，[**TypeScript 快速入门** 页面](./typescript.md)则展示了如何配置 Redux Toolkit 和 React 以支持 TypeScript。

我们有两个不同的完整教程：

- [**Redux Essentials 教程**](./essentials/part-1-overview-concepts) 是一个“自上而下”的教程，教授“如何以正确的方式使用 Redux”，采用我们最新推荐的 API 和最佳实践（逻辑部分使用 Redux Toolkit，UI 使用 React-Redux 钩子，以及用于数据获取和缓存的“RTK Query”）。
- [**Redux Fundamentals 教程**](./fundamentals/part-1-overview.md) 是一个“自下而上”的教程，从第一原理讲解“Redux 如何工作”，并解释为何存在标准的 Redux 使用模式。

:::tip

**我们推荐从 [Redux Essentials 教程](./essentials/part-1-overview-concepts) 开始学习**，因为它涵盖了如何使用我们现代 Redux Toolkit 包来编写实际应用程序的关键要点。

:::

## 其他资源

### 学习现代 Redux 直播

Redux 维护者 Mark Erikson 参加了 “Learn with Jason” 节目，讲解了我们当下推荐的 Redux 使用方式。该节目包含一个现场编码示例应用，展示了如何使用 Redux Toolkit 和 React-Redux 钩子配合 TypeScript，以及新的 RTK Query 数据获取 API：

<LiteYouTubeEmbed
    id="9zySeP5vH9c"
    title="Learn Modern Redux - Redux Toolkit, React-Redux Hooks, and RTK Query"
/>