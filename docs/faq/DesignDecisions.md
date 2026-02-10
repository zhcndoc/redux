---
id: design-decisions
title: 设计决策
sidebar_label: 设计决策
---

## Redux 常见问答：设计决策

### 为什么 Redux 不将 state 和 action 传递给订阅者？

订阅者旨在对 state 本身的值作出响应，而不是对 action。对 state 的更新是同步处理的，但对订阅者的通知可以批量处理或防抖处理，这意味着订阅者并不总是对每个 action 都接收到通知。这是一种常见的[性能优化](./Performance.md#performance-update-events)，用来避免重复的重新渲染。

通过使用增强器覆盖 `store.dispatch` 来改变订阅者通知的方式，可以实现批量处理或防抖处理。此外，也有库通过批量处理 action 来优化性能，避免重复渲染：

- [redux-batch](https://github.com/manaflair/redux-batch) 允许传递一个 action 数组到 `store.dispatch()`，仅触发一次通知，
- [redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe) 允许对由 dispatch 触发的订阅通知进行批处理。

设计保证是 Redux 最终会用最新的 state 调用所有订阅者，但不会保证对每一个 action 都调用所有订阅者。订阅者中可以直接通过调用 `store.getState()` 获得 store 的 state。由于 action 可能被批量处理，无法提供 action 给订阅者而不破坏这一机制。

一个潜在的，也是不被支持的用例，是在订阅者中使用 action，以确保组件仅在特定类型的 action 后才重新渲染。但实际上，重新渲染应通过以下方法控制：

1. [shouldComponentUpdate](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate) 生命周期方法
2. [虚拟 DOM 相等检查 (vDOMEq)](https://facebook.github.io/react/docs/optimizing-performance.html#avoid-reconciliation)
3. [React.PureComponent](https://facebook.github.io/react/docs/optimizing-performance.html#examples)
4. 使用 React-Redux：通过 [mapStateToProps](https://react-redux.js.org/api#connect) 仅订阅组件所需的 store 部分。

#### 进一步信息

**文章**

- [我如何减少 store 更新事件的次数？](./Performance.md#performance-update-events)

**讨论**

- [#580: 为什么 Redux 不将 state 传递给订阅者？](https://github.com/reactjs/redux/issues/580)
- [#2214: 概念验证的另一种方案：增强器大改造 —— 更多关于防抖](https://github.com/reactjs/redux/pull/2214)

### 为什么 Redux 不支持用类（Class）来定义 actions 和 reducers？

用函数（称为 action creators）来返回 action 对象的模式，对于有大量面向对象编程经验的程序员来说，可能感觉相悖，因为他们会认为这是使用类和实例的典型场景。Redux 不支持用类实例作为 action 对象和 reducer 的原因在于，类实例会使序列化和反序列化变得复杂。像 `JSON.parse(string)` 这类反序列化方法会返回普通的 JavaScript 对象，而非类实例。

如同[Store 常见问答](./OrganizingState.md#organizing-state-non-serializable)中所述，如果你接受诸如持久化和时间旅行调试等功能无法正常工作，则可以在 Redux store 中放入非序列化数据。

序列化使浏览器能以更节省内存的方式存储所有已分发的 actions 和之前的 store state。重放历史和“热加载” store 是 Redux 开发体验和 Redux DevTools 功能的核心。这也使得服务器端渲染的情况下，能够将反序列化的 actions 存储在服务器端，并在浏览器端重新序列化。

#### 进一步信息

**文章**

- [我可以在 store state 中放入函数、Promise 或其他非序列化项目吗？](./OrganizingState.md#organizing-state-non-serializable)

**讨论**

- [#1171: 为什么 Redux 不使用类定义 actions 和 reducers？](https://github.com/reactjs/redux/issues/1171#issuecomment-196819727)

### 为什么中间件的签名要使用柯里化（currying）？

Redux 中间件是用三层嵌套函数的结构编写的，看起来像这样：`const middleware = storeAPI => next => action => {}`，而非单一函数形态：`const middleware = (storeAPI, next, action) => {}`。原因有几点。

一是“柯里化”函数是标准的函数式编程技巧，而 Redux 设计时明确采用了函数式编程原则。二是柯里化可创建闭包，允许声明在中间件生命周期内存在的变量（这在函数式编程中相当于类实例生命周期内的实例变量）。最后，这仅仅是 Redux 初期设计时选用的方式。

声明中间件的这种[柯里化函数签名](https://github.com/reactjs/redux/issues/1744)被一些人认为[没有必要](https://github.com/reactjs/redux/pull/784)，因为在 `applyMiddleware` 执行时，store 和 next 都已可用。鉴于 Redux 生态中已有数百个中间件依赖已有签名格式，该问题被认为[不值得引入破坏性变更](https://github.com/reactjs/redux/issues/1744)。

#### 进一步信息

**讨论**

- 为什么中间件签名使用柯里化？
  - 之前的讨论：[#55](https://github.com/reactjs/redux/pull/55)、[#534](https://github.com/reactjs/redux/issues/534)、[#784](https://github.com/reactjs/redux/pull/784)、[#922](https://github.com/reactjs/redux/issues/922)、[#1744](https://github.com/reactjs/redux/issues/1744)
  - [React Boston 2017：你可能需要 Redux（及其生态）](https://blog.isquaredsoftware.com/2017/09/presentation-might-need-redux-ecosystem/)

### 为什么 `applyMiddleware` 通过闭包来保存 `dispatch`？

`applyMiddleware` 会拿到 store 现有的 dispatch，并对它形成闭包，以创建中间件链。这个链会被调用时传入包含 `getState` 和 `dispatch` 函数的对象，这使得某些[在初始化时依赖 dispatch 的中间件](https://github.com/reactjs/redux/pull/1592)能够正常运行。

#### 进一步信息

**讨论**

- 为什么 applyMiddleware 使用闭包保存 dispatch？
  - 参见 - [#1592](https://github.com/reactjs/redux/pull/1592) 和 [#2097](https://github.com/reactjs/redux/issues/2097)

### 为什么 `combineReducers` 在调用每个 reducer 时不传递整个 state 作为第三个参数？

`combineReducers` 的设计宗旨是鼓励按领域拆分 reducer 逻辑。如 [超越 `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md) 所述，`combineReducers` 有意识地被限制为处理一种常见用例：通过委托给每个切片的 reducer 来更新纯 JavaScript 对象形式的状态树。

很难直接确定给每个 reducer 的潜在第三个参数应该是什么：是整个状态树、某个回调函数，还是状态树的其他部分？如果 `combineReducers` 不符合你的使用需求，可以考虑使用其他库，如 [combineSectionReducers](https://github.com/ryo33/combine-section-reducers) 或 [reduceReducers](https://github.com/acdlite/reduce-reducers)，它们支持更深的嵌套 reducer 和需要访问全局状态的 reducer。

如果现有工具都无法满足需求，你也可以自己编写一个函数，精确实现你的需求。

#### 进一步信息

**文章**

- [超越 `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md)

**讨论**

- [#1768 允许 reducers 访问全局状态](https://github.com/reactjs/redux/pull/1768)

### 为什么 `mapDispatchToProps` 不允许使用 `getState()` 或 `mapStateToProps()` 的返回值？

有人提出希望在 `mapDispatch` 中使用整个 `state` 或 `mapState` 的返回值，以使在 `mapDispatch` 中声明的函数能闭包访问 store 的最新返回值。

这种做法在 `mapDispatch` 中不被支持，因为这意味着每次 store 更新都要调用 `mapDispatch`，从而重复创建函数，带来严重的性能开销。

推荐的处理方法是使用 `connect` 函数的第三个参数 `mergeProps`，它会接收到 `mapStateToProps()`、`mapDispatchToProps()` 和容器组件的 props。`mergeProps` 返回的纯对象会作为 props 传给被包裹的组件。

#### 进一步信息

**讨论**

- [#237 为什么 mapDispatchToProps 不允许使用 getState() 或 mapStateToProps() 的返回值？](https://github.com/reactjs/react-redux/issues/237)