---
id: deriving-data-selectors
title: 使用 Selector 派生数据
description: '使用方法 > Redux 逻辑 > Selectors：从 Redux state 派生数据'
---

:::tip 你将学到

- 为什么良好的 Redux 架构会将 state 保持为最小，并尽可能派生额外数据
- 使用 selector 函数派生数据和封装查询的原则
- 如何使用 Reselect 库编写带缓存优化的 memoized selectors
- 使用 Reselect 的高级技巧
- 创建 selectors 的其他工具和库
- 编写 selectors 的最佳实践

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

```js
function TodoList() {
  const [todos, setTodos] = useState([])

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

```js
// 箭头函数，直接查找
const selectEntities = state => state.entities

// 函数声明，通过映射数组派生值
function selectItemIds(state) {
  return state.items.map(item => item.id)
}

// 函数声明，封装深层查找
function selectSomeSpecificField(state) {
  return state.some.deeply.nested.field
}

// 箭头函数，从数组派生值
const selectItemsWhoseNamesStartWith = (items, namePrefix) =>
  items.filter(item => item.name.startsWith(namePrefix))
```

selector 函数可以任意命名。但[**我们推荐给 selector 函数命名加前缀 `select`，并结合所选择值的描述**](../style-guide/style-guide.md#name-selector-functions-as-selectthing)。典型例子有 **`selectTodoById`**、**`selectFilteredTodos`** 和 **`selectVisibleTodos`**。

如果你用过 [React-Redux 的 `useSelector` 钩子](../tutorials/fundamentals/part-5-ui-and-react.md)，你可能已经熟悉 selector 函数的基本含义——传给 `useSelector` 的函数必须是 selectors：

```js
function TodoList() {
  // highlight-start
  // 这个匿名箭头函数就是一个 selector！
  const todos = useSelector(state => state.todos)
  // highlight-end
}
```

selector 函数通常定义在 Redux 应用的两个不同部分：

- 在 slice 文件中，与 reducer 逻辑并列
- 在组件文件中，在组件外部或直接内联于 `useSelector` 调用

只要你能访问整个 Redux 根状态，selector 函数就可以使用。例如 `useSelector` 钩子、`connect` 的 `mapState` 函数、中间件、thunks 和 sagas 都能调用 selector。thunk 和中间件中的 `getState` 也允许调用 selectors：

```js
function addTodosIfAllowed(todoText) {
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

### 用 Selectors 封装状态结构

使用 selector 函数的首要原因，是封装和复用 Redux 状态结构相关的知识。

假设某个 `useSelector` 钩子这样执行特定深层状态的查找：

```js
const data = useSelector(state => state.some.deeply.nested.field)
```

这段代码合法且能运行。但从架构角度可能不是最佳实践。想象有多个组件都需要访问该字段。如果状态结构发生改变，你必须修改所有包含该查询的 `useSelector` 调用。

因此，就像[推荐用 action creators 封装创建 action 细节](../style-guide/style-guide.md#use-action-creators)一样，我们建议定义可复用 selector 函数，封装某块状态的获取细节。然后在代码库中任何需要该数据的地方，都使用对应的 selector 函数。

**理想情况下，只有 reducer 函数和 selectors 知道确切状态结构；如果状态位置更改，只需更新这两部分逻辑。**

基于此，通常建议将可复用 selectors 定义在 slice 文件中，而不是分散定义在组件内。

selector 常被描绘为对状态的**“查询”**——关心的是你请求了数据并得到了结果，而不是查询实现细节。

### 用缓存优化 Selectors

selector 函数通常需要执行相对“昂贵”的计算，或构造新的对象和数组引用的派生值。出于性能考虑，有几个原因：

- 用于 `useSelector` 或 `mapState` 的 selectors 在每次派发 action 后都会运行，无论实际更新的是哪个状态分片。重复执行昂贵计算浪费 CPU 时间，而大多数情况下输入数据是未改变的。
- `useSelector` 和 `mapState` 依赖返回值的 `===` 引用相等性判断，决定组件是否重新渲染。如果 selector _总是_ 返回新引用，即使派生数据相同，也会强制组件重新渲染。对数组操作如 `map()` 和 `filter()` 特别常见，因为它们始终返回新数组引用。

例如，下面这个组件写法不当，`useSelector` 调用_总是_返回新数组引用，导致组件 _每次_ 派发 action 后重渲染，即使 `state.todos` 没变：

```js
function TodoList() {
  // highlight-start
  // ❌ 警告：这里 _总是_ 返回新引用，会导致组件 _总是_ 重渲染！
  const completedTodos = useSelector(state =>
    state.todos.filter(todo => todo.completed)
  )
  // highlight-end
}
```

另一个示例涉及“昂贵”的数据转换工作：

```js
function ExampleComplexComponent() {
  const data = useSelector(state => {
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

The Redux ecosystem has traditionally used the [**Reselect**](https://github.com/reduxjs/reselect) library to create memoized selector functions. In addition, there are similar libraries and many variant wrappers, which we’ll discuss later.

### `createSelector` Overview

Reselect provides the [`createSelector`](https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc) function for generating memoized selectors. It accepts one or more “input selector” functions, plus an “output selector” function, and returns a new selector function for you to use.

`createSelector` is already included in the [Redux Toolkit official package](https://redux-toolkit.js.org), and is re-exported for use.

`createSelector` supports multiple input selectors, which can be passed as an array or as separate arguments. The return values of all input selectors will be passed in order as arguments to the output selector:

```js
const selectA = state => state.a
const selectB = state => state.b
const selectC = state => state.c

const selectABC = createSelector([selectA, selectB, selectC], (a, b, c) => {
  // Process a, b, and c, and return the result
  return a + b + c
})

// Call the selector function to get the result
const abc = selectABC(state)

// Can also be written in separate argument form, with the same effect
const selectABC2 = createSelector(selectA, selectB, selectC, (a, b, c) => {
  // Process a, b, and c, and return the result
  return a + b + c
})
```

When calling a selector, Reselect will invoke each input selector and compare the returned values. If any result differs from the previous one (`!==`), it recomputes the output selector and returns a new value; otherwise, it skips the output selector and directly returns the cached final result.

Therefore, **“input selectors” usually only extract/return values, while the “output selector” performs transformation and computation.**

:::caution

A common mistake is to have the “input selector” perform derived computations, while the “output selector” merely returns the input:

```js
// ❌ Incorrect example: will not memoize correctly, and is useless!
const brokenSelector = createSelector(
  state => state.todos,
  todos => todos
)
```

**Any “output selector” that simply returns its input unchanged is wrong!** The output selector should contain transformation logic.

Similarly, a memoized selector _should never_ use `state => state` as an input, otherwise it will always recompute.

:::

A typical usage pattern is to write top-level input selectors as simple functions that return values from state, then use `createSelector` to combine one or more inputs into a derived output:

```js
const selectTodos = state => state.todos.items
const selectCurrentUser = state => state.users.currentUser

const selectTodosForCurrentUser = createSelector(
  [selectTodos, selectCurrentUser],
  (todos, currentUser) => {
    console.log('output selector executed')
    return todos.filter(todo => todo.ownerId === currentUser.userId)
  }
)

const todosForCurrentUser1 = selectTodosForCurrentUser(state)
// Console prints: "output selector executed"

const todosForCurrentUser2 = selectTodosForCurrentUser(state)
// No output

console.log(todosForCurrentUser1 === todosForCurrentUser2)
// true
```

On the second call, the output selector did not run because the input selectors returned the same values, so the cached result was reused directly.

### `createSelector` Behavior Details

By default, **`createSelector` only caches the parameters and result from the most recent call**. When you call it consecutively with different parameters, the cache is invalidated and it must recompute:

**Note:** As of Reselect 5.0.0, `createSelector` uses `weakMapMemoize` by default, which provides better memory management than the previous `lruMemoize` implementation. This means memoized values are automatically cleaned up when no longer referenced.

```js
const a = someSelector(state, 1) // First call, not cached
const b = someSelector(state, 1) // Same parameters, cache hit
const c = someSelector(state, 2) // Different parameters, not cached
const d = someSelector(state, 1) // Using 1 again, no longer the most recent, not cached
```

A selector can accept multiple parameters, and Reselect will call all input selectors with those parameters:

```js
const selectItems = state => state.items
const selectItemId = (state, itemId) => itemId

const selectItemById = createSelector(
  [selectItems, selectItemId],
  (items, itemId) => items[itemId]
)

const item = selectItemById(state, 42)

/*
Reselect internally does:

const firstArg = selectItems(state, 42);  
const secondArg = selectItemId(state, 42);  
  
const result = outputSelector(firstArg, secondArg);  // returns the final result
*/
```

This means all input selectors should accept the same parameter types, otherwise errors will occur. For example:

```js
const selectItems = state => state.items

// Expects the second parameter to be a number
const selectItemId = (state, itemId) => itemId

// Expects the second parameter to be an object
const selectOtherField = (state, someObject) => someObject.someField

const selectItemById = createSelector(
  [selectItems, selectItemId, selectOtherField],
  (items, itemId, someField) => items[itemId]
)
```

If you call `selectItemById(state, 42)`, `selectOtherField` will throw an error because it tries to access `42.someField`.

### Reselect Usage Patterns and Limitations

#### Selector Nesting

You can use a selector created by `createSelector` as the input to another selector. For example:

```js
const selectTodos = state => state.todos

const selectCompletedTodos = createSelector([selectTodos], todos =>
  todos.filter(todo => todo.completed)
)

const selectCompletedTodoDescriptions = createSelector(
  [selectCompletedTodos],
  completedTodos => completedTodos.map(todo => todo.text)
)
```

#### Passing Input Parameters

The generated selector function can accept any parameters, such as `selectThings(a, b, c, d, e)`. Whether the output selector runs again depends on whether the defined **input selectors returned different results**, not on the parameters themselves.

If you want to pass extra parameters to the output selector, you must define corresponding input selectors to extract those values from the original arguments:

```js
const selectItemsByCategory = createSelector(
  [
    // First input - extract from state
    state => state.items,
    // Pass the second parameter category directly to the output selector
    (state, category) => category
  ],
  // Output selector receives (items, category)
  (items, category) => items.filter(item => item.category === category)
)
```

Usage example:

```js
const electronicItems = selectItemsByCategory(state, "electronics");
```

For consistency, you may want to pass extra parameters as an object, such as `selectThings(state, otherArgs)`, and then extract values from `otherArgs`.

#### Selector Factories

**`createSelector` by default only caches the most recently called result (cache size 1), and this is independent for each selector instance.** When the same selector is called repeatedly from multiple places with different parameters, cache effectiveness drops.

The solution is to use a “selector factory” — a function that runs `createSelector()` and creates a unique selector instance each time it is called:

```js
const makeSelectItemsByCategory = () => {
  const selectItemsByCategory = createSelector(
    [state => state.items, (state, category) => category],
    (items, category) => items.filter(item => item.category === category)
  )
  return selectItemsByCategory
}
```

This approach is useful for multiple components deriving different subsets of data based on their Props.

## 其他 Selector 库

虽然 Reselect 是 Redux 中最常用的选择器库，但也有其他库解决类似问题，或增强 Reselect 功能。

### `proxy-memoize`

`proxy-memoize` 是一个较新的缓存 selector 库，采用独特方案：利用 ES2015 `Proxy` 跟踪嵌套值的访问，后续调用时仅比较访问过的嵌套字段是否发生改变。这在某些场景下比 Reselect 效果更好。

比如用 Reselect 的选择一个 todo 描述数组：

```js
import { createSelector } from 'reselect'

const selectTodoDescriptionsReselect = createSelector(
  [state => state.todos],
  todos => todos.map(todo => todo.text)
)
```

只要 `state.todos` 中任意值变化（例如 `todo.completed`），该 selector 就会重新计算，尽管派生数组内容没有变，因为生成了新的数组引用。

而用 `proxy-memoize`：

```js
import { memoize } from 'proxy-memoize'

const selectTodoDescriptionsProxy = memoize(state =>
  state.todos.map(todo => todo.text)
)
```

`proxy-memoize` 只比较被访问的 `todo.text` 字段，只有当它们变化时才重算。

此外支持配置缓存大小 `size`。

缺点和区别包括：

- 只接收单一对象参数
- 需要支持 ES2015 `Proxy` (无 IE11)
- 更“神奇”，不如 Reselect 明确可见
- 存在少数边界情况
- 较新且使用率较低

总体而言，**我们官方鼓励考虑将 `proxy-memoize` 作为 Reselect 的合理替代方案**。

### `re-reselect`

https://github.com/toomuchdesign/re-reselect 改善了 Reselect 缓存行为，允许定义“key selector”来内部管理多个 selector 实例，有利于支持跨多个组件的缓存。

```js
import { createCachedSelector } from 're-reselect'

const getUsersByLibrary = createCachedSelector(
  // 输入选择器
  getUsers,
  getLibraryId,

  // 结果函数
  (users, libraryId) => expensiveComputation(users, libraryId)
)(
  // re-reselect 的 keySelector（接收输入的参数）
  // 用 "libraryName" 作为缓存键
  (_state_, libraryName) => libraryName
)
```

### `reselect-tools`

https://github.com/skortchmark9/reselect-tools 解决追踪多个 Reselect selectors 之间依赖关系和计算原因的难题，提供一套 DevTools 以可视化和检查 selector 值。

### `redux-views`

https://github.com/josepot/redux-views 类似 `re-reselect`，支持为每条数据选择唯一键以做一致缓存。设计为几乎可无缝替换 Reselect，甚至曾作为 Reselect v5 可能选项。

### Reselect v5 提案

我们在 Reselect 仓库开启了路线图讨论，商讨未来版本 Reselect 的改进方向，如支持更大缓存、用 TypeScript 重写、API 设计改进等，欢迎社区参与：

[**Reselect v5 路线图讨论：目标和 API 设计**](https://github.com/reduxjs/reselect/discussions/491)

## 在 React-Redux 中使用选择器

### 带参数调用选择器

常见需求是向 selector 函数传递额外参数，但 `useSelector` 只会以 state 作为唯一参数来调用 selector。

最简单的方案是把匿名 selector 传给 `useSelector`，并立即调用真正的 selector，传入 state 和其他参数：

```js
import { selectTodoById } from './todosSlice'

function TodoListitem({ todoId }) {
  // highlight-start
  // 捕获作用域中的 todoId，接收 state 作为参数，并转发两者调用真实的 selector
  const todo = useSelector(state => selectTodoById(state, todoId))
  // highlight-end
}
```

### 创建唯一的 Selector 实例

如果一个 selector 需要在多个组件中复用，并且使用不同参数调用，会破坏缓存——因为 selector 从不会连续收到相同的参数。

标准做法是在组件内创建 selector 的唯一缓存实例，然后再用于 `useSelector`。这样每个组件都会持续使用相同参数调用自己的 selector，从而保证缓存命中。

在函数组件里，通常使用 `useMemo` 或 `useCallback` 来实现：

```js
import { makeSelectItemsByCategory } from './categoriesSlice'

function CategoryList({ category }) {
  // 每个组件实例挂载时创建一个缓存 selector
  const selectItemsByCategory = useMemo(makeSelectItemsByCategory, [])

  const itemsByCategory = useSelector(state =>
    selectItemsByCategory(state, category)
  )
}
```

使用 `connect` 的类组件可以通过高级的“工厂函数（factory）”语法实现类似效果：

```js
import { makeSelectItemsByCategory } from './categoriesSlice'

const makeMapState = (state, ownProps) => {
  // 在闭包中创建唯一的 selector 实例（每个组件实例）
  const selectItemsByCategory = makeSelectItemsByCategory()

  const realMapState = (state, ownProps) => {
    return {
      itemsByCategory: selectItemsByCategory(state, ownProps.category)
    }
  }

  // 返回函数替代原 mapState，connect 会使用它
  return realMapState
}

export default connect(makeMapState)(CategoryList)
```

## 有效使用 Selectors

虽然 selectors 是 Redux 中常用模式，但经常被误用或误解。以下是正确使用的指南。

### 将 Selector 与 Reducer 放在一起定义

selector 函数通常定义在 UI 层，直接内联在 `useSelector`。但这可能导致重复定义匿名函数。

可以把匿名函数抽离并命名：

```js
// highlight-next-line
const selectTodos = state => state.todos

function TodoList() {
  // highlight-next-line
  const todos = useSelector(selectTodos)
}
```

多个地方可能会使用同样的查询。此外，也可能希望把 state 组织细节封装在 `todosSlice` 文件里，集中管理。

所以，**最好把可复用 selector 定义在对应 reducer 的同一个文件中**，比如导出 `selectTodos`：

```js title="src/features/todos/todosSlice.js"
import { createSlice } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push(action.payload)
    }
  }
})

