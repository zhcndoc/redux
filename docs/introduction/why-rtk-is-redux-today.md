---
id: why-rtk-is-redux-today
title: 为什么 Redux Toolkit 是当今使用 Redux 的方式
# 是的，标题就是这么定的。就保持这样，不要再开 Pull Requests 来改它了。
description: '介绍 > 为什么 RTK 是当今的 Redux：详述 RTK 如何取代 Redux 核心'
---

## 什么是 Redux Toolkit？

[**Redux Toolkit**](https://redux-toolkit.js.org)（简称 **"RTK"**）是我们官方推荐的编写 Redux 逻辑的方法。`@reduxjs/toolkit` 包是对核心 `redux` 包的封装，包含了一些我们认为构建 Redux 应用必不可少的 API 方法和常用依赖。Redux Toolkit 内置了推荐的最佳实践，简化了大多数 Redux 任务，防止常见错误，提高了编写 Redux 应用的便利性。

**如果你今天编写任何 Redux 代码，应该使用 Redux Toolkit 来写！**

RTK 包含帮助简化多种常见用例的工具，包括 [store 配置](https://redux-toolkit.js.org/api/configureStore)、[创建 reducers 和编写不可变更新逻辑](https://redux-toolkit.js.org/api/createreducer)，甚至 [一次性创建整个「slice」状态](https://redux-toolkit.js.org/api/createslice)。

无论你是刚开始使用 Redux，搭建第一个项目，还是想简化已有应用的经验用户，**[Redux Toolkit](https://redux-toolkit.js.org/)** 都能帮你写出更好的 Redux 代码。

:::tip

查看这些页面，学习如何用 Redux Toolkit 使用“现代 Redux”：

- [**“Redux Essentials” 教程**](../tutorials/essentials/part-1-overview-concepts.md)，教你如何用 Redux Toolkit 以正确的方式编写真实项目的 Redux 代码，
- [**Redux 基础，第 8 部分：用 Redux Toolkit 实现现代 Redux**](../tutorials/fundamentals/part-8-modern-redux.md)，展示如何将教程早期的底层示例转换为现代 Redux Toolkit 等价实现，
- [**使用 Redux：迁移到现代 Redux**](../usage/migrating-to-modern-redux.mdx)，介绍如何将各种旧版 Redux 逻辑迁移到现代 Redux 等价方案。

:::

## Redux Toolkit 与 Redux 核心的区别

### 什么是“Redux”？

首先要问的是，“什么是 Redux？”

Redux 实际上是：

- 一个包含“全局”状态的单一 store
- 当应用中发生某些事情时，向 store 派发纯对象形式的 action
- 纯 reducer 函数根据这些 action 返回不可变更新的状态

虽然不是必需的，[你的 Redux 代码通常还包括](../tutorials/fundamentals/part-7-standard-patterns.md)：

- 生成 action 对象的 action 创建函数
- 支持副作用的中间件
- 包含同步或异步副作用逻辑的 thunk 函数
- 用于通过 ID 查询项目的规范化状态
- 使用 Reselect 库的 memoized selector 函数，用于优化派生数据
- 用于查看操作历史和状态变化的 Redux DevTools 扩展
- 用于 actions、state 及其它函数的 TypeScript 类型

此外，Redux 通常搭配 React-Redux 库使用，以便 React 组件能够与 Redux store 通信。

### Redux 核心库做了什么？

Redux 核心库非常小且刻意不带偏见，提供了几个基础的 API 原语：

- `createStore` 来创建 Redux store
- `combineReducers` 来合并多个 slice reducer 组成一个更大的 reducer
- `applyMiddleware` 来合并多个中间件，增强 store
- `compose` 来组合多个 store 增强器

除此之外，你要写的所有 Redux 相关逻辑都需要自己手动实现。

好处是 Redux 核心可以以多种方式使用，坏处是没有帮助功能来简化你的代码编写。

举例来说，reducer 函数就是一个普通函数。在使用 Redux Toolkit 之前，你通常用 `switch` 语句和手动更新编写 reducer，还需要手写 action 创建函数和 action 类型常量：

```js title="Legacy hand-written Redux usage"
const ADD_TODO = 'ADD_TODO'
const TODO_TOGGLED = 'TODO_TOGGLED'

export const addTodo = text => ({
  type: ADD_TODO,
  payload: { text, id: nanoid() }
})

export const todoToggled = id => ({
  type: TODO_TOGGLED,
  payload: id
})

export const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return state.concat({
        id: action.payload.id,
        text: action.payload.text,
        completed: false
      })
    case TODO_TOGGLED:
      return state.map(todo => {
        if (todo.id !== action.payload) return todo

        return {
          ...todo,
          completed: !todo.completed
        }
      })
    default:
      return state
  }
}
```

这里的所有代码并未依赖 `redux` 核心库的任何 API。但代码量庞大，且不可变更新需要大量手写对象展开和数组操作，非常容易出错意外地修改了状态（始终是 Redux Bug 的头号原因！）。尽管不是严格必须，但通常会把一个特性的代码分散到多个文件中，比如 `actions/todos.js`、`constants/todos.js` 和 `reducers/todos.js`。

另外，store 的配置通常需要多步操作来添加常用中间件（例如 thunk）并启用 Redux DevTools 扩展支持，尽管这些是几乎每个 Redux 应用都会用到的标准工具。

### Redux Toolkit 做了什么？

虽然这些 _曾经是_ Redux 文档中展示的范例，但它们确实需要大量冗长且重复的代码。大部分模板代码对于使用 Redux 并非 _必须_。更重要的是，模板代码带来了更多出错的机会。

**我们专门创建了 Redux Toolkit 来消除手写 Redux 逻辑中的“模板”，防止常见错误，并提供简化标准 Redux 任务的 API。**

Redux Toolkit 以两个关键 API 开始，简化你在每个 Redux 应用中最常做的事：

- `configureStore` 只需一个函数调用即可配置好 Redux store，包括自动组合 reducers、添加 thunk 中间件以及设置 Redux DevTools 集成。因为它使用具名参数，配置也比 `createStore` 更简单。
- `createSlice` 允许你编写使用 [Immer 库](https://immerjs.github.io/immer/) 的 reducer，通过「可变」的 JS 语法（如 `state.value = 123`）来写不可变更新，不需要展开操作。它还能自动生成每个 reducer 的 action 创建函数，并基于 reducer 名称内部生成 action 类型字符串。最后，它与 TypeScript 配合良好。

这意味着你写的代码可以简化很多。例如，同样的 todos reducer 可以写成：

```js title="features/todos/todosSlice.js"
import { createSlice } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push({
        id: action.payload.id,
        text: action.payload.text,
        completed: false
      })
    },
    todoToggled(state, action) {
      const todo = state.find(todo => todo.id === action.payload)
      todo.completed = !todo.completed
    }
  }
})

export const { todoAdded, todoToggled } = todosSlice.actions
export default todosSlice.reducer
```

所有 action 创建函数和 action 类型都自动生成，reducer 代码更短且更易理解，也更清晰地表达了每种情况下更新了什么。

用 `configureStore`，store 配置简化为：

```js title="app/store.js"
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer
  }
})
```

注意，**这一个 `configureStore` 调用自动完成了你过去手动做的所有设置工作**：

- 自动将切片 reducers 传入 `combineReducers()`
- 自动添加了 `redux-thunk` 中间件
- 在开发模式下自动加入检测意外状态变更的中间件
- 自动设置了 Redux DevTools 扩展
- 自动将中间件和 DevTools 增强器合成后应用到 store

同时，**`configureStore` 还提供了选项，可以让你改写默认行为**（例如关闭 thunk，添加 saga，或在生产环境禁用 DevTools）。

除此之外，Redux Toolkit 还包含常用 Redux 任务的其他 API：

- `createAsyncThunk`：抽象了经典“异步请求前后派发 action”的模式
- `createEntityAdapter`：为规范化状态上的 CRUD 操作提供预构建的 reducers 和 selectors
- `createSelector`：重新导出标准 Reselect API，支持 memoized selectors
- `createListenerMiddleware`：一个用于响应派发 action 并执行副作用逻辑的中间件

最后，RTK 包还配备了作为独立可选入口的“RTK Query”，这是一个完整的数据抓取和缓存方案。它允许定义端点（REST、GraphQL 甚至任意异步函数），并自动生成管理数据抓取、加载状态和缓存结果的 reducer 和中间件。它还自动生成可以被 React 组件调用的 hooks，比如 `const { data, isFetching } = useGetPokemonQuery('pikachu')`。

这些 API 完全可选，根据具体用例自由选用，**但我们都强烈推荐结合使用以简化相关任务**。

注意，**Redux Toolkit 仍然是“Redux”！** 依然是单 store，依然通过派发的 action 对象更新状态，依然用 reducer 不可变更新状态，还可以写 thunk 管理异步逻辑、管理规范化状态、使用 TypeScript 类型和调试工具。**只是你需要写的代码少得多！**

## 为什么我们希望你使用 Redux Toolkit

作为 Redux 管理者，我们的观点是：

:::tip

**我们希望 _所有_ Redux 用户都用 Redux Toolkit编写代码，因为它简化代码且消除许多常见 Redux 错误和缺陷！**

:::

早期 Redux 的“模板”和复杂度从来不是 Redux 的必需部分。这些模式存在的原因是：

- 最初“Flux 架构”使用了部分类似方式
- 早期 Redux 文档演示了用 action 类型常量支持将代码按类型拆分文件
- JavaScript 默认是可变的，编写不可变更新需要手写对象扩展和数组更新
- Redux 最初只花几周时间开发，有意设计成极简 API

此外，Redux 社区还采纳了一些增加额外模板的做法：

- 推崇使用 `redux-saga` 中间件管理副作用
- 坚持手写 Actions 的 TypeScript 类型，以及联合类型限制可以派发的 actions

多年来，我们观察了人们实际如何使用 Redux，看到社区写了数百个辅助库来处理动作类型和创建、异步逻辑和副作用、数据抓取等任务。我们也看到用户反复遇到的问题，比如意外改写状态、为了简单更新写数十行代码、难以理解代码结构。我们帮助了成千上万挣扎于理解 Redux 各模块如何协作、难以消化概念和大量额外代码的用户。我们 _深知_ 用户面临的痛点。

**我们专门设计 Redux Toolkit 来解决这些问题！**

- Redux Toolkit 将 store 配置简化为单次函数调用，同时保留全面配置能力
- Redux Toolkit 消除意外状态变更这一 Redux Bug 头号元凶
- Redux Toolkit 消除你手写 action 创建函数和 action 类型的需要
- Redux Toolkit 消除你手写易错不可变更新逻辑的需要
- Redux Toolkit 让你轻松把 Redux 特性的代码写在一个文件里，而非拆散多个文件
- Redux Toolkit 提供极佳的 TS 支持，API 设计让你拥有优良类型安全，极大减少自己动手定义类型的需求
- RTK Query 可完全替代 thunk、reducer、action 创建函数及 effect hooks 来管理数据抓取和加载状态

基于此：

:::tip

**我们明确推荐用户 _应当_ 使用 Redux Toolkit（`@reduxjs/toolkit`），而 _不应_ 在新项目中使用遗留的 `redux` 核心包！**

:::

即使是已有项目，我们也推荐至少替换 `createStore` 为 `configureStore`，因为开发模式中间件也会帮助你在既有代码中捕捉意外状态变更和序列化错误。我们也鼓励你把最常用的 reducers（和未来写的）切换至 `createSlice`，代码更短更易读，安全性提升也会帮你省心省力。

**`redux` 核心包仍然可用，但我们今天认为它已经过时。** 其所有 API 都被 `@reduxjs/toolkit` 重新导出，而且 `configureStore` 做到了 `createStore` 的所有事，还拥有更好的默认行为和配置能力。

理解低级概念很有用，让你更明白 Redux Toolkit 在你背后做了什么。这也是为什么 [“Redux 基础”教程展示了 Redux 的纯底层实现，无任何抽象](../tutorials/fundamentals/part-1-overview.md)。_但_ 它仅用于学习目的，最后还会示范 Redux Toolkit 如何简化老式手写 Redux 代码。

如果你在单独使用 `redux` 核心包，代码依旧可以运行，但**我们强烈建议你切换到 `@reduxjs/toolkit`，并更新代码改用 Redux Toolkit 提供的 API！**

## 更多信息

请参阅以下文档页面和博客文章了解详情：

- [Redux Essentials: Redux Toolkit 应用结构](../tutorials/essentials/part-2-app-structure.md)
- [Redux 基础: 用 Redux Toolkit 书写现代 Redux](../tutorials/fundamentals/part-8-modern-redux.md)
- [Redux 风格指南: 最佳实践与推荐](../style-guide/style-guide.md)
- [演讲：用 Redux Toolkit 实现现代 Redux](https://blog.isquaredsoftware.com/2022/06/presentations-modern-redux-rtk/)
- [Mark Erikson: Redux Toolkit 1.0 发布及开发历程](https://blog.isquaredsoftware.com/2019/10/redux-toolkit-1.0/)
