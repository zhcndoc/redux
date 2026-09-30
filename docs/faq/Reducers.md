---
id: reducers
title: Reducer（状态更新函数）
sidebar_label: Reducer（状态更新函数）
---

## Redux 常见问题：Reducer（状态更新函数）

### 如何在两个 reducer 之间共享状态？我必须使用 `combineReducers` 吗？ {#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers}

Redux 存储推荐的结构是通过键将状态对象拆分成多个“切片”或“领域”，并为每个单独的数据切片提供一个 reducer 函数来管理。这类似于标准 Flux 模式中有多个独立的 store，Redux 提供了 [`combineReducers`](../api/combineReducers.md) 工具函数来简化这种模式的使用。然而，需要注意的是，`combineReducers` 并**非**必需 —— 它只是一个用于常见用例的辅助函数，即每个状态切片对应一个 reducer 函数，数据使用普通的 JavaScript 对象。

许多用户后来希望尝试在两个 reducer 之间共享数据，但发现 `combineReducers` 并不支持这样做。有几种解决方法：

- 首先，确认你是否真的需要在状态切片之间_共享_状态，还是只需要让多个切片_响应同一个 action_。后一种情况更常见，也不需要特殊处理：每个 `createSlice` 都可以在 [`extraReducers`](/toolkit/api/createSlice#extrareducers) 字段中处理其他 slice（或 `createAsyncThunk`）生成的 action。请参阅风格指南中的[让多个 reducer 响应同一个 action](../style-guide/style-guide.md#allow-many-reducers-to-respond-to-the-same-action)。
- 如果某个 reducer 需要知道另一个状态切片中的数据，可能需要调整状态树结构，让单个 reducer 负责更多数据。
- 你可能需要编写自定义函数处理其中一些 action。这可能要求用自己的顶层 reducer 函数替代 `combineReducers`。也可以使用 [reduce-reducers](https://github.com/redux-utilities/reduce-reducers) 之类的工具，先让 `combineReducers` 处理大多数 action，再为跨切片的特定 action 运行更专门的 reducer。[超越 `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md) 展示了这种方法。
- [Thunk](../usage/writing-logic-thunks.mdx) 和 [listener middleware](/toolkit/api/createListenerMiddleware) effect 都可以通过 `getState()` 访问完整状态。Thunk 可以从状态中读取额外数据并放进它派发的 action，使各 reducer 获得更新自身状态切片所需的信息。

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

### 我必须使用 `switch` 语句来处理动作吗？ {#do-i-have-to-use-the-switch-statement-to-handle-actions}

不必。你可以用任何喜欢的方式让 reducer 响应 action。手写 reducer 时，`switch` 最常见，但使用 `if` 语句、函数查找表或封装这些逻辑的函数也完全可以。事实上，Redux 虽然要求 action 对象包含 `type` 字段，但 reducer 逻辑甚至不一定要依赖它来处理 action。

如今的标准方式是使用 [`createSlice`](/toolkit/api/createSlice)，它本质上是一个查找表：`reducers` 字段中的每个函数处理一种 action 类型，而 slice 会替你生成对应的 action creator 和组合后的 reducer。[`createReducer`](/toolkit/api/createReducer) 的 builder callback 也能为不属于 slice 的 reducer 完成同样的工作。

#### 进一步信息

**文档**

- [风格指南：使用 Redux Toolkit 编写 Redux 逻辑](../style-guide/style-guide.md#use-redux-toolkit-for-writing-redux-logic)
- [使用 Redux：减少样板代码](../usage/ReducingBoilerplate.md)
- [使用 Redux：结构化 Reducer - 拆分 reducer 逻辑](../usage/structuring-reducers/SplittingReducerLogic.md)

**讨论**

- [#883: 移除大型 switch 代码块](https://github.com/reduxjs/redux/issues/883)
- [#1167: 无需 switch 的 reducer](https://github.com/reduxjs/redux/issues/1167)
