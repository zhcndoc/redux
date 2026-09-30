---
id: structuring-reducers
title: 组织 Reducers
description: '组织 Reducers > 介绍：概述和内容'
---

<!-- prettier-ignore -->
import CoreApiNote from "../../components/_CoreApiNote.mdx";

# Structuring Reducers

<CoreApiNote />

At its core, Redux is really a fairly simple design pattern: all your "write" logic goes into a single function, and the only way to run that logic is to give Redux a plain object that describes something that has happened. The Redux store calls that write logic function and passes in the current state tree and the descriptive object, the write logic function returns some new state tree, and the Redux store notifies any subscribers that the state tree has changed.

Redux 对该写入逻辑函数的工作方式施加了一些基本约束。正如在[“Redux 基础” 第3部分：状态、动作和 Reducers](../../tutorials/fundamentals/part-3-state-actions-reducers.md)中描述的，它必须有一个签名 `(previousState, action) => newState`，被称为**_reducer 函数_**，且必须是**纯净**且可预测的。

除此之外，Redux 并不真正关心你如何在该 reducer 函数内部组织逻辑，只要它遵守这些基本规则即可。这既带来了自由，也带来了困惑。不过，在编写 reducers 时，有许多常见模式被广泛使用，还有许多相关主题和概念需要了解。随着应用的增长，这些模式在管理 reducer 代码复杂度、处理真实数据和优化 UI 性能方面起着关键作用。

The pages in this section show these patterns written by hand, with `switch` statements and object spreads. Redux Toolkit's [`createSlice`](/toolkit/api/createSlice) implements the same patterns: each "case function" becomes an entry in its `reducers` object, the immutable update logic is handled by Immer, and `configureStore` combines the resulting slice reducers for you. Read the pages here to understand what `createSlice` is doing, then write your own reducers with it.

### Prerequisite Concepts for Writing Reducers

其中一些概念已经在 Redux 文档的其他部分描述过。其他概念是通用的，适用于 Redux 之外的情况，也有大量现存文章对这些概念进行了详细介绍。这些概念和技术构成了编写坚实的 Redux reducer 逻辑的基础。

在深入更高级且 Redux 专用的技术之前，务必**彻底理解**这些前置概念。推荐的阅读列表可见：

#### [前置概念](PrerequisiteConcepts.md)

标准的 Redux 架构依赖于使用普通的 JS 对象和数组来维护状态。如果因某些原因你使用了不同的方式，细节可能会根据你的方案有所不同，但许多原则仍然适用。

### Reducer 的概念和技术

- [基础 Reducer 结构](BasicReducerStructure.md)
- [拆分 Reducer 逻辑](SplittingReducerLogic.md)
- [重构 Reducers 示例](RefactoringReducersExample.md)
- [使用 `combineReducers`](UsingCombineReducers.md)
- [超越 `combineReducers`](BeyondCombineReducers.md)
- [标准化状态结构](NormalizingStateShape.md)
- [更新标准化数据](UpdatingNormalizedData.md)
- [复用 Reducer 逻辑](ReusingReducerLogic.md)
- [不可变更新模式](ImmutableUpdatePatterns.md)
- [初始化状态](InitializingState.md)