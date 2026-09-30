---
id: deriving-data-selectors
title: 使用 Selector 派生数据
description: '使用方法 > Redux 逻辑 > Selectors：从 Redux state 派生数据'
---

:::tip 你将学到

- Why good Redux architecture keeps state minimal and derives additional data
- Principles of using selector functions to derive data and encapsulate lookups
- How to use the Reselect library to write memoized selectors for optimization
- How memoized selectors work with `useSelector` and component arguments
- Additional tools and libraries for creating selectors
- Best practices for writing selectors

:::

## 派生数据

我们特别推荐 Redux 应用应当[保持 Redux 状态最小化，并尽可能从该状态中派生附加数据](../style-guide/style-guide.md#keep-state-minimal-and-derive-additional-values)。

这包括计算过滤后的列表或汇总数值。例如，一个待办事项 (todo) 应用会在状态中保存一份原始的 todo 对象列表，但在每次状态更新时，在状态之外派生一个过滤后的 todo 列表。类似地，是否所有 todos 都完成的检查，或未完成的 todos 数量，也可以在 store 外部计算。

这有几个好处：

- 实际状态更易于阅读
- 计算这些附加值并保持其与数据同步所需逻辑更少
- 原始状态仍保留作为参考且不会被替换

:::tip

这对 React 状态同样是一个好原则！许多用户曾尝试定义一个 `useEffect` 钩子，监听某个状态值变化，然后调用派生的值如 `setAllCompleted(allCompleted)` 更新状态。其实，这个值可以在渲染过程中直接派生和使用，无需存入状态：

```tsx
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])

  // highlight-start
  // 在渲染过程中派生数据
  const allTodosCompleted = todos.every(todo => todo.completed)
  // highlight-end

  // 使用该值进行渲染
}
```

:::

## 使用 Selectors 计算派生数据

在典型的 Redux 应用中，用于派生数据的逻辑通常写成称为**_selectors_**的函数。

Selectors 主要用来封装从 state 中查找特定值的逻辑、派生值的逻辑，以及通过避免不必要的重复计算来提升性能。

你并非_必须_使用 selectors 来查询所有状态数据，但它们是标准模式且被广泛使用。

### 基础 Selector 概念

**“selector 函数”是任何接受 Redux store 状态（或状态的一部分）作为参数、并返回基于该状态的数据的函数。**

**selectors 不必用特定库编写**，也无所谓采用箭头函数或传统 `function` 关键字。比如，以下都是有效的 selector 函数示例：

```ts
// Arrow function, direct lookup
const selectEntities = (state: RootState) => state.entities

// Function declaration, mapping over an array to derive values
function selectItemIds(state: RootState) {
  return state.items.map(item => item.id)
}

// Function declaration, encapsulating a deep lookup
function selectSomeSpecificField(state: RootState) {
  return state.some.deeply.nested.field
}

// Arrow function, deriving values from an array
const selectItemsWhoseNamesStartWith = (items: Item[], namePrefix: string) =>
  items.filter(item => item.name.startsWith(namePrefix))
```

selector 函数可以任意命名。但[**我们推荐给 selector 函数命名加前缀 `select`，并结合所选择值的描述**](../style-guide/style-guide.md#name-selector-functions-as-selectthing)。典型例子有 **`selectTodoById`**、**`selectFilteredTodos`** 和 **`selectVisibleTodos`**。

如果你用过 [React-Redux 的 `useSelector` 钩子](../tutorials/fundamentals/part-5-ui-and-react.md)，你可能已经熟悉 selector 函数的基本含义——传给 `useSelector` 的函数必须是 selectors：

```tsx
function TodoList() {
  // highlight-start
  // This anonymous arrow function is a selector!
  const todos = useAppSelector(state => state.todos)
  // highlight-end
}
```

selector 函数通常定义在 Redux 应用的两个不同部分：

- 在 slice 文件中，与 reducer 逻辑并列
- 在组件文件中，在组件外部或直接内联于 `useSelector` 调用

A selector function can be used anywhere you have access to the entire Redux root state value. This includes the `useSelector` hook, middleware, thunks, listeners, and sagas. For example, thunks and middleware have access to the `getState` argument, so you can call a selector there:

```ts
function addTodosIfAllowed(todoText: string): AppThunk {
  return (dispatch, getState) => {
    const state = getState()
    const canAddTodos = selectCanAddTodos(state)

    if (canAddTodos) {
      dispatch(todoAdded(todoText))
    }
  }
}
```

通常不建议在 reducers 内部使用 selectors，因为 slice reducer 只能访问自己的状态分片，而大多数 selectors 都期望得到完整的 Redux 根状态。

### Reading State Once

React components should normally use `useSelector`, because it subscribes to the store and updates the component when the selected value changes. Sometimes code outside React only has access to `dispatch` and needs a one-time read of the latest state without subscribing. In that case, you can dispatch a small thunk that calls the selector with `getState()` and returns its result:

```ts
const selectFromState = <Selected>(
  selector: (state: RootState) => Selected
): AppThunk<Selected> => {
  return (_dispatch, getState) => selector(getState())
}

const users = dispatch(selectFromState(selectUsers))
```

This reads the state at the moment the thunk runs. The returned value does not stay updated, so use a subscription API such as `useSelector` when the caller needs to react to later state changes.

### Encapsulating State Shape with Selectors

使用 selector 函数的首要原因，是封装和复用 Redux 状态结构相关的知识。

假设某个 `useSelector` 钩子这样执行特定深层状态的查找：

```ts
const data = useAppSelector(state => state.some.deeply.nested.field)
```

这段代码合法且能运行。但从架构角度可能不是最佳实践。想象有多个组件都需要访问该字段。如果状态结构发生改变，你必须修改所有包含该查询的 `useSelector` 调用。

因此，就像[推荐用 action creators 封装创建 action 细节](../style-guide/style-guide.md#use-action-creators)一样，我们建议定义可复用 selector 函数，封装某块状态的获取细节。然后在代码库中任何需要该数据的地方，都使用对应的 selector 函数。

**理想情况下，只有 reducer 函数和 selectors 知道确切状态结构；如果状态位置更改，只需更新这两部分逻辑。**

基于此，通常建议将可复用 selectors 定义在 slice 文件中，而不是分散定义在组件内。

selector 常被描绘为对状态的**“查询”**——关心的是你请求了数据并得到了结果，而不是查询实现细节。

### 用缓存优化 Selectors

- Selectors used with `useSelector` will be re-run after every dispatched action, regardless of what section of the Redux root state was actually updated. Re-running expensive calculations when the input state sections didn't change is a waste of CPU time, and it's very likely that the inputs won't have changed most of the time anyway.
- `useSelector` relies on `===` reference equality checks of the return values to determine if the component needs to re-render. If a selector _always_ returns new references, it will force the component to re-render even if the derived data is effectively the same as last time. This is especially common with array operations like `map()` and `filter()`, which return new array references.

- 用于 `useSelector` 或 `mapState` 的 selectors 在每次派发 action 后都会运行，无论实际更新的是哪个状态分片。重复执行昂贵计算浪费 CPU 时间，而大多数情况下输入数据是未改变的。
- `useSelector` 和 `mapState` 依赖返回值的 `===` 引用相等性判断，决定组件是否重新渲染。如果 selector _总是_ 返回新引用，即使派生数据相同，也会强制组件重新渲染。对数组操作如 `map()` 和 `filter()` 特别常见，因为它们始终返回新数组引用。

例如，下面这个组件写法不当，`useSelector` 调用_总是_返回新数组引用，导致组件 _每次_ 派发 action 后重渲染，即使 `state.todos` 没变：

```tsx
function TodoList() {
  // highlight-start
  // ❌ WARNING: this _always_ returns a new reference, so it will _always_ re-render!
  const completedTodos = useAppSelector(state =>
    state.todos.filter(todo => todo.completed)
  )
  // highlight-end
}
```

另一个示例涉及“昂贵”的数据转换工作：

```tsx
function ExampleComplexComponent() {
  const data = useAppSelector(state => {
    const initialData = state.data
    const filteredData = expensiveFiltering(initialData)
    const sortedData = expensiveSorting(filteredData)
    const transformedData = expensiveTransformation(sortedData)

    return transformedData
  })
}
```

同样，这些昂贵逻辑会在每次派发 action 后执行，不论 `state.data` 是否变化。

因此，我们需要通过**_memoization（记忆化）_** 执行优化写法。

**Memoization 是缓存的一种**。它记录函数输入参数，并存储输入与结果。如果函数用相同输入被调用，则跳过实际计算，直接返回缓存结果。这样优化性能，只在输入变化时做工作，且对相同输入稳定返回同一输出引用。

接下来，我们看看如何用 Reselect 编写带缓存的 selectors。

## Using Reselect to Write Cached Selectors

The Redux ecosystem uses a library called [**Reselect**](/reselect/introduction/getting-started) to create memoized selector functions. Reselect is a separate package, but `createSelector` and the other Reselect APIs are re-exported from [Redux Toolkit](/toolkit), so you do not need to install it separately.

This page covers how memoized selectors fit into a Redux app. The [Reselect docs](/reselect/introduction/getting-started) are the reference for the library itself: [how the memoization works internally](/reselect/introduction/how-does-reselect-work), the [`createSelector` API](/reselect/api/createSelector) and its options, the [memoization functions](/reselect/api/weakMapMemoize), and a [FAQ](/reselect/FAQ).

### `createSelector` Overview

Reselect's [`createSelector`](/reselect/api/createSelector) accepts one or more "input selector" functions, plus a "result function", and returns a new memoized selector.

When you call the generated selector, Reselect runs all of the input selectors with the arguments you passed, and compares their results to the results from the previous call. If any of the results are `===` different, it re-runs the result function with those values as its arguments. If all of the results are the same as last time, it skips the result function and returns the cached result from before.

In typical usage, the input selectors are simple functions that return values nested somewhere inside the state object, and the result function does the actual derivation work:

```ts
import { createSelector } from '@reduxjs/toolkit'

const selectTodos = (state: RootState) => state.todos.items
const selectCurrentUser = (state: RootState) => state.users.currentUser

const selectTodosForCurrentUser = createSelector(
  [selectTodos, selectCurrentUser],
  (todos, currentUser) => {
    console.log('Result function running')
    return todos.filter(todo => todo.ownerId === currentUser.userId)
  }
)

const todosForCurrentUser1 = selectTodosForCurrentUser(state)
// Log: "Result function running"

const todosForCurrentUser2 = selectTodosForCurrentUser(state)
// No output

console.log(todosForCurrentUser1 === todosForCurrentUser2)
// true
```

The second time we called `selectTodosForCurrentUser`, the result function didn't execute. The results of `selectTodos` and `selectCurrentUser` were the same as the first call, so `selectTodosForCurrentUser` returned the memoized result.

This means that **input selectors should just extract and return values, and the result function should do the transformation work**. A result function that just returns one of its inputs unchanged, or an input selector that is `state => state`, will not memoize anything useful. The Reselect docs cover these and other pitfalls in [Best Practices and Common Mistakes](/reselect/usage/best-practices), and Reselect's [development-mode checks](/reselect/api/development-only-checks) warn about both cases the first time a selector runs.

### `createSelector` Behavior Details

Reselect memoizes in two layers. It first compares the arguments passed to the selector against the previous call, and if they are identical it returns the cached result without running anything. If the arguments differ (which they will after every dispatch, because the root state object is a new reference), it runs the input selectors and compares _their_ results. Only if one of those changed does the result function run. The Reselect docs describe this in detail in ["How Does Reselect Work?"](/reselect/introduction/how-does-reselect-work#cascading-memoization).

Reselect 5 memoizes with [`weakMapMemoize`](/reselect/api/weakMapMemoize) by default. It keeps a separate cache entry for each distinct set of arguments, keyed by reference, so calling a selector with several different inputs in a row does not evict earlier results:

```ts
const a = someSelector(state, 1) // first call: runs the result function
const b = someSelector(state, 1) // same inputs: cached
const c = someSelector(state, 2) // new inputs: runs the result function
const d = someSelector(state, 1) // still cached from the first call
```

Cache entries are held in `WeakMap`s keyed by the argument objects, so they are released when those objects are garbage collected. There is no size limit to configure.

Reselect 4 and earlier used [`lruMemoize`](/reselect/api/lruMemoize) with a cache size of 1, which only remembered the most recent set of arguments. In that version, `c` would have evicted the result for `(state, 1)`, and `d` would have recalculated. `lruMemoize` is still available if you want a bounded cache, and the ["Selector Factories"](#selector-factories) section below explains when it still matters.

Because every input selector receives the full argument list, **all of the input selectors you provide should accept the same types of parameters**:

```ts
const selectItems = (state: RootState) => state.items

// expects a number as the second argument
const selectItemId = (state: RootState, itemId: number) => itemId

// expects an object as the second argument
const selectOtherField = (
  state: RootState,
  someObject: { someField: string }
) => someObject.someField

// ❌ These input selectors disagree about what the second argument is
const selectItemById = createSelector(
  [selectItems, selectItemId, selectOtherField],
  (items, itemId, someField) => items[itemId]
)
```

If you call `selectItemById(state, 42)`, `selectOtherField` will break because it's trying to access `42.someField`. TypeScript will report this mismatch; in plain JavaScript it fails at runtime.

### Reselect Usage Patterns and Limitations

#### Selector Nesting

You can use a selector created by `createSelector` as the input to another selector. For example:

```ts
const selectTodos = (state: RootState) => state.todos

const selectCompletedTodos = createSelector([selectTodos], todos =>
  todos.filter(todo => todo.completed)
)

const selectCompletedTodoDescriptions = createSelector(
  [selectCompletedTodos],
  completedTodos => completedTodos.map(todo => todo.text)
)
```

#### Passing Input Parameters

A Reselect-generated selector can be called with as many arguments as you want: `selectThings(a, b, c, d, e)`. What matters for re-running the result function is not the arguments themselves, but whether the _input selectors'_ results changed. So if you want to pass additional parameters through to the result function, you must define input selectors that extract those values from the original selector arguments:

```ts
const selectItemsByCategory = createSelector(
  [
    // Usual first input - extract value from `state`
    (state: RootState) => state.items,
    // Take the second arg, `category`, and forward to the result function
    (state: RootState, category: string) => category
  ],
  // Result function gets (items, category) as args
  (items, category) => items.filter(item => item.category === category)
)

const electronicItems = selectItemsByCategory(state, 'electronics')
```

For consistency, you may want to consider passing additional parameters to a selector as a single object, such as `selectThings(state, otherArgs)`, and then extracting values from the `otherArgs` object. See also the Reselect FAQ entry on [selectors that take an argument](/reselect/FAQ#how-do-i-create-a-selector-that-takes-an-argument).

#### Selector Factories

With Reselect 4's `lruMemoize` and its default cache size of 1, a single selector instance could only remember one set of arguments. If several components called `selectItemsByCategory(state, category)` with different categories, each call evicted the previous result and the result function re-ran every time. The workaround was a "selector factory" - a function that calls `createSelector()` and returns a fresh selector instance for each component:

```ts
const makeSelectItemsByCategory = () =>
  createSelector(
    [(state: RootState) => state.items, (state, category: string) => category],
    (items, category) => items.filter(item => item.category === category)
  )
```

With Reselect 5's default `weakMapMemoize`, one shared selector already keeps a cache entry per distinct argument set, so **you usually do not need a factory**. A factory is still useful if you have opted back into `lruMemoize` for a bounded cache, or if you want a component's cached results released as soon as it unmounts rather than when the argument objects are garbage collected. See ["Creating Unique Selector Instances"](#creating-unique-selector-instances) for how to use one with `useSelector`, and the Reselect FAQ on [sharing a selector across component instances](/reselect/FAQ#can-i-share-a-selector-across-multiple-component-instances).

### Reselect 5

Reselect 5 (released December 2023) is written in TypeScript and changes a few defaults that are worth knowing about:

- **`weakMapMemoize` is the default memoizer.** As described above, it caches per distinct argument set with no size limit. To get the previous behavior, pass `memoize: lruMemoize` (and optionally `memoizeOptions: { maxSize: 10 }`) to `createSelector` or build a custom `createSelector` with [`createSelectorCreator`](/reselect/api/createSelectorCreator).
- **[`createSelector.withTypes<RootState>()`](/reselect/api/createSelector#defining-a-pre-typed-createselector)** returns a `createSelector` whose input selectors are pre-typed to receive your root state, so you do not have to annotate `state` in every input selector.
- **Development-mode checks** warn about the two common mistakes described earlier on this page: an input selector that returns a new reference on every call, and a result function that just returns its input. They run on the first call to each selector in development and are disabled in production. See [Development-only checks](/reselect/api/development-only-checks).

```ts title="src/app/selectors.ts"
import { createSelector, lruMemoize } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const createAppSelector = createSelector.withTypes<RootState>()

// Input selectors receive `RootState` without annotations
export const selectCompletedTodos = createAppSelector(
  [state => state.todos],
  todos => todos.filter(todo => todo.completed)
)

// Opt back into a bounded LRU cache for one selector
export const selectItemsByCategory = createAppSelector(
  [state => state.items, (state, category: string) => category],
  (items, category) => items.filter(item => item.category === category),
  { memoize: lruMemoize, memoizeOptions: { maxSize: 10 } }
)
```

Redux Toolkit re-exports `createSelector`, `createSelectorCreator`, `lruMemoize`, and `weakMapMemoize` from Reselect, so you do not need to install Reselect separately. The [Reselect 5 summary](/reselect/introduction/v5-summary) lists the full set of changes.

## 其他 Selector 库

虽然 Reselect 是 Redux 中最常用的选择器库，但也有其他库解决类似问题，或增强 Reselect 功能。

### `proxy-memoize`

[`proxy-memoize`](https://github.com/dai-shi/proxy-memoize) uses a different implementation approach. It relies on `Proxy` objects to track which nested values a selector actually reads, then compares only those values on later calls to see if they've changed. This can provide better results than Reselect in some cases.

比如用 Reselect 的选择一个 todo 描述数组：

```ts
import { createSelector } from '@reduxjs/toolkit'

const selectTodoDescriptionsReselect = createSelector(
  [(state: RootState) => state.todos],
  todos => todos.map(todo => todo.text)
)
```

只要 `state.todos` 中任意值变化（例如 `todo.completed`），该 selector 就会重新计算，尽管派生数组内容没有变，因为生成了新的数组引用。

而用 `proxy-memoize`：

```ts
import { memoize } from 'proxy-memoize'

const selectTodoDescriptionsProxy = memoize((state: RootState) =>
  state.todos.map(todo => todo.text)
)
```

Unlike Reselect, `proxy-memoize` can detect that only the `todo.text` fields are being accessed, and will only recalculate if one of the `todo.text` fields changed.

缺点和区别包括：

- All values are passed in as a single object argument
- It's more magical, whereas Reselect is more explicit
- There are some edge cases regarding the `Proxy`-based tracking behavior
- It's less widely used

`proxy-memoize` is a reasonable alternative to Reselect if you have selectors that read only a small part of a large input and want to avoid recalculating when unrelated fields change.

### `re-reselect`

[`re-reselect`](https://github.com/toomuchdesign/re-reselect) wraps Reselect and adds a "key selector" that picks a cache key from the selector arguments, managing a separate Reselect selector instance per key. With Reselect 5's `weakMapMemoize` already caching per argument set, this is mostly useful when you want an explicit key (such as a string ID) rather than reference identity to decide which cache entry to use.

```ts
import { createCachedSelector } from 're-reselect'

const selectUsersByLibrary = createCachedSelector(
  // inputSelectors
  selectUsers,
  selectLibraryId,

  // 结果函数
  (users, libraryId) => expensiveComputation(users, libraryId)
)(
  // re-reselect keySelector (receives selectors' arguments)
  // Use "libraryName" as cacheKey
  (_state: RootState, libraryName: string) => libraryName
)
```

## Using Selectors with React-Redux

### 带参数调用选择器

常见需求是向 selector 函数传递额外参数，但 `useSelector` 只会以 state 作为唯一参数来调用 selector。

最简单的方案是把匿名 selector 传给 `useSelector`，并立即调用真正的 selector，传入 state 和其他参数：

```tsx
import { selectTodoById } from './todosSlice'
import { useAppSelector } from '../../app/hooks'

function TodoListItem({ todoId }: { todoId: string }) {
  // highlight-start
  // Captures `todoId` from scope, gets `state` as an arg, and forwards both
  // to the actual selector function to extract the result
  const todo = useAppSelector(state => selectTodoById(state, todoId))
  // highlight-end
}
```

### 创建唯一的 Selector 实例

A memoized selector is often shared across many components that each call it with different arguments. With Reselect 5's default `weakMapMemoize`, that works as-is: the shared selector keeps a cache entry per distinct argument set, so the components do not evict each other's results.

If you have opted into `lruMemoize` with a small cache, or want a component's cached results released as soon as it unmounts, create a unique selector instance per component with a [selector factory](#selector-factories) and `useMemo`:

```tsx
import { useMemo } from 'react'
import { makeSelectItemsByCategory } from './categoriesSlice'
import { useAppSelector } from '../../app/hooks'

function CategoryList({ category }: { category: string }) {
  // Create a new memoized selector, for each component instance, on mount
  const selectItemsByCategory = useMemo(makeSelectItemsByCategory, [])

  const itemsByCategory = useAppSelector(state =>
    selectItemsByCategory(state, category)
  )
}
```

If you still use the legacy `connect` API, the equivalent is the ["factory function" form of `mapStateToProps`](/react-redux/api/connect#factory-functions), where `mapState` returns a new `mapState` function on its first call.

## 有效使用 Selectors

虽然 selectors 是 Redux 中常用模式，但经常被误用或误解。以下是正确使用的指南。

### 将 Selector 与 Reducer 放在一起定义

selector 函数通常定义在 UI 层，直接内联在 `useSelector`。但这可能导致重复定义匿名函数。

可以把匿名函数抽离并命名：

```tsx
// highlight-next-line
const selectTodos = (state: RootState) => state.todos

function TodoList() {
  // highlight-next-line
  const todos = useAppSelector(selectTodos)
}
```

多个地方可能会使用同样的查询。此外，也可能希望把 state 组织细节封装在 `todosSlice` 文件里，集中管理。

所以，**最好把可复用 selector 定义在对应 reducer 的同一个文件中**，比如导出 `selectTodos`：

```ts title="src/features/todos/todosSlice.ts"
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface Todo {
  id: string
  text: string
  completed: boolean
}

const initialState: Todo[] = []

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action: PayloadAction<Todo>) {
      state.push(action.payload)
    }
  }
})

export const { todoAdded } = todosSlice.actions
export default todosSlice.reducer

// highlight-start
// Export a reusable selector here
export const selectTodos = (state: RootState) => state.todos
// highlight-end
```

这样如果之后要改 todos 状态结构，只需修改这些 selector，其他代码改动最小。

### 选择性使用 Selector

过度使用 selector 不好。**为每个字段都写一个 selector 会让 Redux 像 Java 类里到处都是 getter/setter**。这不会提升代码质量，反而会增加维护难度，难以追踪数据使用位置。

同时，**不必所有 selector 都进行 memoization**。只有每次调用都会返回新引用，或计算昂贵时，才需要缓存。**直接查找返回值的 selector 应该是普通函数，不做缓存**。

示例：

```ts
// ❌ DO NOT memoize: will always return a consistent reference
const selectTodos = (state: RootState) => state.todos
const selectNestedValue = (state: RootState) => state.some.deeply.nested.field
const selectTodoById = (state: RootState, todoId: string) => state.todos[todoId]

// 🤔 MAYBE memoize: deriving data, but will return a consistent result.
//    Memoization might be useful if the selector is used in many places
//    or the list being iterated over is long.
const selectItemsTotal = (state: RootState) => {
  return state.items.reduce((result, item) => {
    return result + item.total
  }, 0)
}
const selectAllCompleted = (state: RootState) =>
  state.todos.every(todo => todo.completed)

// ✅ SHOULD memoize: returns new references when called
const selectTodoDescriptions = (state: RootState) =>
  state.todos.map(todo => todo.text)
```

### 按需重塑状态

selectors 不必仅限于直接映射查询，也可以做各种转换，尤其方便准备组件所需的数据格式。

Redux 状态通常是“原始”形态，[因为状态应当保持最简](#deriving-data)，而多个组件可能需要不同的呈现形式。你可以使用 selector 名字来抽取、转换多个 slice 数据，或者合并、筛选等。

组件中也可以部分实现转换逻辑，但抽取为 selectors 有利于复用和测试。

### 需要时全局化 selectors

编写 slice reducer 时，只知道自己的状态片段，对应的 `state` 就是那片数据（如 todoSlice 中的 todo 数组）。但 selectors 通常接收整个根状态作为参数，必须知道 slice 状态在根状态中的位置，比如 `state.todos`。

通常 slice 文件里既有局部的 reducer 逻辑，也有“全局化”的 selectors，接收根状态并在内部查找对应 slice。

这种做“全局化”的 selector，叫做“globalized selectors”；而仅期望接受部分状态作为参数的，叫做“localized selectors”：

```ts
// "Globalized" - accepts root state, knows to find data at `state.todos`
const selectAllTodosCompletedGlobalized = (state: RootState) =>
  state.todos.every(todo => todo.completed)

// "Localized" - only accepts `todos` as argument, doesn't know where that came from
const selectAllTodosCompletedLocalized = (todos: Todo[]) =>
  todos.every(todo => todo.completed)
```

“局部化” selectors 可通过包装成函数，添加查找 slice 的逻辑，变成“全局化”。

Redux Toolkit's [`createEntityAdapter` API](/toolkit/api/createEntityAdapter#selector-functions) is an example of this pattern. If you call `todosAdapter.getSelectors()`, with no argument, it returns a set of "localized" selectors that expect the _entity slice state_ as their argument. If you call `todosAdapter.getSelectors(state => state.todos)`, it returns a set of "globalized" selectors that expect to be called with the _Redux root state_ as their argument.

有时“局部化” selectors 更有用。例如，若有多个 `createEntityAdapter` 嵌套存储，按域划分聊天室和消息数据，要先选聊天室，再取得消息，这时“局部化” selectors 很方便。

## 更多信息

- Selector libraries:
  - [Reselect](/reselect/introduction/getting-started)
  - `proxy-memoize`: https://github.com/dai-shi/proxy-memoize
  - `re-reselect`: https://github.com/toomuchdesign/re-reselect
- Randy Coulman has an excellent series of blog posts on selector architecture and different approaches for globalizing Redux selectors, with tradeoffs:
  - [Encapsulating the Redux State Tree](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
  - [Redux Reducer/Selector Asymmetry](https://randycoulman.com/blog/2016/09/20/redux-reducer-selector-asymmetry/)
  - [Modular Reducers and Selectors](https://randycoulman.com/blog/2016/09/27/modular-reducers-and-selectors/)
  - [Globalizing Redux Selectors](https://randycoulman.com/blog/2016/11/29/globalizing-redux-selectors/)
  - [Globalizing Curried Selectors](https://randycoulman.com/blog/2016/12/27/globalizing-curried-selectors/)
  - [Solving Circular Dependencies in Modular Redux](https://randycoulman.com/blog/2018/06/12/solving-circular-dependencies-in-modular-redux/)
