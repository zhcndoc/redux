---
id: reducers
title: Reducer（状态更新函数）
sidebar_label: Reducer（状态更新函数）
---

## Redux 常见问题：Reducer（状态更新函数）

### 如何在两个 reducer 之间共享状态？我必须使用 `combineReducers` 吗？

Redux 存储推荐的结构是通过键将状态对象拆分成多个“切片”或“领域”，并为每个单独的数据切片提供一个 reducer 函数来管理。这类似于标准 Flux 模式中有多个独立的 store，Redux 提供了 [`combineReducers`](../api/combineReducers.md) 工具函数来简化这种模式的使用。然而，需要注意的是，`combineReducers` 并**非**必需 —— 它只是一个用于常见用例的辅助函数，即每个状态切片对应一个 reducer 函数，数据使用普通的 JavaScript 对象。

许多用户后来希望尝试在两个 reducer 之间共享数据，但发现 `combineReducers` 并不支持这样做。有几种解决方法：

- 如果一个 reducer 需要了解其他状态切片的数据，可能需要重新组织状态树结构，让单个 reducer 处理更多的数据。
- 你可能需要编写一些自定义函数来处理部分动作，这可能需要用你自己的顶层 reducer 函数替代 `combineReducers`。你也可以使用像 [reduce-reducers](https://github.com/acdlite/reduce-reducers) 这样的工具，先用 `combineReducers` 处理大部分动作，同时针对跨状态切片的特定动作运行更专门的 reducer。
- 带异步逻辑的[中间件](../tutorials/fundamentals/part-4-store.md#middleware)，例如 [redux-thunk](https://github.com/reduxjs/redux-thunk)，可以通过 `getState()` 访问整个状态。一个 action 创建者可以从状态中检索额外数据并放进 action 中，使各个 reducer 拥有足够信息来更新自己的状态切片。

总的来说，记住 reducer 只是函数 —— 你可以按任何方式组织和细分它们，推荐将它们拆分为更小的、可复用的函数（“reducer 组合”）。在拆分的过程中，如果子 reducer 需要额外数据计算下一状态，你可以从父 reducer 传入自定义的第三个参数。只需确保它们共同遵守 reducer 的基本规则：`(state, action) => newState`，并且以不可变方式更新状态，而不是直接修改。

#### 进一步信息

**文档**

- [API: combineReducers](../api/combineReducers.md)
- [使用 Redux：构建 Reducer 结构](../usage/structuring-reducers/StructuringReducers.md)

**讨论**

- [#601: 当一个动作涉及多个 reducer 时，对 combineReducers 的担忧](https://github.com/reduxjs/redux/issues/601)
- [#1400: 将顶层状态对象传给分支 reducer 是一种反模式吗？](https://github.com/reduxjs/redux/issues/1400)
- [Stack Overflow：使用 combineReducers 时如何访问状态的其他部分？](https://stackoverflow.com/questions/34333979/accessing-other-parts-of-the-state-when-using-combined-reducers)
- [Stack Overflow：用 redux combineReducers 简化整个子树的 reducer](https://stackoverflow.com/questions/34427851/reducing-an-entire-subtree-with-redux-combinereducers)
- [Redux Reducer 之间共享状态](https://invalidpatent.wordpress.com/2016/02/18/sharing-state-between-redux-reducers/)

### 我必须使用 `switch` 语句来处理动作吗？

不必。你可以用任何你喜欢的方法在 reducer 中响应动作。`switch` 语句是最常见的做法，但使用 `if` 语句、函数查找表，或者创建一个抽象函数来封装这部分逻辑都是可以的。事实上，虽然 Redux 要求 action 对象包含一个 `type` 字段，但你的 reducer 逻辑甚至不必依赖它来处理动作。话虽如此，标准做法确实是基于 `type` 使用 switch 语句或查找表。

#### 进一步信息

**文档**

- [使用 Redux：简化样板代码](../usage/ReducingBoilerplate.md)
- [使用 Redux：构建 Reducer 结构 - 拆分 Reducer 逻辑](../usage/structuring-reducers/SplittingReducerLogic.md)

**讨论**

- [#883: 移除大型 switch 代码块](https://github.com/reduxjs/redux/issues/883)
- [#1167: 无需 switch 的 reducer](https://github.com/reduxjs/redux/issues/1167)