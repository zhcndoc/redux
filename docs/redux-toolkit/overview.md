---
id: overview
title: 'Redux Toolkit：概述'
description: 'Redux Toolkit 是编写 Redux 逻辑的推荐方式'
hide_title: true
---

## 什么是 Redux Toolkit？

**[Redux Toolkit](https://redux-toolkit.js.org)** 是我们官方的、有明确设计意图、内置丰富功能的高效 Redux 开发工具集。它旨在作为编写 Redux 逻辑的标准方式，我们强烈推荐你使用它。

它包含多个简化常见 Redux 用例的实用函数，包括商店配置、reducer 定义、不可变更新逻辑，甚至可以一次性创建完整的状态“切片”，无需手动编写任何 action 创建函数或 action 类型。它还集成了最常用的 Redux 附加库，如用于异步逻辑的 Redux Thunk 和用于编写 selector 函数的 Reselect，让你能够即刻使用它们。

### 安装

Redux Toolkit 作为一个 NPM 包提供，可用于模块打包器或 Node 应用：

```bash
# NPM
npm install @reduxjs/toolkit

# Yarn
yarn add @reduxjs/toolkit
```

## 目的

Redux 核心库故意保持无主见。它允许你自行决定如何处理一切，比如商店配置、状态包含的内容、以及如何构建 reducer。

这种设计在某些情况下很有用，因为它提供了灵活性，但这种灵活性并非总是必要的。有时我们只想用最简单的方式开始，带有一些良好的默认行为。或者，也许你正在编写一个较大的应用，发现自己写了很多相似代码，希望能减少手写代码的量。

**Redux Toolkit** 最初是为了帮助解决 Redux 的三个普遍问题：

- “配置 Redux 商店太复杂”
- “我必须添加许多包才能让 Redux 做有用的事”
- “Redux 需要太多样板代码”

我们无法解决所有用例，但秉承 [`create-react-app`](https://github.com/facebook/create-react-app) 和 [`apollo-boost`](https://www.apollographql.com/blog/announcement/frontend/zero-config-graphql-state-management/) 的精神，我们提供一套官方推荐的工具，处理最常见的用例，并减少额外决策的需要。

## 你为什么应该使用 Redux Toolkit

**Redux Toolkit** 让编写优秀的 Redux 应用更容易，开发更高效，因为它内置了我们的最佳实践，提供良好的默认行为，帮助捕获错误，并允许你编写更简洁的代码。无论技能水平或经验如何，Redux Toolkit 对所有 Redux 用户**都有益**。它可以用于新项目启动时，也可以作为现有项目逐步迁移的一部分。

请注意，**使用 Redux 并不 _强制_ 要用 Redux Toolkit**。许多现有应用使用其他 Redux 封装库，或者“手写”所有 Redux 逻辑，如果你仍然偏好其他方式，也没问题！

但是，[**我们强烈推荐所有 Redux 应用使用 Redux Toolkit**](../style-guide/style-guide.md#use-redux-toolkit-for-writing-redux-logic)。

总的来说，无论你是 Redux 新手搭建第一个项目，还是有经验的用户想简化已有应用，**使用 Redux Toolkit 都会使你的代码更加优秀且易于维护**。

## 包含内容

Redux Toolkit 包括：

- [`configureStore()`](https://redux-toolkit.js.org/api/configureStore)：封装了 `createStore`，提供简化的配置选项和良好默认。它可以自动合并切片 reducer，添加你提供的 Redux 中间件，默认包含 `redux-thunk`，并启用 Redux DevTools 扩展支持。
- [`createReducer()`](https://redux-toolkit.js.org/api/createReducer)：允许你提供一个动作类型到 case reducer 函数的查找表，避免写 switch 语句。此外，它自动使用 [`immer` 库](https://github.com/immerjs/immer)，让你使用正常的可变代码（如 `state.todos[3].completed = true`）来编写更简单的不可变更新。
- [`createAction()`](https://redux-toolkit.js.org/api/createAction)：为给定的 action 类型字符串生成 action 创建函数。函数自带定义的 `toString()`，能直接用作类型常量。
- [`createSlice()`](https://redux-toolkit.js.org/api/createSlice)：接受一个 reducer 函数对象、切片名称和初始状态值，自动生成带对应 action 创建函数和 action 类型的切片 reducer。
- [`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk)：接受一个 action 类型字符串和返回 Promise 的函数，生成一个 thunk，根据该 Promise 分别派发 `pending/fulfilled/rejected` action 类型。
- [`createEntityAdapter`](https://redux-toolkit.js.org/api/createEntityAdapter)：生成一组可重用的 reducer 和 selector，用于在 store 中管理规范化数据。
- 重新导出自 [Reselect](https://github.com/reduxjs/reselect) 库的 [`createSelector` 工具](https://redux-toolkit.js.org/api/createSelector)，方便使用。

Redux Toolkit 还有 [**RTK Query 数据获取 API**](https://redux-toolkit.js.org/rtk-query/overview)。RTK Query 是专门为 Redux 构建的强大数据获取和缓存工具，旨在简化 Web 应用中数据加载的常见场景，消除手写数据获取和缓存逻辑的需求。

## 文档

完整的 Redux Toolkit 文档可访问 **[https://redux-toolkit.js.org](https://redux-toolkit.js.org)**。