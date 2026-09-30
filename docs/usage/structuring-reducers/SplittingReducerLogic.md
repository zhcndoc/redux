---
id: splitting-reducer-logic
title: 拆分 Reducer 逻辑
sidebar_label: 拆分 Reducer 逻辑
description: '结构化 Reducers > 拆分 Reducer 逻辑：不同 Reducer 用例的术语'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# 拆分 Reducer 逻辑

<HandWrittenReducersNote />

对于任何有一定规模的应用，将_所有_更新逻辑都放进一个 reducer 函数很快就会变得难以维护。虽然没有规定函数应该有多长，但通常认为函数应相对简短，最好只做一件具体的事。因此，良好的编程实践是把很长或负责多种工作的代码拆分成更易理解的小块。

由于 Redux reducer 本质上就是一个函数，这个概念同样适用。你可以把部分 reducer 逻辑拆分到另一个函数中，然后从父函数中调用这个新函数。

这些新函数通常属于以下三类：

1. 包含一些可复用逻辑的小型工具函数，这些逻辑在多个地方需要使用（这些函数可能与具体业务逻辑相关，也可能无关）
2. 处理特定更新场景的函数，通常需要除 `(state, action)` 外的其他参数
3. 处理给定 state 切片所有更新的函数。这类函数通常采用 `(state, action)` 的参数签名

为了清晰起见，将使用以下术语来区分不同类型的函数和用例：

- **_reducer_**：签名为 `(state, action) -> newState` 的任意函数（即任何_可以_作为 `Array.prototype.reduce` 参数的函数）。
- **_根 reducer_**：实际作为 `configureStore` 的 `reducer` 选项传给 store 的 reducer 函数。这是 reducer 逻辑中唯一_必须_采用 `(state, action) -> newState` 签名的部分。
- **_slice reducer_**：负责处理状态树中特定 slice 更新的 reducer，通常会将它传给 `combineReducers`。
- **_case 函数_**：负责处理特定 action 更新逻辑的函数。它可以本身就是 reducer 函数，也可以需要其他参数才能正确完成工作。
- **_高阶 reducer_**：接收 reducer 函数作为参数，和/或返回新 reducer 函数的函数（例如 `combineReducers` 或 `redux-undo`）。

“_sub-reducer_” 这个术语在各种讨论中也曾用来指代非 root reducer 的任何函数，但这个术语定义不够精确。有些人也可能将某些函数称作“_业务逻辑_”（与应用特定行为相关的函数）或“_工具函数_”（与应用无关的通用函数）。

将复杂过程拆分为较小且更易理解的部分，通常称为**_[函数分解](https://stackoverflow.com/questions/947874/what-is-functional-decomposition)_**。这一术语和概念适用于各种代码。不过，在 Redux 中非常常见的做法是使用方法 #3：根据状态 slice 将更新逻辑委托给其他函数。Redux 将这一概念称为**_reducer 组合_**，它是最广泛使用的 reducer 逻辑组织方式。事实上，这种方式非常常见，因此 Redux 提供了 [`combineReducers()`](../../api/combineReducers.md) 工具函数，专门抽象了根据状态 slice 将工作委托给其他 reducer 函数的过程。但要注意，这不是_唯一_可用的模式。实际上，这三种拆分逻辑的方式都可以使用，通常结合使用也很有益。[重构 Reducer](./RefactoringReducersExample.md)一节展示了一些实际示例。

这些术语与 Redux Toolkit 的 `createSlice` 直接对应：`reducers` 选项中的每个条目都是一个 case 函数；它生成的 reducer 是 slice reducer；而 `configureStore` 会将这些 slice reducer 组合为根 reducer。