export const { todoAdded } = todosSlice.actions
export default todosSlice.reducer

// highlight-start
// 导出可复用 selector
export const selectTodos = state => state.todos
// highlight-end
```

这样如果之后要改 todos 状态结构，只需修改这些 selector，其他代码改动最小。

### 选择性使用 Selector

过度使用 selector 不好。**为每个字段都写一个 selector 会让 Redux 像 Java 类里到处都是 getter/setter**。这不会提升代码质量，反而会增加维护难度，难以追踪数据使用位置。

同时，**不必所有 selector 都进行 memoization**。只有每次调用都会返回新引用，或计算昂贵时，才需要缓存。**直接查找返回值的 selector 应该是普通函数，不做缓存**。

示例：

```js
// ❌ 不缓存：总返回一致引用
const selectTodos = state => state.todos
const selectNestedValue = state => state.some.deeply.nested.field
const selectTodoById = (state, todoId) => state.todos[todoId]

// 🤔 可考虑缓存：派生数据但结果稳定，或者时常被使用、大列表遍历
const selectItemsTotal = state => {
  return state.items.reduce((result, item) => {
    return result + item.total
  }, 0)
}
const selectAllCompleted = state => state.todos.every(todo => todo.completed)

// ✅ 应缓存：每次都返回新引用
const selectTodoDescriptions = state => state.todos.map(todo => todo.text)
```

### 按需重塑状态

selectors 不必仅限于直接映射查询，也可以做各种转换，尤其方便准备组件所需的数据格式。

Redux 状态通常是“原始”形态，[因为状态应当保持最简](#deriving-data)，而多个组件可能需要不同的呈现形式。你可以使用 selector 名字来抽取、转换多个 slice 数据，或者合并、筛选等。

组件中也可以部分实现转换逻辑，但抽取为 selectors 有利于复用和测试。

### 需要时全局化 selectors

编写 slice reducer 时，只知道自己的状态片段，对应的 `state` 就是那片数据（如 todoSlice 中的 todo 数组）。但 selectors 通常接收整个根状态作为参数，必须知道 slice 状态在根状态中的位置，比如 `state.todos`。

通常 slice 文件里既有局部的 reducer 逻辑，也有“全局化”的 selectors，接收根状态并在内部查找对应 slice。

这种做“全局化”的 selector，叫做“globalized selectors”；而仅期望接受部分状态作为参数的，叫做“localized selectors”：

```js
// “全局化” - 接受根状态，知道在 state.todos 取值
const selectAllTodosCompletedGlobalized = state =>
  state.todos.every(todo => todo.completed)

