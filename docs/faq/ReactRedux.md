---
id: react-redux
title: React Redux
sidebar_label: React Redux
---

## Redux 常见问题：React Redux

### 为什么我要使用 React-Redux？ {#why-should-i-use-react-redux}

Redux 本身是一个独立的库，可以和任何 UI 层或框架一起使用，包括 React、Angular、Vue、Ember 以及原生 JS。虽然 Redux 和 React 通常一起使用，但它们彼此独立。

如果你在任何 UI 框架中使用 Redux，通常会使用一个“UI 绑定”库，将 Redux 和你的 UI 框架连接起来，而不是直接从你的 UI 代码中操作 store。

**React-Redux 是官方的 Redux 与 React 的 UI 绑定库**。如果你同时使用 Redux 和 React，你应该使用 React-Redux 来绑定这两个库。

虽然也可以手写 Redux store 的订阅逻辑，但这会非常重复。此外，要优化 UI 性能还需要复杂的逻辑。

订阅 store、检查数据更新并触发重新渲染的过程可以变得更通用且可复用。**像 React-Redux 这样的 UI 绑定库处理 store 交互逻辑，因此你无需自己写这部分代码。**

总体来说，React-Redux 鼓励良好的 React 架构，并帮你实现复杂的性能优化。同时它会及时更新，支持 Redux 和 React 的最新 API 变化。

#### 详细信息

**文档**

- **[React-Redux 文档：为什么使用 React-Redux？](/react-redux/introduction/why-use-react-redux)**
- [React-Redux 文档：Hooks](/react-redux/api/hooks)

### 为什么我的组件没有重新渲染？ {#why-isnt-my-component-re-rendering}

`useSelector` 会在每个 action 派发后运行 selector，并通过 `===` 将新结果与上一次的结果比较。如果两个结果引用相同，组件就不会重新渲染。因此，组件没有更新时，通常是因为选中的值并未真正改变引用。

**最常见的原因是 reducer 修改了状态，而没有返回新值。** 如果 reducer 执行 `state.todos.push(newTodo)` 后返回 `state`，那么 `todos` 数组的引用仍与之前相同，应用中的 `useSelector(state => state.todos)` 都会认为“没有变化”。Redux 本身不会发现这一点，但 Redux Toolkit 的 `configureStore` 会在开发环境添加不可变性检查中间件，reducer 修改参数时会抛出错误。

如果使用 `createSlice` 编写 reducer，这个问题大多会自动消失：case reducer 在 Immer 中运行，因此 `state.todos.push(newTodo)` 会转换为正确的不可变更新。状态修改问题主要出现在手写 reducer，或在 reducer_之外_修改数据时（例如在组件中对从 store 读取的数组排序）。

其他需要检查的情况：

- **Selector 读取了错误字段。** 使用 TypeScript 和[类型化 hooks](#how-do-i-type-useselector-and-usedispatch)后，这会成为编译错误，而不是悄悄得到 `undefined`。
- **组件在 `<Provider>` 外部渲染**，或处于另一个 store 实例的 `<Provider>` 下。Portal 和测试渲染器中较容易出现这种情况。
- **Action 从未派发**，或被派发给了另一个 store。请检查 Redux DevTools 中的 action 列表。
- **状态树更上层的不可变性遭到破坏。** 要不可变地更新 `state.a.b.c`，`c`、`b`、`a` 和根对象都需要使用新引用。Immer 会替你处理；手写展开复制时则必须逐层完成。

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Todo {
  id: string
  text: string
  completed: boolean
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    todoAdded(state, action: PayloadAction<Todo>) {
      // Fine inside createSlice: Immer turns this into an immutable update,
      // so the todos array gets a new reference and subscribers re-render.
      state.push(action.payload)
    }
  }
})
```

#### 详细信息

**文档**

- [故障排查](../usage/Troubleshooting.md)
- [Redux Toolkit：不可变性中间件](/toolkit/api/immutabilityMiddleware)
- [使用 Redux：结构化 Reducer - 先决概念](../usage/structuring-reducers/PrerequisiteConcepts.md)
- [使用 Redux：结构化 Reducer - 不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [常见问题：不可变数据](./ImmutableData.md)

### 为什么我的组件重渲染太频繁？ {#why-is-my-component-re-rendering-too-often}

使用 `useSelector` 的组件渲染次数超出预期，通常有两个不同原因，解决方法也不同。

**Selector 每次运行都会返回新引用。** `useSelector` 使用 `===` 比较结果，因此每次调用都会创建新对象或数组的 selector 总会显得“发生了变化”，组件会在_每个_ action 派发后重新渲染，无论更新的是哪个状态切片。（示例中的 `useAppSelector` 是[如何为 `useSelector` 和 `useDispatch` 添加类型？](#how-do-i-type-useselector-and-usedispatch)一节介绍的预设类型 hook。）

```ts
// Re-renders on every action: `.map()` always returns a new array
const todoObjects = useAppSelector(state =>
  state.todos.ids.map(id => state.todos.entities[id])
)

