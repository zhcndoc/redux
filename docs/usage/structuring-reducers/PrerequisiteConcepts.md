---
id: prerequisite-concepts
title: 先决概念
sidebar_label: 先决概念
description: '结构化 Reducers > 先决概念：使用 Redux 时需要理解的关键概念'
---

# 先决 Reducer 概念

正如在[“Redux 基础”第 3 部分：状态、动作和 Reducers](../../tutorials/fundamentals/part-3-state-actions-reducers.md)中所描述的，Redux reducer 函数：

- 应具有 `(previousState, action) => newState` 的签名，类似于你会传递给 [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) 的函数类型
- 应该是“纯函数”，这意味着 reducer：
  - 不执行 _副作用_（例如调用 API 或修改非本地对象或变量）。
  - 不调用 _非纯函数_（比如 `Date.now` 或 `Math.random`）。
  - 不 _修改_ 它的参数。如果 reducer 更新状态，不应该 _原地修改_ **现有**的状态对象。相反，应该生成一个包含必要更改的 **新对象**。对于 reducer 更新的状态中的任何子对象也应采用相同的做法。

> ##### 关于不可变性、副作用和变异的说明
>
> 不推荐变异，因为它通常会破坏时间旅行调试和 React Redux 的 `connect` 函数：
>
> - 对于时间旅行，Redux DevTools 期望重放记录的动作能够输出状态值，但不会改变其他任何东西。**副作用如变异或异步行为会导致时间旅行在步骤之间改变行为，从而破坏应用**。
> - 对于 React Redux，`connect` 会检查 `mapStateToProps` 函数返回的 props 是否变化，以确定组件是否需要更新。为了提升性能，`connect` 采用一些依赖于状态不可变性的优化，并使用浅层引用相等检测变化。这意味着 **通过直接变异修改对象和数组的更改不会被检测到，组件也不会重新渲染**。
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

- [函数式编程的小思路](http://jaysoo.ca/2016/01/13/functional-programming-little-ideas/)
- [理解编程副作用](https://c2fo.io/c2fo/programming/2016/05/11/understanding-programmatic-side-effects/)
- [学习 JavaScript 中的函数式编程](https://youtu.be/e-5obm1G_FY)
- [理性纯函数式编程入门](https://www.sitepoint.com/an-introduction-to-reasonably-pure-functional-programming/)

#### 不可变数据管理

**关键概念**：

- 可变性与不可变性
- 安全地不可变更新对象和数组
- 避免会变异状态的函数和语句

**阅读列表**：

- [在 React 中使用不可变性的优缺点](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)
- [使用 ES6 及以后版本实现不可变数据](https://wecodetheweb.com/2016/02/12/immutable-javascript-using-es6-and-beyond/)

#### 数据规范化

**关键概念**：

- 数据库结构与组织
- 将关系型/嵌套数据拆分成多个表
- 为某个项目存储单一定义
- 通过 ID 引用项目
- 使用以项目 ID 为键的对象作为查找表，使用 ID 数组来追踪排序
- 关联项目之间的关系

**阅读列表**：

- [用简单英语解释数据库规范化](https://www.essentialsql.com/get-ready-to-learn-sql-database-normalization-explained-in-simple-english/)
- [惯用 Redux：规范化状态形状](https://egghead.io/lessons/javascript-redux-normalizing-the-state-shape)
- [Normalizr 文档](https://github.com/paularmstrong/normalizr)
- [Redux 无脏话：Normalizr](https://tonyhb.gitbooks.io/redux-without-profanity/content/normalizer.html)
- [查询 Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)
- [维基百科：关联实体](https://en.wikipedia.org/wiki/Associative_entity)
- [数据库设计：多对多](https://web.csulb.edu/colleges/coe/cecs/dbdesign/dbdesign.php?page=manymany.php)
- [避免在结构化应用状态时引入偶然复杂度](https://medium.com/@talkol/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a)