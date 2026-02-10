---
id: performance
title: 性能
sidebar_label: 性能
---

## Redux 常见问题解答：性能

### Redux 在性能和架构方面的“扩展”能力如何？

虽然没有唯一的明确答案，但大多数情况下，这都不应该成为问题。

Redux 处理的工作一般分为几个方面：处理中间件和 reducer 中的 action（包括为不可变更新进行对象复制）、在 action 派发后通知订阅者、以及根据状态变化更新 UI 组件。虽然在足够复杂的情况下，这些环节可能成为性能瓶颈，但 Redux 的实现本身并不存在任何固有的缓慢或低效。实际上，特别是 React Redux 针对减少不必要的重渲染做了大量优化，React-Redux v5 相较早期版本就有明显的性能提升。

与其他库相比，Redux 默认出厂可能没有那么高效。为了在 React 应用中获得最大的渲染性能，状态应存储为归一化的结构，应该让许多独立组件都连接到 store，而不是只连接几个，连接的列表组件应将项目 ID 传给连接的子列表项（这样子项可以按 ID 查找自己的数据）。这能最小化整体的渲染量。使用记忆化的 selector 函数也是重要的性能考量。

至于架构方面，经验表明 Redux 适用于不同规模的项目和团队。Redux 目前被数百家公司和数千名开发者使用，在 NPM 上每月有数十万次安装。一位开发者报告说：

> 在规模方面，我们有大约 500 个 action 类型，约 400 个 reducer case，约 150 个组件，5 个中间件，约 200 个 actions，约 2300 个测试

#### 更多信息

**文档**

- [使用 Redux：构建 Reducers - 归一化状态形状](../usage/structuring-reducers/NormalizingStateShape.md)

**文章**