// Re-renders on every action: the object literal is new each call
const { count, user } = useAppSelector(state => ({
  count: state.counter.value,
  user: state.auth.user
}))
```

React-Redux 会在开发环境检查这种情况。`useSelector` 首次运行时，会使用同一状态调用 selector 两次；如果两次结果不相等，就会记录警告（“Selector ... returned a different result when called with the same parameters”）。如果看到此警告，可以采用以下一种修复方式：

- 从 store 中选择原始值，并在组件中派生数据（计算开销较大时可使用 `useMemo`）。
- 使用 `createSelector` 对 selector 进行记忆化，使其仅在输入变化时返回新引用。
- 如果 selector 返回的扁平对象只包含基本类型，可将 `shallowEqual` 作为相等性函数传入。

各方法示例请参阅[如何从 store 中选择多个值？](#how-do-i-select-multiple-values-from-the-store)。

**父组件重新渲染了。** `useSelector` 只控制由 store 更新引起的重新渲染。如果父组件渲染，React 也会渲染它的子组件，无论 props 或选中的状态是否变化。这是 React 的正常行为，与 Redux 无关。如果组件开销较大而父组件经常渲染，可以用 `React.memo` 包裹它，并确保传入的 props 引用稳定（回调用 `useCallback` 包裹，对象用 `useMemo` 包裹）。

还有两点需要了解：

- 选择整个根状态（`useSelector(state => state)`）会使组件在每个 action 后重新渲染。React-Redux 也会在开发环境对此发出警告。应只选择组件所需的最小状态片段。
- 同一组件中的多个 `useSelector` 即使都因一次 dispatch 而变化，最终也只会渲染一次，因为 React 会批处理更新。

#### 详细信息

**文档**

- [React Redux：Hooks - 开发模式检查](/react-redux/api/hooks#development-mode-checks)
- [React: `memo`](https://react.dev/reference/react/memo)
- [常见问题：性能 - Redux 的扩展能力如何？](./Performance.md#how-well-does-redux-scale-in-terms-of-performance-and-architecture)
- [使用 Redux：使用 Selector 派生数据](../usage/deriving-data-selectors.md)

**文章**

- [React 渲染行为（基本）完整指南](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)
- [使用 Reselect 提升 React 和 Redux 的性能](https://rangle.io/blog/react-and-redux-performance-with-reselect/)

### 如何从 store 中选择多个值？ {#how-do-i-select-multiple-values-from-the-store}

多次调用 `useSelector`。每次调用都会单独订阅并返回一个值；对基本类型以及已存在于 store 中的对象引用，`===` 都能正确比较：

```ts
const count = useAppSelector(state => state.counter.value)
const user = useAppSelector(state => state.auth.user)
```

这是默认建议，代码清晰，而且在一个组件中多次调用 `useSelector` 不会带来明显的性能开销。

如果需要派生组合值，或希望复用一个 selector，可以使用 `createSelector` 对其记忆化（Redux Toolkit 和 Reselect 都导出了该函数）。只有某个输入 selector 返回新值时，输出函数才会重新运行，因此其间结果引用保持稳定：

```ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const selectCompletedTodos = createSelector(
  [(state: RootState) => state.todos],
  todos => todos.filter(todo => todo.completed)
)

// 在组件中：
const completedTodos = useAppSelector(selectCompletedTodos)
```

应在组件外声明记忆化 selector，让每次渲染都使用同一个 selector 实例。在组件函数体内调用 `createSelector` 会在每次渲染时创建新的缓存，无法实现记忆化。

如果 selector 返回的扁平对象，其字段为基本类型或稳定引用，可以将 React-Redux 的 `shallowEqual` 作为相等性函数传入。这样 `useSelector` 会逐个比较两个结果的字段，而不是比较对象本身的引用：

```ts
import { shallowEqual } from 'react-redux'

