---
id: api-reference
title: API 参考
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

# API Reference

本节记录了 Redux 核心 API。Redux 核心较小——它定义了一组供你实现的契约（例如 [reducers](../understanding/thinking-in-redux/Glossary.md#reducer)），并提供了一些辅助函数来将这些契约结合起来。

<CoreApiNote />

Redux Toolkit re-exports all of the APIs included in the `redux` package, so you don't need to install `redux` separately. The original [`createStore`](createStore.md) method is deprecated in favor of `configureStore`, but will continue to work indefinitely.

For the APIs you'll use day to day, see the [Redux Toolkit API docs](/toolkit) and the [React-Redux API docs](/react-redux).

## 顶层导出

- [createStore(reducer, preloadedState?, enhancer?)](createStore.md)
- [combineReducers(reducers)](combineReducers.md)
- [applyMiddleware(...middlewares)](applyMiddleware.md)
- [bindActionCreators(actionCreators, dispatch)](bindActionCreators.md)
- [compose(...functions)](compose.md)
- [Utility functions](utils.md): `isAction`, `isPlainObject`

## Store API

- [Store](Store.md)
  - [getState()](Store.md#getstate)
  - [dispatch(action)](Store.md#dispatchaction)
  - [subscribe(listener)](Store.md#subscribelistener)
  - [replaceReducer(nextReducer)](Store.md#replacereducernextreducer)