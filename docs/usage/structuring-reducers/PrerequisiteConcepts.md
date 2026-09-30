---
id: prerequisite-concepts
title: 先决概念
sidebar_label: 先决概念
description: '结构化 Reducers > 先决概念：使用 Redux 时需要理解的关键概念'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Reducer 先决概念

<HandWrittenReducersNote />

正如[“Redux 基础”第 3 部分：状态、Action 和 Reducer](../../tutorials/fundamentals/part-3-state-actions-reducers.md)中所述，Redux reducer 函数：

- 应具有 `(previousState, action) => newState` 的签名，类似于你会传递给 [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) 的函数类型
- 应该是“纯函数”，这意味着 reducer：
  - 不执行 _副作用_（例如调用 API 或修改非本地对象或变量）。
  - 不调用 _非纯函数_（比如 `Date.now` 或 `Math.random`）。
  - 不 _修改_ 它的参数。如果 reducer 更新状态，不应该 _原地修改_ **现有**的状态对象。相反，应该生成一个包含必要更改的 **新对象**。对于 reducer 更新的状态中的任何子对象也应采用相同的做法。

> ##### 关于不可变性、副作用和变异的说明
>
> 不建议使用状态变更，因为它通常会破坏时间旅行调试，并影响 React Redux 的 `useSelector` hook：
>
> - 对于时间旅行，Redux DevTools 期望重放已记录的 action 时只生成状态值，而不改变其他内容。**修改状态或执行异步行为等副作用会让时间旅行在不同步骤之间改变行为，进而破坏应用**。
> - 对于 React Redux，`useSelector` 会按引用比较 selector 的返回值与上一次的值，以判断组件是否需要更新。这意味着，**直接修改对象或数组不会被检测到，组件也不会重新渲染**。请参阅常见问题中的[为什么我的组件没有重新渲染？](../../faq/ReactRedux.md#why-isnt-my-component-re-rendering)。
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

#### 不可变数据管理 {#immutable-data-management}

**关键概念**：

- 可变与不可变
- 如何安全地不可变更新对象和数组
- 如何避免使用会修改状态的函数和语句
- Immer 如何让你用“修改式”代码生成不可变更新

**阅读列表**：

- [Redux 文档：不可变更新模式](./ImmutableUpdatePatterns.md)
- [React 文档：更新 State 中的对象](https://react.dev/learn/updating-objects-in-state)和[更新 State 中的数组](https://react.dev/learn/updating-arrays-in-state)
- [Immer 文档](https://immerjs.github.io/immer/)和 [Redux Toolkit：使用 Immer 编写 Reducer](/toolkit/usage/immer-reducers)
- [Dave Ceddia：React 和 Redux 不可变性完整指南](https://daveceddia.com/react-redux-immutability-guide/)
- [使用 ES6 及后续版本的不可变数据](https://wecodetheweb.com/2016/02/12/immutable-javascript-using-es6-and-beyond/)

#### 数据规范化 {#normalizing-data}

**关键概念**：

- 数据库结构与组织
- 将关系型/嵌套数据拆分成多个表
- 为某个项目存储单一定义
- 通过 ID 引用项目
- 使用以项目 ID 为键的对象作为查找表，使用 ID 数组来追踪排序
- 关联项目之间的关系

**阅读列表**：

- [用通俗语言介绍数据库规范化](https://www.essentialsql.com/get-ready-to-learn-sql-database-normalization-explained-in-simple-english/)
- [惯用 Redux：规范化状态结构](https://egghead.io/lessons/javascript-redux-normalizing-the-state-shape)
- [Redux Toolkit: `createEntityAdapter`](/toolkit/api/createEntityAdapter)
- [Redux Essentials：性能与数据规范化](../../tutorials/essentials/part-6-performance-normalization.md)
- [Normalizr 文档](https://github.com/paularmstrong/normalizr)（稳定，但已不再积极维护）
- [查询 Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)
- [维基百科：关联实体](https://en.wikipedia.org/wiki/Associative_entity)
