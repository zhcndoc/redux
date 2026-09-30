---
id: reducers
title: Reducer（状态更新函数）
sidebar_label: Reducer（状态更新函数）
---

## Redux 常见问题：Reducer（状态更新函数）

### 如何在两个 reducer 之间共享状态？我必须使用 `combineReducers` 吗？

Redux 存储推荐的结构是通过键将状态对象拆分成多个“切片”或“领域”，并为每个单独的数据切片提供一个 reducer 函数来管理。这类似于标准 Flux 模式中有多个独立的 store，Redux 提供了 [`combineReducers`](../api/combineReducers.md) 工具函数来简化这种模式的使用。然而，需要注意的是，`combineReducers` 并**非**必需 —— 它只是一个用于常见用例的辅助函数，即每个状态切片对应一个 reducer 函数，数据使用普通的 JavaScript 对象。

许多用户后来希望尝试在两个 reducer 之间共享数据，但发现 `combineReducers` 并不支持这样做。有几种解决方法：

- First, check whether you need to _share_ state at all, or whether several slices just need to _respond to the same action_. The latter is the common case, and it needs no special handling: each `createSlice` can handle actions from other slices (or from `createAsyncThunk`) in its [`extraReducers`](/toolkit/api/createSlice#extrareducers) field. See [Allow Many Reducers to Respond to the Same Action](../style-guide/style-guide.md#allow-many-reducers-to-respond-to-the-same-action) in the Style Guide.
- If a reducer needs to know data from another slice of state, the state tree shape may need to be reorganized so that a single reducer is handling more of the data.
- You may need to write some custom functions for handling some of these actions. This may require replacing `combineReducers` with your own top-level reducer function. You can also use a utility such as [reduce-reducers](https://github.com/redux-utilities/reduce-reducers) to run `combineReducers` to handle most actions, but also run a more specialized reducer for specific actions that cross state slices. [Beyond `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md) shows this approach.
- [Thunks](../usage/writing-logic-thunks.mdx) and [listener middleware](/toolkit/api/createListenerMiddleware) effects have access to the entire state through `getState()`. A thunk can retrieve additional data from the state and put it in the action it dispatches, so that each reducer has enough information to update its own state slice.

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

No. You are welcome to use any approach you'd like to respond to an action in a reducer. The `switch` statement was the most common approach in hand-written reducers, but it's fine to use `if` statements, a lookup table of functions, or to create a function that abstracts this away. In fact, while Redux does require that action objects contain a `type` field, your reducer logic doesn't even have to rely on that to handle the action.

Today the standard approach is [`createSlice`](/toolkit/api/createSlice), which is a lookup table: each function in its `reducers` field handles one action type, and the slice generates the matching action creators and the combined reducer for you. The [`createReducer`](/toolkit/api/createReducer) builder callback does the same for reducers that aren't part of a slice.

#### 进一步信息

**文档**

- [Style Guide: Use Redux Toolkit for Writing Redux Logic](../style-guide/style-guide.md#use-redux-toolkit-for-writing-redux-logic)
- [Using Redux: Reducing Boilerplate](../usage/ReducingBoilerplate.md)
- [Using Redux: Structuring Reducers - Splitting Reducer Logic](../usage/structuring-reducers/SplittingReducerLogic.md)

**讨论**

- [#883: 移除大型 switch 代码块](https://github.com/reduxjs/redux/issues/883)
- [#1167: 无需 switch 的 reducer](https://github.com/reduxjs/redux/issues/1167)