---
id: prerequisite-concepts
title: 先决概念
sidebar_label: 先决概念
description: '结构化 Reducers > 先决概念：使用 Redux 时需要理解的关键概念'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Prerequisite Reducer Concepts

<HandWrittenReducersNote />

As described in ["Redux Fundamentals" Part 3: State, Actions, and Reducers](../../tutorials/fundamentals/part-3-state-actions-reducers.md), a Redux reducer function:

- 应具有 `(previousState, action) => newState` 的签名，类似于你会传递给 [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) 的函数类型
- 应该是“纯函数”，这意味着 reducer：
  - 不执行 _副作用_（例如调用 API 或修改非本地对象或变量）。
  - 不调用 _非纯函数_（比如 `Date.now` 或 `Math.random`）。
  - 不 _修改_ 它的参数。如果 reducer 更新状态，不应该 _原地修改_ **现有**的状态对象。相反，应该生成一个包含必要更改的 **新对象**。对于 reducer 更新的状态中的任何子对象也应采用相同的做法。

> ##### 关于不可变性、副作用和变异的说明
>
> Mutation is discouraged because it generally breaks time-travel debugging, and React Redux's `useSelector` hook:
>
> - For time traveling, the Redux DevTools expect that replaying recorded actions would output a state value, but not change anything else. **Side effects like mutation or asynchronous behavior will cause time travel to alter behavior between steps, breaking the application**.
> - For React Redux, `useSelector` compares the value returned by your selector against the previous value by reference to decide whether a component needs to update. This means that **changes made to objects and arrays by direct mutation will not be detected, and components will not re-render**. See [Why isn't my component re-rendering?](../../faq/ReactRedux.md#why-isnt-my-component-re-rendering) in the FAQ.
>
> 其他如在 reducer 中生成唯一 ID 或时间戳等副作用也会使代码不可预测，且更难调试和测试。

由于这些规则，在继续学习组织 Redux reducer 的其他具体技术之前，务必完全理解以下核心概念：

#### Redux Reducer 基础

**关键概念**：

- 按状态和状态形状思考
- 按状态片段划分更新职责（_reducer 组合_）
- 高阶 reducers
- 定义 reducer 初始状态

**阅读列表**：

- [“Redux 基础”第 3 部分：状态、动作和 Reducers](../../tutorials/fundamentals/part-3-state-actions-reducers.md)
- [Redux 文档：减少样板代码](../ReducingBoilerplate.md)
- [Redux 文档：实现撤销历史](../ImplementingUndoHistory.md)
- [Redux 文档：`combineReducers`](../../api/combineReducers.md)
- [高阶 Reducers 的力量](https://slides.com/omnidan/hor#/)
- [Stack Overflow：Store 初始状态和 `combineReducers`](https://stackoverflow.com/questions/33749759/read-stores-initial-state-in-redux-reducer)
- [Stack Overflow：状态键名和 `combineReducers`](https://stackoverflow.com/questions/35667775/state-in-redux-react-app-has-a-property-with-the-name-of-the-reducer)

#### 纯函数和副作用

**关键概念**：

- 副作用
- 纯函数
- 如何用组合函数的思路思考

**阅读列表**：

- [Redux Style Guide: Reducers Must Not Have Side Effects](../../style-guide/style-guide.md#reducers-must-not-have-side-effects)
- [Learning Functional Programming in Javascript](https://youtu.be/e-5obm1G_FY)
- [An Introduction to Reasonably Pure Functional Programming](https://www.sitepoint.com/an-introduction-to-reasonably-pure-functional-programming/)

#### 不可变数据管理

**关键概念**：

- Mutability vs immutability
- Immutably updating objects and arrays safely
- Avoiding functions and statements that mutate state
- How Immer lets you write "mutating" code that produces immutable updates

**阅读列表**：

- [Redux Docs: Immutable Update Patterns](./ImmutableUpdatePatterns.md)
- [React docs: Updating Objects in State](https://react.dev/learn/updating-objects-in-state) and [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
- [Immer docs](https://immerjs.github.io/immer/) and [Redux Toolkit: Writing Reducers with Immer](/toolkit/usage/immer-reducers)
- [Dave Ceddia: The Complete Guide to Immutability in React and Redux](https://daveceddia.com/react-redux-immutability-guide/)
- [Immutable Data using ES6 and Beyond](https://wecodetheweb.com/2016/02/12/immutable-javascript-using-es6-and-beyond/)

#### 数据规范化

**关键概念**：

- 数据库结构与组织
- 将关系型/嵌套数据拆分成多个表
- 为某个项目存储单一定义
- 通过 ID 引用项目
- 使用以项目 ID 为键的对象作为查找表，使用 ID 数组来追踪排序
- 关联项目之间的关系

**阅读列表**：

- [Database Normalization in Simple English](https://www.essentialsql.com/get-ready-to-learn-sql-database-normalization-explained-in-simple-english/)
- [Idiomatic Redux: Normalizing the State Shape](https://egghead.io/lessons/javascript-redux-normalizing-the-state-shape)
- [Redux Toolkit: `createEntityAdapter`](/toolkit/api/createEntityAdapter)
- [Essentials: Performance and Normalizing Data](../../tutorials/essentials/part-6-performance-normalization.md)
- [Normalizr Documentation](https://github.com/paularmstrong/normalizr) (stable, but no longer actively maintained)
- [Querying a Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)
- [Wikipedia: Associative Entity](https://en.wikipedia.org/wiki/Associative_entity)
