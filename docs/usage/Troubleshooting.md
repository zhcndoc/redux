---
id: troubleshooting
title: 故障排除
---

# 故障排除

本页汇总常见问题及其解决方法。
示例使用 React 和 Redux Toolkit；即使你采用其他方案，也能从中获得帮助。

如果这里没有列出你遇到的问题，[调试 Redux](./DebuggingRedux.md)页面介绍了如何使用 Redux DevTools 等工具追踪应用的实际行为。

## 常见问题 {#common-problems}

### 触发（dispatch）一个 action 后没有任何反应

有时你尝试派发 action，但界面没有更新。常见原因有以下几种。

#### Reducer 修改了状态 {#the-reducer-mutated-the-state}

Redux 假设 reducer 不会修改传入的对象。React-Redux 的 `useSelector` 通过 `===` 比较 dispatch 前后选中的值，决定组件是否需要重新渲染。如果 reducer 修改了现有状态对象并将其返回，引用并未变化，因此比较会认为“没有变化”，组件也就不会更新。

Redux Toolkit 的 `createSlice` 和 `createReducer` 会用 [Immer](https://immerjs.github.io/immer/) 包装 reducer，因此你可以在其中编写“修改式”代码，而 Immer 会生成正确更新后的副本：

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
      // Safe: Immer turns this into an immutable update
      state.push(action.payload)
    },
    todoToggled(state, action: PayloadAction<string>) {
      const todo = state.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    }
  }
})
```

这种写法只适用于 `createSlice`、`createReducer` 或 Immer 的 `produce`_内部_。如果手动编写 reducer，就必须复制每一层发生变化的数据：

```ts
import type { PayloadAction, UnknownAction } from '@reduxjs/toolkit'

function todosReducer(state: Todo[] = [], action: UnknownAction): Todo[] {
  switch (action.type) {
    case 'todos/todoToggled': {
      const id = (action as PayloadAction<string>).payload
      return state.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }
    default:
      return state
  }
}
```

selector 和读取 `store.getState()` 的代码也遵循相同规则：不要修改返回的对象。

在开发环境中，`configureStore` 会添加 middleware 来检查意外修改，并抛出类似 `A state mutation was detected between dispatches, in the path 'todos.0.completed'` 的错误。如果看到此错误，路径会指出哪个值被原地修改了。详情请参阅[不可变性 middleware 文档](/toolkit/api/immutabilityMiddleware)；[不可变更新模式](./structuring-reducers/ImmutableUpdatePatterns.md)页面介绍了如何手动编写这些更新。

#### Action 从未派发 {#the-action-was-never-dispatched}

调用 action creator_不会_派发任何内容，它只会返回一个 action 对象。下面的代码不会产生效果：

```tsx
import { todoAdded } from './todosSlice'

function AddTodo() {
  const handleClick = () => {
    // Won't work! This just creates an object and throws it away.
    todoAdded({ id: '1', text: 'Fix the issue', completed: false })
  }

  return <button onClick={handleClick}>Add</button>
}
```

需要你自行将 action 传给 `dispatch`。在组件中，可以从 `useDispatch` hook（或带类型的 `useAppDispatch` 包装器）获取 `dispatch`：

```tsx
import { useAppDispatch } from '../../app/hooks'
import { todoAdded } from './todosSlice'

function AddTodo() {
  const dispatch = useAppDispatch()

  const handleClick = () => {
    // Works!
    dispatch(todoAdded({ id: '1', text: 'Fix the issue', completed: false }))
  }

  return <button onClick={handleClick}>Add</button>
}
```

Redux DevTools 会显示所有已派发的 action。如果预期的 action 不在列表中，就说明它从未派发。

#### Selector 读取了错误的状态部分 {#the-selector-reads-the-wrong-part-of-the-state}

如果 action 出现在 DevTools 中，状态也发生了变化，但组件仍未更新，请检查 selector。一个常见错误是读取不存在的字段，此时会悄悄返回 `undefined`：

```ts
// State shape: { todos: Todo[]; filters: { status: string } }

// Wrong: there is no `state.todo`, so this is always `undefined`
const todos = useAppSelector(state => state.todo)

