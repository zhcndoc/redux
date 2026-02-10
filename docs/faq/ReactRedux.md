---
id: react-redux
title: React Redux
sidebar_label: React Redux
---

## Redux 常见问题：React Redux

### 为什么我要使用 React-Redux？

Redux 本身是一个独立的库，可以和任何 UI 层或框架一起使用，包括 React、Angular、Vue、Ember 以及原生 JS。虽然 Redux 和 React 通常一起使用，但它们彼此独立。

如果你在任何 UI 框架中使用 Redux，通常会使用一个“UI 绑定”库，将 Redux 和你的 UI 框架连接起来，而不是直接从你的 UI 代码中操作 store。

**React-Redux 是官方的 Redux 与 React 的 UI 绑定库**。如果你同时使用 Redux 和 React，你应该使用 React-Redux 来绑定这两个库。

虽然也可以手写 Redux store 的订阅逻辑，但这会非常重复。此外，要优化 UI 性能还需要复杂的逻辑。

订阅 store、检查数据更新并触发重新渲染的过程可以变得更通用且可复用。**像 React-Redux 这样的 UI 绑定库处理 store 交互逻辑，因此你无需自己写这部分代码。**

总体来说，React-Redux 鼓励良好的 React 架构，并帮你实现复杂的性能优化。同时它会及时更新，支持 Redux 和 React 的最新 API 变化。

#### 详细信息

**文档**

