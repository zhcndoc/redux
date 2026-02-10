---
id: api-reference
title: API 参考
---

# API 参考

本节记录了 Redux 核心 API。Redux 核心较小——它定义了一组供你实现的契约（例如 [reducers](../understanding/thinking-in-redux/Glossary.md#reducer)），并提供了一些辅助函数来将这些契约结合起来。

**实际上，你不会直接使用 Redux 核心。** [**Redux Toolkit**](https://redux-toolkit.js.org) 是我们推荐的官方编写 Redux 逻辑的方法。它围绕 Redux 核心进行封装，包含了我们认为构建 Redux 应用必需的包和函数。Redux Toolkit 内置了我们的最佳实践，简化了大多数 Redux 任务，避免常见错误，且让编写 Redux 应用变得更简单。此外，[**React-Redux**](https://react-redux.js.org) 让你的 React 组件能够与 Redux store 交互。

请查看它们的 API 文档：

- https://redux-toolkit.js.org/
- https://react-redux.js.org/

:::danger

**原生 Redux 核心的 `createStore` 方法已被弃用！**

`createStore` 将继续无限期工作，但我们不建议直接使用 `createStore` 或原先的 `redux` 包。

你应当改用我们官方 [Redux Toolkit](https://redux-toolkit.js.org) 包中的 [ `configureStore` 方法](https://redux-toolkit.js.org/api/configureStore)，该方法封装了 `createStore`，提供了更好的默认配置和设置方式。编写 reducer 逻辑时，也应使用 Redux Toolkit 的 [`createSlice` 方法](https://redux-toolkit.js.org/api/createSlice)。

Redux Toolkit 还重新导出了 `redux` 包中包含的所有其他 API。

详见[**迁移到现代 Redux**页面](../usage/migrating-to-modern-redux.mdx)，了解如何将现有的旧版 Redux 代码库升级到使用 Redux Toolkit。

:::

## 顶层导出

- [createStore(reducer, preloadedState?, enhancer?)](createStore.md)
- [combineReducers(reducers)](combineReducers.md)
- [applyMiddleware(...middlewares)](applyMiddleware.md)
- [bindActionCreators(actionCreators, dispatch)](bindActionCreators.md)
- [compose(...functions)](compose.md)

## Store API

- [Store](Store.md)
  - [getState()](Store.md#getstate)
  - [dispatch(action)](Store.md#dispatchaction)
  - [subscribe(listener)](Store.md#subscribelistener)
  - [replaceReducer(nextReducer)](Store.md#replacereducernextreducer)