- [如何扩展 React 应用](https://www.smashingmagazine.com/2016/09/how-to-scale-react-applications/)（配套演讲：[Scaling React Applications](https://vimeo.com/168648012)）
- [高性能 Redux](https://somebody32.github.io/high-performance-redux/)
- [使用 Reselect 改善 React 和 Redux 性能](https://blog.rangle.io/react-and-redux-performance-with-reselect/)
- [封装 Redux 状态树](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
- [React/Redux 链接：性能 - Redux](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md#redux-performance)

**讨论**

- [#310：谁在用 Redux？](https://github.com/reduxjs/redux/issues/310)
- [#1751：关于大集合的性能问题](https://github.com/reduxjs/redux/issues/1751)
- [React Redux #269：Connect 可用自定义订阅方法](https://github.com/reduxjs/react-redux/issues/269)
- [React Redux #407：改写 connect 以提供高级 API](https://github.com/reduxjs/react-redux/issues/407)
- [React Redux #416：改写 connect 以提升性能和扩展性](https://github.com/reduxjs/react-redux/pull/416)
- [Redux vs MobX TodoMVC 基准测试：#1](https://github.com/mweststrate/redux-todomvc/pull/1)
- [Reddit：保存初始状态的最佳位置？](https://www.reddit.com/r/reactjs/comments/47m9h5/whats_the_best_place_to_keep_the_initial_state/)
- [Reddit：设计单页应用的 Redux 状态](https://www.reddit.com/r/reactjs/comments/48k852/help_designing_redux_state_for_a_single_page/)
- [Reddit：大型状态对象的 Redux 性能问题？](https://www.reddit.com/r/reactjs/comments/41wdqn/redux_performance_issues_with_a_large_state_object/)
- [Reddit：用于超大规模应用的 React/Redux](https://www.reddit.com/r/javascript/comments/49box8/reactredux_for_ultra_large_scale_apps/)
- [Twitter：Redux 扩展](https://twitter.com/NickPresta/status/684058236828266496)
- [Twitter：Redux vs MobX 基准图 - Redux 状态形状重要](https://twitter.com/dan_abramov/status/720219615041859584)
- [Stack Overflow：如何优化嵌套组件 props 的小更新？](https://stackoverflow.com/questions/37264415/how-to-optimize-small-updates-to-props-of-nested-component-in-react-redux)
- [聊天记录：React/Redux 性能 - 更新 10K 条待办列表](https://gist.github.com/markerikson/53735e4eb151bc228d6685eab00f5f85)
- [聊天记录：React/Redux 性能 - 单个连接 vs 多个连接](https://gist.github.com/markerikson/6056565dd65d1232784bf42b65f8b2ad)

### 每个 action 都调用“所有 reducer”不会很慢吗？

重要的是要注意，Redux Store 实际上只有一个 reducer 函数。Store 会将当前状态和派发的 action 传给该 reducer 函数，并让它进行相应处理。

显然，试图在单个函数中处理所有可能的 action，从函数大小和可读性上来说都不具备扩展性，因此把实际工作拆分成多个函数，由顶层 reducer 调用是合理的。常见的做法是为状态树中特定键下的状态片段建立独立的子 reducer 函数。Redux 自带的 `combineReducers()` 就是实现这种方式的多种方案之一。同时强烈建议将 store 状态保持为扁平且归一化的结构。最终，你可以按照自己的喜好组织 reducer 逻辑。

即使你有多个 reducer 函数组合起来，状态也深度嵌套，reducer 的速度通常也不会是问题。JavaScript 引擎每秒能运行大量函数调用，大多数 reducer 只是简单的 `switch` 语句，默认对大多数 action 返回现有状态。

如果你确实担心 reducer 性能，可以使用如 [redux-ignore](https://github.com/omnidan/redux-ignore) 或 [reduxr-scoped-reducer](https://github.com/chrisdavies/reduxr-scoped-reducer) 的工具，确保只有特定 reducer 监听特定 action。也可以用 [redux-log-slow-reducers](https://github.com/michaelcontento/redux-log-slow-reducers) 做性能基准测试。

#### 更多信息

**讨论**

- [#912：提案：action 过滤工具](https://github.com/reduxjs/redux/issues/912)
- [#1303：大型 Store 和频繁更新的 Redux 性能](https://github.com/reduxjs/redux/issues/1303)
- [Stack Overflow：Redux 应用中的状态具有 reducer 名称属性](https://stackoverflow.com/questions/35667775/state-in-redux-react-app-has-a-property-with-the-name-of-the-reducer/35674297)
- [Stack Overflow：Redux 如何处理深度嵌套的模型？](https://stackoverflow.com/questions/34494866/how-does-redux-deals-with-deeply-nested-models/34495397)

### 我必须在 reducer 中深拷贝状态吗？复制状态会不会很慢？

不可变更新状态通常是浅拷贝，不是深拷贝。浅拷贝比深拷贝快得多，因为复制的对象和字段更少，实际上就是指针的移动。

而且，深拷贝状态会为每个字段创建新的引用。React-Redux 的 `connect` 函数依赖引用比较来判断数据是否改变，这意味着即使数据没有实质变化，UI 组件也会被迫不必要地重新渲染。

不过，你确实需要为受影响的每个嵌套层级创建副本和更新对象。虽然不算特别昂贵，但这也是你应尽量保持状态归一化和扁平化的重要原因。

> 常见误区：你需要深度克隆状态。事实是：如果某部分不变，就保持原引用不变！

#### 更多信息

**文档**

- [使用 Redux：构建 Reducers - 先决概念](../usage/structuring-reducers/PrerequisiteConcepts.md)
- [使用 Redux：构建 Reducers - 不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)

**讨论**

- [#454：在 reducer 中处理大状态](https://github.com/reduxjs/redux/issues/454)
- [#758：为什么不能修改状态？](https://github.com/reduxjs/redux/issues/758)
- [#994：更新嵌套实体时如何减少样板代码？](https://github.com/reduxjs/redux/issues/994)
- [Twitter：常见误区 - 深拷贝](https://twitter.com/dan_abramov/status/688087202312491008)

### 如何减少 store 更新事件的次数？

Redux 会在每个成功派发的 action 后通知订阅者（即 action 到达 store 并被 reducer 处理后）。有时，尤其当 action 创建者连续派发多个不同 action 时，减少调用订阅者的次数会很有用。

有几个插件以不同方式添加了批处理能力，比如：[redux-batched-actions](https://github.com/tshelburne/redux-batched-actions)（高阶 reducer，让你像处理单个 action 一样派发多个，并在 reducer 解包），[redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe)（store 增强器，可对多次派发的订阅调用进行防抖），或 [redux-batch](https://github.com/manaflair/redux-batch)（store 增强器，处理数组派发，只触发一次订阅者通知）。

对于 React-Redux，从 [React-Redux v7](https://github.com/reduxjs/react-redux/releases/tag/v7.0.1) 开始提供了新的 `batch` 公共 API，帮助在非 React 事件处理器中派发多个 action 时，将 React 重新渲染次数降到最低。它包装了 React 的 `unstable_batchedUpdate()` API，允许在同一事件循环中合并多个 React 更新为单次渲染。React 自身事件处理回调内部已使用该机制。这个 API 属于如 ReactDOM 和 React Native 这样的渲染包，而非 React 核心。

由于 React-Redux 需同时支持 ReactDOM 和 React Native，我们在构建时已处理正确导入该 API，并重新导出为 `batch()`。你可以这样用，确保多次在 React 外派发的 action 只触发一次更新：

```js
import { batch } from 'react-redux'

function myThunk() {
  return (dispatch, getState) => {
    // 这里只会导致一次合并的重渲染，而非两次
    batch(() => {
      dispatch(increment())
      dispatch(increment())
    })
  }
}
```

#### 更多信息

**讨论**

- [#125：避免级联渲染的策略](https://github.com/reduxjs/redux/issues/125)
- [#542：想法：批处理 actions](https://github.com/reduxjs/redux/issues/542)
- [#911：批处理 actions](https://github.com/reduxjs/redux/issues/911)
- [#1813：用循环支持派发数组](https://github.com/reduxjs/redux/pull/1813)
- [React Redux #263：派发数百个 action 时的巨大性能问题](https://github.com/reduxjs/react-redux/issues/263)
- [React-Redux #1177：路线图：v6，Context，订阅和 Hooks](https://github.com/reduxjs/react-redux/issues/1177)

**库**

- [Redux 附加组件目录：Store - 变更订阅](https://github.com/markerikson/redux-ecosystem-links/blob/master/store.md#store-change-subscriptions)

### 拥有“一棵状态树”会导致内存问题吗？派发大量 action 会占用内存吗？

首先，就原始内存使用而言，Redux 与任何其它 JavaScript 库没有区别。唯一不同的是所有对象引用被嵌套在一棵树中，而不是像 Backbone 那样保存在各独立模型实例中。第二，典型 Redux 应用可能比等效 Backbone 应用内存使用更少，因为 Redux 鼓励使用普通 JS 对象和数组，而非创建模型和集合实例。最后，Redux 只保留某一时刻的单一状态树引用。未被引用的对象会被垃圾回收。

Redux 本身不存储 action 历史，但 Redux DevTools 会存储 action 以支持重放，但它们通常只在开发时启用，生产环境不使用。

#### 更多信息

**文档**

- [Redux 基础：异步逻辑和数据流](../tutorials/fundamentals/part-6-async-logic.md)

**讨论**

- [Stack Overflow：有没有方法“提交” Redux 状态以释放内存？](https://stackoverflow.com/questions/35627553/is-there-any-way-to-commit-the-state-in-redux-to-free-memory/35634004)
- [Stack Overflow：Redux store 会导致内存泄漏吗？](https://stackoverflow.com/questions/39943762/can-a-redux-store-lead-to-a-memory-leak/40549594#40549594)
- [Stack Overflow：Redux 和所有应用状态](https://stackoverflow.com/questions/42489557/redux-and-all-the-application-state/42491766#42491766)
- [Stack Overflow：受控组件的内存使用问题](https://stackoverflow.com/questions/44956071/memory-usage-concern-with-controlled-components?noredirect=1&lq=1)
- [Reddit：保存初始状态的最佳位置？](https://www.reddit.com/r/reactjs/comments/47m9h5/whats_the_best_place_to_keep_the_initial_state/)

### 缓存远程数据会导致内存问题吗？

浏览器中运行的 JavaScript 应用可用的内存有限。当缓存的数据量接近可用内存时，会导致性能问题。通常当缓存数据异常庞大或会话异常长时容易出现这种情况。尽管需要注意这些潜在问题，但这不应该阻止你合理高效地缓存数据。

下面几种方案有助于高效缓存远程数据：

首先，只缓存用户需要的数据。如果应用展示分页记录列表，不必缓存整个集合，而只缓存用户当前可见的内容，并在用户需要时增加缓存。

其次，尽可能缓存记录的简略形式。某些数据对用户无关紧要，若应用不依赖这些数据，则可从缓存中剔除。

第三，只缓存单一副本的记录。尤其当记录包含其他记录拷贝时，应缓存每条记录的唯一副本，并将嵌套副本替换为引用。这就是归一化。归一化是存储关系数据的推荐方案（[原因详见](../usage/structuring-reducers/NormalizingStateShape.md#designing-a-normalized-state)），包括对内存使用效率的提升。

#### 更多信息

**讨论**

- [Stack Overflow：如何为带列表/详情视图和分页的应用选择 Redux 状态形状？](https://stackoverflow.com/questions/33940015/how-to-choose-the-redux-state-shape-for-an-app-with-list-detail-views-and-pagina)
- [Twitter：…关于状态树中“太多数据”的担忧…](https://twitter.com/acemarke/status/804071531844423683)
- [高级 Redux 实体归一化](https://medium.com/@dcousineau/advanced-redux-entity-normalization-f5f1fe2aefc5)