const { count, status } = useAppSelector(
  state => ({ count: state.counter.value, status: state.counter.status }),
  shallowEqual
)
```

`createSelector` 和 `shallowEqual` 都是针对同一个问题的解决方案：selector 必须返回新对象。如果可以分别选择各个值，应优先采用这种方式。

#### 详细信息

**文档**

- [使用 Redux：使用 Selector 派生数据](../usage/deriving-data-selectors.md)
- [Reselect 文档](/reselect/introduction/getting-started)
- [React Redux：Hooks - 相等性比较与更新](/react-redux/api/hooks#equality-comparisons-and-updates)

### 如何在 React 18 和 React 19 中使用 Redux？ {#how-do-i-use-redux-with-react-18-and-react-19}

React-Redux v8 及更高版本支持 React 18，v9 支持 React 18 和 19。`useSelector` 基于 React 的 `useSyncExternalStore` hook 实现，这是 React 为订阅其自身之外的数据提供的 API。这意味着：

- **Store 更新始终同步渲染。** 派发 action 时，React 会在同步渲染过程中更新已订阅的组件，不受待处理 transition 的影响。Redux 状态更新无法通过 `startTransition` 标记为低优先级；读取 Redux 状态时发生 suspend 的组件会回退到最近的 `Suspense` 边界，而不是继续显示旧 UI。这是 React 对外部 store 的有意选择，可以避免“撕裂”问题，即一次渲染的不同部分读到不同的 store 快照。
- **并发渲染是安全的。** React 通过 `useSyncExternalStore` 读取 store，因此中断后恢复的渲染会重新读取当前状态，而不会使用过时的值。
- **自动批处理仍然生效。** 同一事件周期中的多次 dispatch（例如在事件处理器、`setTimeout`、Promise 回调或 thunk 中）只会触发一次 React 渲染，无需额外处理。React-Redux 旧版的 `batch()` helper 在 v9 中不再起作用，并将在 v10 移除。

React Server Components 及其上层框架（例如 Next.js App Router）会在服务器上运行组件树的一部分，而服务器上没有 Redux store。Redux 是客户端库：`<Provider>` 以及所有调用 `useSelector` 或 `useDispatch` 的组件都必须是客户端组件；服务器上必须为每个请求创建一个 store，不能将其作为模块级单例。[使用 Next.js 配置 Redux Toolkit](../usage/nextjs.mdx)一页展示了正确实现这一点的 `StoreProvider` 组件。

#### 详细信息

**文档**

- [React: `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
- [使用 Redux：使用 Next.js 配置 Redux Toolkit](../usage/nextjs.mdx)
- [使用 Redux：服务器渲染](../usage/ServerRendering.md)

### 如何在组件外访问 store？ {#how-do-i-access-the-store-outside-a-component}

最好避免这样做。组件外需要访问 store 的代码，通常是在执行异步逻辑或响应 action；这两类逻辑都适合放进 [thunk](../usage/writing-logic-thunks.mdx) 或 [listener middleware](/toolkit/api/createListenerMiddleware) effect，其中 `dispatch` 和 `getState` 会作为参数传入。

确实需要 store 实例本身时：

- **在组件中**，`useStore()` 会返回最近 `<Provider>` 中的 store。它适用于少数情况，例如在事件处理器中读取一次状态但不订阅状态，或调用 `store.replaceReducer`。状态变化时它不会触发重新渲染，因此不要用它代替 `useSelector`。
- **在普通模块中**，例如需要读取身份验证 token 的 API 客户端或调用 `setupListeners` 的模块，可以直接从创建 store 的模块导入它。如果这会造成循环导入（store 模块导入 API 模块，而 API 模块又导入 store 模块），可以使用 `injectStore` 函数：API 模块导出一个 setter，store 模块创建实例后调用它。[代码结构常见问题](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files)展示了这种模式。

服务器渲染时，每个请求都有自己的 store，因此导入单例 store 的方式不可行。这种情况下，应显式传入 store 或 `dispatch`。

#### 详细信息

**文档**

