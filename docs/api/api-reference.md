---
id: api-reference
title: API 参考
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

# API 参考

本节记录了 Redux 核心 API。Redux 核心较小——它定义了一组供你实现的契约（例如 [reducers](../understanding/thinking-in-redux/Glossary.md#reducer)），并提供了一些辅助函数来将这些契约结合起来。

<CoreApiNote />

Redux Toolkit 重新导出了 `redux` 包中的所有 API，因此无需单独安装 `redux`。原始的 [`createStore`](createStore.md) 方法已弃用，推荐改用 `configureStore`，但它仍会继续工作。

日常开发中会用到的 API，请参阅 [Redux Toolkit API 文档](/toolkit)和 [React-Redux API 文档](/react-redux)。

## 顶层导出

- [createStore(reducer, preloadedState?, enhancer?)](createStore.md)
- [combineReducers(reducers)](combineReducers.md)
- [applyMiddleware(...middlewares)](applyMiddleware.md)
- [bindActionCreators(actionCreators, dispatch)](bindActionCreators.md)
- [compose(...functions)](compose.md)
- [实用工具函数](utils.md)：`isAction`、`isPlainObject`

## Store API

- [Store](Store.md)
  - [getState()](Store.md#getstate)
  - [dispatch(action)](Store.md#dispatchaction)
  - [subscribe(listener)](Store.md#subscribelistener)
  - [replaceReducer(nextReducer)](Store.md#replacereducernextreducer)
