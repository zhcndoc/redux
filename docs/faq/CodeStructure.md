---
id: code-structure
title: 代码结构
sidebar_label: 代码结构
---

import { DetailedExplanation } from '../components/DetailedExplanation'

## Redux 常见问题：代码结构

## 我的文件结构应该是什么样的？我应该如何在项目中组织 action creators 和 reducers？selectors 应该放在哪里？

由于 Redux 仅仅是一个数据存储库，它并没有对项目应该如何组织有直接的规定。不过，大多数 Redux 开发者倾向于采用以下一些常见的模式：

- Rails 风格：将 “actions”、“constants”、“reducers”、“containers” 和 “components” 分别放在不同的文件夹
- “功能文件夹” / “领域” 风格：按功能或领域划分文件夹，可能在每个文件夹内按文件类型再细分子文件夹
- “Ducks/Slices”：类似领域风格，但明确将 actions 和 reducers 结合起来，通常会在同一文件中定义它们

一般建议 selectors 与 reducers 一起定义并导出，然后在其他地方重用（比如在 `mapStateToProps` 函数中，在异步 action creators 或 sagas 中使用），以便将所有知道状态树具体形状的代码都放在 reducer 文件中。

:::tip

**我们特别推荐将逻辑组织成“功能文件夹”，将某个功能相关的所有 Redux 逻辑放在一个“slice/ducks”文件中**。

示例请参见本节：

<DetailedExplanation title="详细说明：示例文件结构">
一个示例文件结构可能如下所示：

- `/src`
  - `index.tsx`：入口文件，渲染 React 组件树
  - `/app`
    - `store.ts`：store 配置
    - `rootReducer.ts`：根 reducer（可选）
    - `App.tsx`：根 React 组件
  - `/common`：hooks、通用组件、工具函数等
  - `/features`：包含所有“功能文件夹”
    - `/todos`：单个功能文件夹
      - `todosSlice.ts`：Redux reducer 逻辑及相关 actions
      - `Todos.tsx`：React 组件

`/app` 包含整个应用的设置和依赖其他文件夹的布局代码。

`/common` 包含真正通用且可复用的工具和组件。

`/features` 中的文件夹包含与某个具体功能相关的所有功能代码。在这个示例里，`todosSlice.ts` 是一个“duck”风格文件，包含对 RTK 的 `createSlice()` 函数的调用，并导出切片 reducer 和 action creators。

</DetailedExplanation>

:::

虽然最终你如何在磁盘上组织代码并不重要，但需要牢记 actions 和 reducers 不应被孤立看待。完全可以（且鼓励）在某个文件夹定义的 reducer 响应在另一个文件夹定义的 action。

#### 进一步信息

**文档**