- [常见问题：代码结构 - 如何在非组件文件中使用 Redux store？](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files)
- [React Redux：Hooks - `useStore()`](/react-redux/api/hooks#usestore)
- [使用 Redux：使用 thunk 编写逻辑](../usage/writing-logic-thunks.mdx)

### 如何为 `useSelector` 和 `useDispatch` 添加类型？ {#how-do-i-type-useselector-and-usedispatch}

从 store 推断 `RootState` 和 `AppDispatch`，然后通过 `.withTypes()` 创建预设类型的 hooks，并在各处使用它们，而不是直接使用从 `react-redux` 导入的原始 hooks：

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import todosReducer from '../features/todos/todosSlice'

export const store = configureStore({
  reducer: { todos: todosReducer }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

`useAppSelector` 知道 `state` 的结构，因此 `state => state.todso` 会产生编译错误。`useAppDispatch` 也知道 `configureStore` 添加的 thunk middleware，所以 `dispatch(fetchTodos())` 可以通过类型检查；如果使用无类型的 `useDispatch` 派发 thunk，则会报错，提示参数无法赋给 `UnknownAction`。

#### 更多信息

**文档**

- [使用 Redux：TypeScript 使用指南](../usage/UsageWithTypescript.md#define-typed-hooks)
- [React Redux：`useSelector` 与 `useDispatch` API 参考](/react-redux/api/hooks)

### `connect` 仍受支持吗？ {#is-connect-still-supported}

支持。`connect`、`mapStateToProps` 和 `mapDispatchToProps` 在 React-Redux v9 中仍然可用，也没有弃用。**新代码应使用 hooks。** Hooks 写法更简洁，无需经过 `ConnectedProps` 这类繁琐的 TypeScript 步骤，而且 React-Redux 文档、Redux 教程和 Redux Toolkit 默认都使用这套 API。

<details>
<summary>现有 connect 代码说明</summary>

- `connect` 会逐字段浅层比较 `mapStateToProps` 返回的对象，只有字段变化时才重新渲染包装组件。因此，`connect` 不会遇到上文所说的“selector 返回新对象”问题；而把 `mapStateToProps` 改成一个返回对象的 `useSelector` 后，每个 action 都可能触发重新渲染。应将其拆成每个字段一个 `useSelector`。
- 父组件使用相同 props 重新渲染时，`connect` 也会跳过子组件的重新渲染，`useSelector` 则不会；如有需要，可以使用 `React.memo`。
- 如果提供 `mapDispatchToProps` 函数，`dispatch` 就不会再自动作为 prop 传入。如果仍需要它，可以从 `mapDispatchToProps` 返回；也可以使用对象简写形式绑定 action creator，这样完全不需要 `dispatch`。
- 在组件树中的任何位置使用连接组件都没有问题。“只连接顶层组件”是 Dan Abramov 早期提出、后来撤回的建议；通常多个较小的订阅组件比少数大型组件性能更好。`useSelector` 也是如此。
- 同一个应用中可以混用 `connect` 和 hooks。逐个组件迁移即可。

完整 API 请参阅 [React-Redux `connect` API 文档](/react-redux/api/connect)和 [Connect 教程](/react-redux/tutorials/connect)。

</details>

### Redux 和 React Context API 有什么区别？ {#how-does-redux-compare-to-the-react-context-api}

**相似点**

Redux 和 React 的 Context API 都能解决“prop drilling”问题，即允许你不必经过多层组件传递 props。内部上，Redux 使用了 React 的 Context API 来将 store 传递给组件树。

**区别**

使用 Redux，你可以利用[Redux Dev Tools 扩展](https://github.com/reduxjs/redux-devtools/tree/main/extension)，它会自动记录应用的每一个操作，支持时间旅行调试 —— 点击历史操作回到某个状态。Redux 还支持中间件概念，可以在每次 action 分发时绑定自定义函数，例如自动事件日志、拦截特定动作等。

React Context API 是一对组件内部通信机制，隔离无关数据，且允许灵活使用数据，比如可以提供父组件的 state，并可将 context 数据作为 props 传给包裹的组件。

Redux 和 React Context 在数据处理上有本质区别。Redux 把整个应用数据保存在庞大的有状态对象中，通过运行你提供的 reducer 推断数据变化，返回对应的下一状态。React Redux 再优化组件渲染，确保只有数据有变的组件重渲染。Context 本身不持有状态，只是数据的通道。你需要依赖父组件状态来表达数据变化。

#### 详细信息

- [为什么 React Context 不是“状态管理”工具（以及它为什么不能取代 Redux）](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)
- [什么时候应该（或不应该）使用 Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)
- [Redux 与 React Context API 对比](https://daveceddia.com/context-api-vs-redux/)
- [你可能不需要 Redux（但不能用 Hooks 取代它）](https://www.simplethread.com/cant-replace-redux-with-hooks/)
