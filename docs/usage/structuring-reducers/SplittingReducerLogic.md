---
id: splitting-reducer-logic
title: 拆分 Reducer 逻辑
sidebar_label: 拆分 Reducer 逻辑
description: '结构化 Reducers > 拆分 Reducer 逻辑：不同 Reducer 用例的术语'
---

# 拆分 Reducer 逻辑

对于任何有实际意义的应用程序，将**所有**更新逻辑放入单个 reducer 函数中很快就会变得难以维护。虽然没有一个严格的函数长度标准，但普遍认为函数应相对简短，并且理想情况下只做一件具体的事情。基于此，将非常长或者执行多种不同功能的代码拆分成更小、更易理解的部分是良好的编程实践。

由于 Redux reducer 本质上就是一个函数，这个概念同样适用。你可以把部分 reducer 逻辑拆分到另一个函数中，然后从父函数中调用这个新函数。

这些新函数通常属于以下三类：

1. 包含一些可复用逻辑的小型工具函数，这些逻辑在多个地方需要使用（这些函数可能与具体业务逻辑相关，也可能无关）
2. 处理特定更新场景的函数，通常需要除 `(state, action)` 外的其他参数
3. 处理给定 state 切片所有更新的函数。这类函数通常采用 `(state, action)` 的参数签名

为了清晰起见，将使用以下术语来区分不同类型的函数和用例：

- **_reducer_**：任何签名为 `(state, action) -> newState` 的函数（即任何可以作为 `Array.prototype.reduce` 参数的函数）
- **_root reducer_**：实际作为 `createStore` 第一个参数传入的 reducer 函数。这是唯一必须满足 `(state, action) -> newState` 签名的 reducer 逻辑部分。
- **_slice reducer_**：用于处理 state 树中特定切片更新的 reducer，通常通过传入 `combineReducers` 来实现
- **_case function_**：用于处理某个特定 action 的更新逻辑的函数。它可以是一个 reducer 函数，也可能需要其他参数才能正确工作。
- **_higher-order reducer_**：接受一个 reducer 函数作为参数和/或返回一个新的 reducer 函数的函数（例如 `combineReducers` 或 `redux-undo`）

“_sub-reducer_” 这个术语在各种讨论中也曾用来指代非 root reducer 的任何函数，但这个术语定义不够精确。有些人也可能将某些函数称作“_业务逻辑_”（与应用特定行为相关的函数）或“_工具函数_”（与应用无关的通用函数）。

将复杂过程拆分为更小、更易理解部分通常称为 **_[函数式分解（functional decomposition）](https://stackoverflow.com/questions/947874/what-is-functional-decomposition)_**。这个术语和概念可以通用于任何代码。但是，在 Redux 中，使用第三种方法（基于 state 切片将更新逻辑委托给其他函数）来结构化 reducer 逻辑是非常常见的。Redux 将这个概念称为 **_reducer 组合（reducer composition）_**，这是最广泛使用的 reducer 逻辑结构化方法。事实上，这个模式非常普遍，以至于 Redux 提供了一个名为 [`combineReducers()`](../../api/combineReducers.md) 的工具函数，专门用于抽象基于 state 切片委托工作给其他 reducer 函数的过程。不过需要注意的是，这并不是唯一可用的模式。实际上，你完全可以同时使用三种拆分逻辑的方式，通常这也是个好主意。[重构 Reducers](./RefactoringReducersExample.md) 一节展示了这些方法的一些实际示例。