- **[React-Redux 文档：为什么使用 React-Redux？](https://react-redux.js.org/introduction/why-use-react-redux)**

### 为什么我的组件没有重新渲染，或者我的 mapStateToProps 没有被调用？

最常见导致组件在派发 action 后不重新渲染的原因是意外地直接修改了你的 state。Redux 期望你的 reducer 以“不变式”的方式更新 state，也就是说，总是复制数据，基于副本来做修改。如果 reducer 返回了相同的对象引用，即使内部内容改变了，Redux 也认为没有改变。同样，React Redux 为了优化性能，会在 `shouldComponentUpdate` 中做浅层相等性引用检查，如果所有引用都相同，`shouldComponentUpdate` 返回 `false`，组件不会更新。

重要的是，一旦更新了嵌套的值，必须返回包含该值的所有上一级对象的新副本。如果你有 `state.a.b.c.d`，且想更新 `d`，你也必须返回 `c`、`b`、`a` 和 `state` 的新副本。这个[状态树修改示意图](https://miro.medium.com/v2/resize:fit:1400/1*87dJ5EB3ydD7_AbhKb4UOQ.png)演示了树深处的更改需要沿着树向上修改。

注意，“不变式更新数据”**不**意味着你必须使用 [Immer](https://github.com/immerjs/immer)，虽然那是一个选项。你可以用多种方式让普通 JS 对象和数组做不变式更新：

- 使用类似 `Object.assign()` 或 `_.extend()` 的函数复制对象，以及数组的 `slice()` 和 `concat()`
- ES2015 的数组展开运算符，以及 ES2018 的类似对象展开运算符
- 使用封装了不变式更新逻辑的工具库，简化操作

#### 详细信息

**文档**

- [故障排除](../usage/Troubleshooting.md)
- [React Redux: 故障排除](https://react-redux.js.org/troubleshooting)
- [使用 Redux：组织 Reducer - 前置概念](../usage/structuring-reducers/PrerequisiteConcepts.md)
- [使用 Redux：组织 Reducer - 不变式更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)

**文章**

- [使用不可变数据与 React 的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)
- [React/Redux 相关链接：不可变数据](https://github.com/markerikson/react-redux-links/blob/master/immutable-data.md)

**讨论**

- [#1262：不可变数据 + 性能不佳](https://github.com/reduxjs/redux/issues/1262)
- [React Redux #235：用于更新组件的谓词函数](https://github.com/reduxjs/react-redux/issues/235)
- [React Redux #291：dispatch 后 mapStateToProps 是否每次都会被调用？](https://github.com/reduxjs/react-redux/issues/291)
- [Stack Overflow：Redux 中更简洁/更短的嵌套状态更新方法？](https://stackoverflow.com/questions/35592078/cleaner-shorter-way-to-update-nested-state-in-redux)
- [Gist：状态变更](https://gist.github.com/amcdnl/7d93c0c67a9a44fe5761#gistcomment-1706579)

### 为什么我的组件重渲染太频繁？

React Redux 实现了多种优化，保证你的组件只在真正需要时才重新渲染。其中之一是对由 `connect` 传入的 `mapStateToProps` 和 `mapDispatchToProps` 生成的合并 props 对象做浅层相等性检查。不幸的是，如果每次调用 `mapStateToProps` 都创建新的数组或对象实例，浅层相等性检查就无能为力。

一个常见示例是映射 ID 数组并返回匹配的对象引用，比如：

```js
const mapStateToProps = state => {
  return {
    objects: state.objectIds.map(id => state.objects[id])
  }
}
```

即使数组里的对象引用没有变，但数组本身是新创建的引用，浅层相等性检查会失败，React Redux 会重新渲染包装的组件。

可以通过把对象数组存入 reducer 的 state，或使用 [Reselect](https://github.com/reduxjs/reselect) 缓存映射数组，或手写 `shouldComponentUpdate` 并用类似 `_.isEqual` 函数做深入比较来解决额外的重渲染问题。注意不要让自定义的 `shouldComponentUpdate()` 比渲染本身还耗性能！一定用性能分析工具验证你的性能假设。

对于未连接的组件，请检查传入的 props。一个常见问题是父组件在 render 中重新绑定回调函数，如 `<Child onClick={this.handleClick.bind(this)} />`，这会每次父组件渲染都创建新的函数引用。通常建议只在父组件构造函数中绑定一次回调。

#### 详细信息

**文档**

- [常见问题：性能 - 扩展性](./Performance.md#performance-scaling)

**文章**

- [深入探讨 React 性能调试](https://benchling.engineering/a-deep-dive-into-react-perf-debugging-fd2063f5a667)
- [React.js 纯渲染性能反模式](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f)
- [用 Reselect 改进 React 和 Redux 性能](https://rangle.io/blog/react-and-redux-performance-with-reselect/)
- [封装 Redux 状态树](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
- [React/Redux 相关链接：React/Redux 性能](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md)

**讨论**

- [Stack Overflow：React Redux 应用能像 Backbone 一样扩展吗？](https://stackoverflow.com/questions/34782249/can-a-react-redux-app-really-scale-as-well-as-say-backbone-even-with-reselect)

**库**

- [Redux 附加库目录：DevTools - 组件更新监控](https://github.com/markerikson/redux-ecosystem-links/blob/master/devtools.md#component-update-monitoring)

### 如何加速我的 `mapStateToProps`？

虽然 React Redux 会尽量减少调用 `mapStateToProps` 的次数，但确保 `mapStateToProps` 运行迅速且做的工作量最小依然很重要。常用做法是用 [Reselect](https://github.com/reduxjs/reselect) 创建记忆化的“selector”函数。这些选择器可以组合和管道执行，管道后端的选择器只会在其输入变化时运行。这让你可以创建过滤或排序的选择器，确保只有必要时才执行真正耗性能的工作。

#### 详细信息

**文档**

- [使用 Redux：用选择器派生数据](../usage/deriving-data-selectors.md)

**文章**

- [用 Reselect 改进 React 和 Redux 性能](https://rangle.io/blog/react-and-redux-performance-with-reselect/)

**讨论**

- [#815：处理数据结构](https://github.com/reduxjs/redux/issues/815)
- [Reselect #47：记忆化分层选择器](https://github.com/reduxjs/reselect/issues/47)

### 为什么我在连接组件中没有 `this.props.dispatch`？

`connect()` 函数接受两个主要参数，都是可选的。第一个是 `mapStateToProps`，你用它从 store 中拉取数据并作为 props 传给组件。第二个是 `mapDispatchToProps`，你用它利用 store 的 `dispatch` 函数，通常通过创建绑定好的 action 创造者让调用时自动分发 action。

如果调用 `connect()` 时你没有提供 `mapDispatchToProps`，React Redux 会默认提供一个函数，直接把 `dispatch` 作为 prop 返回。这意味着如果你提供了自己的函数，`dispatch` 就**不会自动提供**。如果你仍然需要它作为 prop，就必须在你的 `mapDispatchToProps` 中主动返回它。

#### 详细信息

**文档**

- [React Redux API: connect()](https://react-redux.js.org/api/connect)

**讨论**

- [React Redux #89：我可以用一个 prop 名包裹多个 actionCreators 吗？](https://github.com/reduxjs/react-redux/issues/89)
- [React Redux #145：考虑无论 `mapDispatchToProps` 怎么写都传递 `dispatch`](https://github.com/reduxjs/react-redux/issues/145)
- [React Redux #255：使用 `mapDispatchToProps` 时，`this.props.dispatch` 是 undefined](https://github.com/react-redux/react-redux/issues/255)
- [Stack Overflow：如何用 connect 从 this.props 获得简单的 dispatch？](https://stackoverflow.com/questions/34458261/how-to-get-simple-dispatch-from-this-props-using-connect-w-redux/34458710)

### 我应该只连接顶层组件，还是树中多个组件都连接？

早期 Redux 文档建议只在组件树顶部连接少数几个组件。随着时间推移和实际经验发现，这样的组件架构通常让上层组件对所有后代组件的数据需求知道得太多，且需要传递过多 props，使结构变得混乱。

当前建议的最佳实践是把组件分类为“展示组件”和“容器组件”，并根据实际需要创建连接后的容器组件：

> 在 Redux 示例中过度强调“只有一个顶层容器组件”是个错误。不要把它当作法则。尽量保持展示组件分离。方便时用连接创建容器组件。只要你感觉父组件为了给同类子组件提供数据重复写代码，或父组件了解子组件“私有”的数据或操作太多，就该抽取一个容器组件。

事实上，基准测试显示，连接更多组件通常性能更优于连接更少组件。

总体来看，尝试在可理解的数据流和组件职责划分间找到平衡。

#### 详细信息

**文档**

- [基础知识：UI 和 React](../tutorials/fundamentals/part-5-ui-and-react.md)
- [常见问题：性能 - 扩展性](../faq/Performance.md#performance-scaling)

**文章**

- [展示组件与容器组件](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [高性能 Redux](https://somebody32.github.io/high-performance-redux/)
- [React/Redux 相关链接：架构 - Redux 架构](https://github.com/markerikson/react-redux-links/blob/master/react-redux-architecture.md#redux-architecture)
- [React/Redux 相关链接：性能 - Redux 性能](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md#redux-performance)

**讨论**

- [Twitter：强调“只一个容器”是个错误](https://twitter.com/dan_abramov/status/668585589609005056)
- [#419：推荐的 connect 用法](https://github.com/reduxjs/redux/issues/419)
- [#756：容器组件 vs 展示组件？](https://github.com/reduxjs/redux/issues/756)
- [#1176：只有无状态组件的 Redux+React](https://github.com/reduxjs/redux/issues/1176)
- [Stack Overflow：无状态组件能用 Redux 容器吗？](https://stackoverflow.com/questions/34992247/can-a-dumb-component-use-render-redux-container-component)

### Redux 和 React Context API 有什么区别？

**相似点**

Redux 和 React 的 Context API 都能解决“prop drilling”问题，即允许你不必经过多层组件传递 props。内部上，Redux 使用了 React 的 Context API 来将 store 传递给组件树。

**区别**

使用 Redux，你可以利用[Redux Dev Tools 扩展](https://github.com/reduxjs/redux-devtools/tree/main/extension)，它会自动记录应用的每一个操作，支持时间旅行调试 —— 点击历史操作回到某个状态。Redux 还支持中间件概念，可以在每次 action 分发时绑定自定义函数，例如自动事件日志、拦截特定动作等。

React Context API 是一对组件内部通信机制，隔离无关数据，且允许灵活使用数据，比如可以提供父组件的 state，并可将 context 数据作为 props 传给包裹的组件。

Redux 和 React Context 在数据处理上有本质区别。Redux 把整个应用数据保存在庞大的有状态对象中，通过运行你提供的 reducer 推断数据变化，返回对应的下一状态。React Redux 再优化组件渲染，确保只有数据有变的组件重渲染。Context 本身不持有状态，只是数据的通道。你需要依赖父组件状态来表达数据变化。

#### 详细信息

- [什么时候该用 Redux，什么时候不用](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)
- [Redux VS React Context API](https://daveceddia.com/context-api-vs-redux/)
- [你可能不需要 Redux（但不能被 Hooks 替代）](https://www.simplethread.com/cant-replace-redux-with-hooks/)