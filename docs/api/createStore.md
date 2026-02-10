---
id: createstore
title: createStore
hide_title: true
description: 'API > createStore：创建核心 Redux 存储'
---

&nbsp;

# `createStore(reducer, preloadedState?, enhancer?)`

创建一个 Redux [store](Store.md)，它保存应用的完整状态树。
应用中应该只有一个 store。

:::danger

**原始的 Redux 核心 `createStore` 方法已被弃用！**

`createStore` 会一直保持可用，但我们不建议直接使用 `createStore` 或原始的 `redux` 包。

相反，你应该使用我们官方 [Redux Toolkit](https://redux-toolkit.js.org) 包中的 [ `configureStore` 方法](https://redux-toolkit.js.org/api/configureStore)，它对 `createStore` 进行了封装，提供了更好的默认配置和使用方式。你还应该使用 Redux Toolkit 的 [`createSlice` 方法](https://redux-toolkit.js.org/api/createSlice) 来编写 reducer 逻辑。

Redux Toolkit 还重新导出 `redux` 包中包含的所有其他 API。

有关如何将现有的旧版 Redux 代码库迁移为使用 Redux Toolkit，请参见 [**迁移到现代 Redux** 页面](../usage/migrating-to-modern-redux.mdx)。

:::

## 参数

1. `reducer` _(函数)_: 一个根 [reducer 函数](../understanding/thinking-in-redux/Glossary.md#reducer)，它根据当前状态树和需要处理的 [action](../understanding/thinking-in-redux/Glossary.md#action) 返回下一个 [状态树](../understanding/thinking-in-redux/Glossary.md#state)。

2. [`preloadedState`] _(任意类型)_: 初始化状态。你可以选择性地指定它，用于在通用应用中从服务器端预加载状态，或恢复之前序列化的用户会话。如果你的 `reducer` 是通过 [`combineReducers`](combineReducers.md) 生成的，那么这个参数必须是一个与传给 `combineReducers` 的键具有相同结构的普通对象。否则，你可以传递任何你的 `reducer` 可以理解的内容。

3. [`enhancer`] _(函数)_: store 增强器。你可以选择性地指定它，用于增强 store 的第三方功能，比如中间件、时间旅行、持久化等。Redux 内置的唯一 store 增强器是 [`applyMiddleware()`](./applyMiddleware.md)。

#### 返回值

([_`Store`_](Store.md)): 一个保存应用完整状态的对象。改变状态的唯一方式是通过 [分发 actions](Store.md#dispatchaction)。你也可以 [订阅](Store.md#subscribelistener) 状态的变化以更新 UI。

#### 示例

```js
import { createStore } from 'redux'

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}

const store = createStore(todos, ['Use Redux'])

store.dispatch({
  type: 'ADD_TODO',
  text: 'Read the docs'
})

console.log(store.getState())
// [ 'Use Redux', 'Read the docs' ]
```

## 弃用及替代的 `legacy_createStore` 导出

在 [Redux 4.2.0 中，我们将原始的 `createStore` 方法标注为 `@deprecated`](https://github.com/reduxjs/redux/releases/tag/v4.2.0)。严格来说，**这并不是一次破坏性变更，且并非 5.0 新增的内容，但这里为了完整性进行说明。**

**此弃用仅作为一个 _视觉_ 提示，意在鼓励用户[从传统 Redux 模式迁移到现代 Redux Toolkit API](https://redux.js.org/usage/migrating-to-modern-redux)**。弃用标记会导致导入并使用时出现 ~~`createStore`~~ 的删除线，但 _不会_ 产生运行时错误或警告。

**`createStore` 会无限期持续工作，且 _不会_ 被移除**。但我们目前希望 _所有_ Redux 用户能够使用 Redux Toolkit 来编写所有 Redux 逻辑。

解决方案有三种：

- **[强烈建议改用 Redux Toolkit 和 `configureStore`](../usage/migrating-to-modern-redux.mdx)**
- 什么也不做。那只是一个视觉删除线，不影响代码的运行。忽略它即可。
- 切换至使用现在导出的 `legacy_createStore` API，它功能相同但没有 `@deprecated` 标签。最简单的方法是通过别名导入，比如 `import { legacy_createStore as createStore } from 'redux'`。

## 提示

- 不要在应用中创建多个 store！而是使用 [`combineReducers`](combineReducers.md) 将多个 reducer 组合成一个根 reducer。

- Redux 的状态通常是普通的 JS 对象和数组。

- 如果你的状态是一个普通对象，确保永远不要直接修改它！不可变更新需要拷贝每一层数据，通常使用对象展开运算符 ( `return { ...state, ...newData }` )。

- 对于运行在服务器上的通用应用，每个请求都应创建一个 store 实例以实现隔离。向 store 实例分发几个获取数据的 action，并等待它们完成后再在服务器端渲染应用。

- 当 store 被创建时，Redux 会向 reducer 发送一个虚拟的 action 用以初始化状态。你不需要直接处理该虚拟 action。只需确保你的 reducer 在接收到 `undefined` 状态时返回某个初始的状态即可。

- 要应用多个 store 增强器，可以使用 [`compose()`](./compose.md)。