// Right
const todos = useAppSelector(state => state.todos)
```

使用 `RootState` 为 hooks 添加类型，可以在编译时发现此问题。请参阅 [TypeScript 使用指南](./UsageWithTypescript.md#define-typed-hooks)。

如果 selector 读取的值根本不在 store 中（例如 reducer 没有添加到 `configureStore`），请查看 DevTools 的“State”标签页，确认实际状态结构。

### "A non-serializable value was detected in an action" or "in the state"

在开发环境中，`configureStore` 还会添加 middleware，检查每个 action 和每个状态值是否都可序列化（普通对象、数组、字符串、数字、布尔值、`null`、`undefined`）。错误消息会指出发现该值的路径：

```
A non-serializable value was detected in an action, in the path: `payload.dueDate`.
Value: Fri Sep 18 2026 10:00:00 GMT-0400 (Eastern Daylight Time)
```

常见原因包括 `Date` 对象、类实例、`Map`/`Set`、函数和 Promise。解决方法是在将值放入 action 或状态前先转换它：用 `dueDate.toISOString()` 代替 `Date`，用普通对象代替类实例，并避免在 action 中放入函数或 Promise。如果某个值必须不可序列化，可以让 middleware 忽略指定路径或 action 类型，也可以关闭此检查。请参阅[处理不可序列化数据](/toolkit/usage/usage-guide#working-with-non-serializable-data)和[可序列化性 middleware 文档](/toolkit/api/serializabilityMiddleware)。

常见问题中解释了这样做的重要性：[可以将函数、Promise 或其他不可序列化的值放进 store 状态吗？](../faq/OrganizingState.md#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)

### "Selector returned a different result when called with the same parameters"

当 `useSelector` 回调每次运行都返回新引用时，React-Redux 会在开发环境记录此警告。这表示无论组件使用的数据是否变化，它都会在_每个_ action 派发后重新渲染。创建新对象或数组的 selector（例如调用 `.map()`、`.filter()` 或返回 `{ a, b }`）都会导致此问题：

```ts
// Re-renders on every action: `filter` returns a new array every time
const completed = useAppSelector(state =>
  state.todos.filter(todo => todo.completed)
)
```

可以选择原始数据并在组件中派生结果，也可以使用 `createSelector` 对派生过程进行记忆化：

```ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

const selectCompletedTodos = createSelector(
  [(state: RootState) => state.todos],
  todos => todos.filter(todo => todo.completed)
)

const completed = useAppSelector(selectCompletedTodos)
```

请参阅[为什么组件重新渲染得太频繁？](../faq/ReactRedux.md#why-is-my-component-re-rendering-too-often)和[使用 Selector 派生数据](./deriving-data-selectors.md)。该检查本身详见 [React-Redux hooks 文档](/react-redux/api/hooks#development-mode-checks)。

### "could not find react-redux context value; please ensure the component is wrapped in a `<Provider>`"

`useSelector` 和 `useDispatch` 会从 React context 中读取 store。出现此错误意味着某个组件调用它们时，组件树上方没有 `<Provider store={store}>`。检查 `Provider` 是否包裹了根组件，并确保在主组件树之外渲染的内容也有自己的 `Provider`（Portal 没问题，但单独调用 `createRoot` 或测试渲染时需要额外的 Provider）。测试中，应像[编写测试](./WritingTests.mdx)所示，为该测试创建 store 并在 `Provider` 中渲染组件。

如果确定存在 `Provider`，请检查是否安装了重复的包。`node_modules` 中有两份 `react-redux`（例如，一份提升到了顶层，另一份嵌套在组件库内）会创建两个不同的 context 对象，因此其中一个副本的 `Provider` 对另一个副本的 hooks 不可见。存在两份 `react` 时也会出现相同问题。运行 `npm ls react react-redux`（或对应的 pnpm/yarn 命令）并去重，确保每个包都只解析到一个版本。

### TypeScript says a thunk is not assignable to `UnknownAction`

在组件中调用 `dispatch(someThunk())` 会产生类似 `Argument of type 'ThunkAction<...>' is not assignable to parameter of type 'UnknownAction'` 的错误。普通 `useDispatch()` hook 返回基础 `Dispatch` 类型，它并不了解 thunk middleware。请改用以 store 的 `AppDispatch` 标注类型的 `useAppDispatch` hook：

```ts
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

`AppDispatch` 是 `typeof store.dispatch`，`configureStore` 会推断其包含 thunk middleware。请参阅[定义 Root State 和 Dispatch 类型](./UsageWithTypescript.md#define-root-state-and-dispatch-types)。

### An RTK Query hook returns an error

Query 和 mutation hooks 不会抛出错误。它们会返回 `isError`、`error` 和 `status` 字段；错误对象的结构取决于请求是在网络层失败（`{ status: 'FETCH_ERROR', error: string }`），还是服务器返回了非 2xx 状态（`{ status: number, data: unknown }`）。应读取 hook 的返回值，而不是用 `try`/`catch` 包裹它。请参阅 [RTK Query 错误处理](/toolkit/rtk-query/usage/error-handling)。Redux DevTools 的“RTK Query”标签页会显示所有缓存查询、状态及最近一次响应。

## 其他问题

大多数 Redux 问题都可以归结为三个问题：action 是否派发、reducer 如何处理它、组件选择了什么？Redux DevTools 可以回答这三个问题。有关如何使用这些工具以及它们适用的一般调试方法，请参阅[调试 Redux](./DebuggingRedux.md)。

可以在 Reactiflux Discord 的 **#redux** [频道](https://www.reactiflux.com/)中提问，或[创建 issue](https://github.com/reduxjs/redux/issues)。

如果你解决了问题，也欢迎[编辑此文档](https://github.com/reduxjs/redux/edit/master/docs/usage/Troubleshooting.md)，帮助下一个遇到同样问题的人。