- [风格指南：以功能文件夹单文件逻辑组织](../style-guide/style-guide.md##structure-files-as-feature-folders-with-single-file-logic)
- [Redux 基础教程：应用结构](../tutorials/essentials/part-2-app-structure.md)
- [常见问题：Actions - “reducers 和 actions 之间是 1:1 对应吗？”](./Actions.md#actions-reducer-mappings)

**相关文章**

- [如何扩展 React 应用](https://www.smashingmagazine.com/2016/09/how-to-scale-react-applications/)（配套演讲：[Scaling React Applications](https://vimeo.com/168648012)）
- [Redux 最佳实践](https://medium.com/lexical-labs-engineering/redux-best-practices-64d59775802e)
- [结构化 (Redux) 应用的规则](http://jaysoo.ca/2016/02/28/organizing-redux-application/)
- [React/Redux 应用更好的文件结构](https://marmelab.com/blog/2015/12/17/react-directory-structure.html)
- [组织代码的四种策略](https://medium.com/@msandin/strategies-for-organizing-code-2c9d690b6f33)
- [封装 Redux 状态树](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
- [Redux Reducer/Selector 非对称性](https://randycoulman.com/blog/2016/09/20/redux-reducer-selector-asymmetry/)
- [模块化 Reducers 和 Selectors](https://randycoulman.com/blog/2016/09/27/modular-reducers-and-selectors/)
- [我在 React/Redux 上追寻可维护项目结构的历程](https://medium.com/@mmazzarolo/my-journey-toward-a-maintainable-project-structure-for-react-redux-b05dfd999b5)
- [React/Redux 相关链接：架构 - 项目文件结构](https://github.com/markerikson/react-redux-links/blob/master/react-redux-architecture.md#project-file-structure)

**讨论**

- [#839：强调在 reducers 旁定义 selectors](https://github.com/reduxjs/redux/issues/839)
- [#943：Reducer 查询](https://github.com/reduxjs/redux/issues/943)
- [React Boilerplate #27：应用结构](https://github.com/mxstbr/react-boilerplate/issues/27)
- [Stack Overflow：如何组织 Redux 组件/容器](https://stackoverflow.com/questions/32634320/how-to-structure-redux-components-containers/32921576)
- [Twitter：没有最终的 Redux 文件结构](https://twitter.com/dan_abramov/status/783428282666614784)

## 我应该如何在 reducers 和 action creators 之间拆分逻辑？“业务逻辑”应该放哪里？

并没有唯一清晰的答案告诉你哪些逻辑应该放在 reducer，哪些应该放在 action creator。一些开发者倾向于编写“肥”的 action creators，搭配“瘦”的 reducers，它们只是简单地把 action 中的数据合并进对应状态。另一些则倾向于将 actions 尽可能保持精简，尽量减少在 action creator 中使用 `getState()`。（本问题中，其他异步做法比如 sagas 和 observables 都归类为“action creator”范畴。）

将更多逻辑放在 reducers 里可能有如下几个好处。首先，action 类型将更加语义化和有意义（比如 `"USER_UPDATED"` 代替 `"SET_STATE"`）。其次，将更多逻辑放在 reducers 里可以使得更多功能受益于时间旅行调试。

下面这条评论很好地总结了这种二分法：

> 问题在于应该把什么放到 action creator，什么放到 reducer 里，是选择“肥”action 还是“瘦”action。如果把所有逻辑都放到 action creator，你最终会得到“肥”action objects，它们基本上声明对状态的更新。Reducers 会变得简单、纯粹，只是做加、删、改的操作，且易于组合。但你的业务逻辑大多不会在这里体现。
> 如果把更多逻辑放到 reducer，你会得到“瘦”action objects，业务逻辑大多集中在一个地方，但 reducer 变得难以组合，因为你可能需要其他分支的信息。你最终会得到大型 reducer 或者需要从更高状态层级传入附加参数的 reducer。

:::tip

**我们建议尽可能多的逻辑放到 reducers 中**。有时你可能需要一些逻辑在 action 创建之前帮忙准备数据，但大部分工作应该由 reducers 来完成。

:::

#### 进一步信息

**文档**

- [风格指南：尽可能多的逻辑放到 reducers](../style-guide/style-guide.md#put-as-much-logic-as-possible-in-reducers)
- [风格指南：将 Actions 建模为“事件”，而非“设置器”](../style-guide/style-guide.md#model-actions-as-events-not-setters)

**相关文章**

- [我应该把业务逻辑放到 React/Redux 应用的哪里？](https://medium.com/@jeffbski/where-do-i-put-my-business-logic-in-a-react-redux-application-9253ef91ce1)
- [如何扩展 React 应用](https://www.smashingmagazine.com/2016/09/how-to-scale-react-applications/)
- [Redux 的道法自然，第二部分 - 实践与理念。肥瘦 reducers。](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/#thick-and-thin-reducers)

**讨论**

- [将过多逻辑放入 action creators 可能影响调试](https://github.com/reduxjs/redux/issues/384#issuecomment-127393209)
- [#384：reducer 中的逻辑越多，时间旅行回放越完整](https://github.com/reduxjs/redux/issues/384#issuecomment-127393209)
- [#1165：业务逻辑 / 校验放哪里？](https://github.com/reduxjs/redux/issues/1165)
- [#1171：关于 action-creators、reducers 和 selectors 的最佳实践建议](https://github.com/reduxjs/redux/issues/1171)
- [Stack Overflow：如何在 action creator 中访问 Redux state？](https://stackoverflow.com/questions/35667249/accessing-redux-state-in-an-action-creator/35674575)
- [#2796：厘清“业务逻辑”的涵义](https://github.com/reduxjs/redux/issues/2796#issue-289298280)
- [Twitter：摒弃不明确的术语……](https://twitter.com/FwardPhoenix/status/952971237004926977)

## 为什么要使用 action creators？

Redux 并不要求必须使用 action creators。你可以用任何适合你的方式创建 actions，包括简单地把对象字面量传递给 `dispatch`。action creators 来源于 [Flux 架构](https://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html#actions-and-actioncreators)，并被 Redux 社区采纳，因为它们带来了若干优势。

action creators 更易于维护。对一个 action 的更新可以集中操作，一处修改全局生效。所有该 action 的实例都确保形状相同且拥有相同的默认值。

action creators 可测试。内联 action 的正确性必须手动验证，而 action creator 像普通函数一样，可以编写一次测试自动运行。

action creators 易于文档化。action creator 的参数体现了 action 的依赖。将 action 定义集中起来，为注释和文档提供了便捷位置。内联的 action 难以捕获和传达这些信息。

action creators 是更强大的抽象层。创建一个 action 往往需对数据进行转换或执行 AJAX 请求。action creator 提供了统一接口隐藏这些细节。这一抽象让组件发送 action 时不必关心其创建过程的复杂性。

#### 进一步信息

**相关文章**

- [惯用 Redux：为什么使用 action creators？](https://blog.isquaredsoftware.com/2016/10/idiomatic-redux-why-use-action-creators/)

**讨论**

- [Reddit：Redbox - 简化 Redux action 创建](https://www.reddit.com/r/reactjs/comments/54k8js/redbox_redux_action_creation_made_simple/d8493z1/?context=4)

## websocket 及其他持久连接应该放在哪里？

Middleware 是在 Redux 应用中处理 websocket 等持久连接的正确位置，原因如下：

- Middleware 生命周期与应用相同
- 类似于 store，整个应用通常只需要一个连接实例
- Middleware 能监听所有 dispatch 的 action，也能自己 dispatch action。这样 middleware 可以将 dispatch 的 action 转成 websocket 发送的消息，收到 websocket 消息时再 dispatch 新的 action
- websocket 连接实例不可序列化，因此不适合放到 store state 中

请参阅[这个示例](https://gist.github.com/markerikson/3df1cf5abbac57820a20059287b4be58)了解如何让 socket middleware 和 Redux action 交互。

市面上有许多 websocket 及类似连接的 middleware 现成可用，见下方链接。

**库**

- [Middleware：Socket 和适配器](https://github.com/markerikson/redux-ecosystem-links/blob/master/middleware-sockets-adapters.md)

## 如何在非组件文件中使用 Redux store？

每个应用应该只有唯一一个 Redux store，从应用架构角度看，它是单例。当和 React 一起使用时，store 通过在根组件 `<App>` 外层包裹 `<Provider store={store}>` 实现注入，因此只有应用启动配置代码需要直接引入 store。

但有时代码库的其他部分也需要与 store 交互。

**你应该避免在其他代码文件中直接导入 store**。虽然有时候可以用，但常常会导致循环引用错误。

一些解决方案包括：

- 将依赖 store 的逻辑写成 thunk，在组件中 dispatch 该 thunk
- 将 `dispatch` 的引用从组件传给相关函数作为参数
- 将逻辑写成 middleware，在 store 配置时加入
- 在应用创建时，把 store 实例注入相关文件

一个常见场景是在 Axios 拦截器中读取存储在 Redux state 中的 API 授权信息（比如 token）。拦截器文件需要引用 `store.getState()`，但同时要被 API 层文件导入，这会导致循环导入。

你可以在拦截器文件中导出一个 `injectStore` 函数，如下：

```js title="common/api.js"
let store

export const injectStore = _store => {
  store = _store
}

axiosInstance.interceptors.request.use(config => {
  config.headers.authorization = store.getState().auth.token
  return config
})
```

然后在入口文件中将 store 注入 API 配置：

```js title="index.js"
import store from './app/store'
import { injectStore } from './common/api'
injectStore(store)
```

这样，只有应用启动配置部分需要导入 store，避免了文件依赖图中的循环依赖。