// “局部化” - 只接受 todos 数据，不知道数据在哪
const selectAllTodosCompletedLocalized = todos =>
  todos.every(todo => todo.completed)
```

“局部化” selectors 可通过包装成函数，添加查找 slice 的逻辑，变成“全局化”。

Redux Toolkit 的 [`createEntityAdapter` API](https://redux-toolkit.js.org/api/createEntityAdapter#selector-functions) 就体现了这一点。如果调用 `todosAdapter.getSelectors()` 不传参数，返回的就是“局部化” selectors；传入 `state => state.todos`，则返回“全局化”版本。

有时“局部化” selectors 更有用。例如，若有多个 `createEntityAdapter` 嵌套存储，按域划分聊天室和消息数据，要先选聊天室，再取得消息，这时“局部化” selectors 很方便。

## 更多信息

- selector 相关库：
  - Reselect：https://github.com/reduxjs/reselect
  - `proxy-memoize`：https://github.com/dai-shi/proxy-memoize
  - `re-reselect`：https://github.com/toomuchdesign/re-reselect
  - `reselect-tools`：https://github.com/skortchmark9/reselect-tools
  - `redux-views`：https://github.com/josepot/redux-views
- [Reselect v5 路线图讨论：目标与 API 设计](https://github.com/reduxjs/reselect/discussions/491)
- Randy Coulman 有一篇很棒的系列博文，讨论 selector 架构以及 Redux selector 全局化等多种方法和权衡：
  - [封装 Redux 状态树](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
  - [Redux Reducer/Selector 非对称性](https://randycoulman.com/blog/2016/09/20/redux-reducer-selector-asymmetry/)
  - [模块化 Reducers 和 Selectors](https://randycoulman.com/blog/2016/09/27/modular-reducers-and-selectors/)
  - [Redux Selectors 全局化](https://randycoulman.com/blog/2016/11/29/globalizing-redux-selectors/)
  - [柯里化 selectors 的全局化](https://randycoulman.com/blog/2016/12/27/globalizing-curried-selectors/)
  - [解决模块化 Redux 的循环依赖](https://randycoulman.com/blog/2018/06/12/solving-circular-dependencies-in-modular-redux/)
