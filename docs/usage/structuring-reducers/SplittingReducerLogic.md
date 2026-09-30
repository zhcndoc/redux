---
id: splitting-reducer-logic
title: 拆分 Reducer 逻辑
sidebar_label: 拆分 Reducer 逻辑
description: '结构化 Reducers > 拆分 Reducer 逻辑：不同 Reducer 用例的术语'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Splitting Up Reducer Logic

<HandWrittenReducersNote />

For any meaningful application, putting _all_ your update logic into a single reducer function is quickly going to become unmaintainable. While there's no single rule for how long a function should be, it's generally agreed that functions should be relatively short and ideally only do one specific thing. Because of this, it's good programming practice to take pieces of code that are very long or do many different things, and break them into smaller pieces that are easier to understand.

由于 Redux reducer 本质上就是一个函数，这个概念同样适用。你可以把部分 reducer 逻辑拆分到另一个函数中，然后从父函数中调用这个新函数。

这些新函数通常属于以下三类：

1. 包含一些可复用逻辑的小型工具函数，这些逻辑在多个地方需要使用（这些函数可能与具体业务逻辑相关，也可能无关）
2. 处理特定更新场景的函数，通常需要除 `(state, action)` 外的其他参数
3. 处理给定 state 切片所有更新的函数。这类函数通常采用 `(state, action)` 的参数签名

为了清晰起见，将使用以下术语来区分不同类型的函数和用例：

- **_reducer_**: any function with the signature `(state, action) -> newState` (ie, any function that _could_ be used as an argument to `Array.prototype.reduce`)
- **_root reducer_**: the reducer function that is actually passed to the store as the `reducer` option of `configureStore`. This is the only part of the reducer logic that _must_ have the `(state, action) -> newState` signature.
- **_slice reducer_**: a reducer that is being used to handle updates to one specific slice of the state tree, usually done by passing it to `combineReducers`
- **_case function_**: a function that is being used to handle the update logic for a specific action. This may actually be a reducer function, or it may require other parameters to do its work properly.
- **_higher-order reducer_**: a function that takes a reducer function as an argument, and/or returns a new reducer function as a result (such as `combineReducers`, or `redux-undo`)

“_sub-reducer_” 这个术语在各种讨论中也曾用来指代非 root reducer 的任何函数，但这个术语定义不够精确。有些人也可能将某些函数称作“_业务逻辑_”（与应用特定行为相关的函数）或“_工具函数_”（与应用无关的通用函数）。

Breaking down a complex process into smaller, more understandable parts is usually described with the term **_[functional decomposition](https://stackoverflow.com/questions/947874/what-is-functional-decomposition)_**. This term and concept can be applied generically to any code. However, in Redux it is _very_ common to structure reducer logic using approach #3, where update logic is delegated to other functions based on slice of state. Redux refers to this concept as **_reducer composition_**, and it is by far the most widely-used approach to structuring reducer logic. In fact, it's so common that Redux includes a utility function called [`combineReducers()`](../../api/combineReducers.md), which specifically abstracts the process of delegating work to other reducer functions based on slices of state. However, it's important to note that it is not the _only_ pattern that can be used. In fact, it's entirely possible to use all three approaches for splitting up logic into functions, and usually a good idea as well. The [Refactoring Reducers](./RefactoringReducersExample.md) section shows some examples of this in action.

These terms map directly onto Redux Toolkit's `createSlice`: each entry in its `reducers` option is a case function, the reducer it generates is a slice reducer, and `configureStore` combines those slice reducers into the root reducer.
