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

## 派生数据 {#deriving-data}

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
  // 箭头函数，直接查找
const selectEntities = (state: RootState) => state.entities

  // 函数声明，通过遍历数组派生值
function selectItemIds(state: RootState) {
  return state.items.map(item => item.id)
}

  // 函数声明，封装深层查找
function selectSomeSpecificField(state: RootState) {
  return state.some.deeply.nested.field
}

  // 箭头函数，从数组派生值
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

只要能访问完整的 Redux 根状态，就可以在任何地方使用 selector 函数，包括 `useSelector` hook、middleware、thunk、listener 和 saga。例如，thunk 和 middleware 可以访问 `getState` 参数，因此也可以在那里调用 selector：

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

### 只读取一次状态 {#reading-state-once}

React 组件通常应该使用 `useSelector`，因为它会订阅 store，并在选中值变化时更新组件。有时 React 以外的代码只能访问 `dispatch`，需要读取一次最新状态但不订阅变化。这种情况下，可以派发一个小型 thunk，用 `getState()` 调用 selector 并返回结果：

```ts
const selectFromState = <Selected>(
  selector: (state: RootState) => Selected
): AppThunk<Selected> => {
  return (_dispatch, getState) => selector(getState())
}

const users = dispatch(selectFromState(selectUsers))
```

这会在 thunk 运行时读取状态。返回值不会随之后的状态变化而更新，因此如果调用方需要响应后续变化，应使用 `useSelector` 等订阅 API。

### 使用 Selector 封装状态结构 {#encapsulating-state-shape-with-selectors}

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

- 与 `useSelector` 配合的 selector 会在每个 action 派发后重新运行，无论 Redux 根状态的哪个部分实际发生了变化。如果输入状态切片没有变化，却重复执行开销较大的计算，就会浪费 CPU 时间；而大多数时候输入确实并未变化。
- `useSelector` 依赖返回值的 `===` 引用相等性检查来决定组件是否需要重新渲染。如果 selector _总是_返回新引用，即使派生数据实际上与之前相同，也会强制组件重新渲染。`map()` 和 `filter()` 等数组操作总会返回新数组引用，因此尤其容易出现此问题。

- 用于 `useSelector` 或 `mapState` 的 selectors 在每次派发 action 后都会运行，无论实际更新的是哪个状态分片。重复执行昂贵计算浪费 CPU 时间，而大多数情况下输入数据是未改变的。
- `useSelector` 和 `mapState` 依赖返回值的 `===` 引用相等性判断，决定组件是否重新渲染。如果 selector _总是_ 返回新引用，即使派生数据相同，也会强制组件重新渲染。对数组操作如 `map()` 和 `filter()` 特别常见，因为它们始终返回新数组引用。

例如，下面这个组件写法不当，`useSelector` 调用_总是_返回新数组引用，导致组件 _每次_ 派发 action 后重渲染，即使 `state.todos` 没变：

```tsx
function TodoList() {
  // highlight-start
  // ❌ 警告：此处_总是_返回新引用，因此组件_总是_会重新渲染！
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

<a id="using-reselect-to-write-cached-selectors"></a>
## 使用 Reselect 编写记忆化 Selector {#writing-memoized-selectors-with-reselect}

Redux 生态使用名为 [**Reselect**](/reselect/introduction/getting-started) 的库来创建记忆化 selector 函数。Reselect 是独立的包，但 [Redux Toolkit](/toolkit) 重新导出了 `createSelector` 和其他 Reselect API，因此无需单独安装。

本页介绍如何在 Redux 应用中使用记忆化 selector。有关 Reselect 库本身的完整参考，请参阅 [Reselect 文档](/reselect/introduction/getting-started)，其中包括[记忆化的内部工作方式](/reselect/introduction/how-does-reselect-work)、[`createSelector` API](/reselect/api/createSelector) 及其选项、[记忆化函数](/reselect/api/weakMapMemoize)和[常见问题](/reselect/FAQ)。

### `createSelector` 概览 {#createselector-overview}

Reselect 的 [`createSelector`](/reselect/api/createSelector) 接受一个或多个“输入 selector”函数以及一个“结果函数”，并返回新的记忆化 selector。

调用生成的 selector 时，Reselect 会使用你传入的参数运行所有输入 selector，并将结果与上次调用的结果比较。如果任一结果的 `===` 比较不相等，它就会将这些结果作为参数重新运行结果函数。如果所有结果都与上次相同，则跳过结果函数，直接返回之前缓存的结果。

典型用法中，输入 selector 是一些简单函数，用于返回状态对象中嵌套的值；实际的派生计算则由结果函数完成：

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

第二次调用 `selectTodosForCurrentUser` 时，结果函数没有执行。`selectTodos` 和 `selectCurrentUser` 的结果与第一次调用时相同，所以 `selectTodosForCurrentUser` 返回了记忆化结果。

这意味着，**输入 selector 应只提取并返回值，转换工作应由结果函数完成**。如果结果函数只是原样返回某个输入，或者输入 selector 写成 `state => state`，就无法实现有效的记忆化。Reselect 文档中的[最佳实践和常见错误](/reselect/usage/best-practices)介绍了这些及其他陷阱；Reselect 的[开发模式检查](/reselect/api/development-only-checks)会在 selector 首次运行时对这两种情况发出警告。

### `createSelector` 的行为细节 {#createselector-behavior-details}

Reselect 分两层进行记忆化。首先，它会比较本次传给 selector 的参数与上次调用的参数；如果完全相同，就直接返回缓存结果，不运行任何函数。如果参数不同（每次 dispatch 后都会不同，因为根状态对象是新引用），它就运行输入 selector 并比较_它们_的结果。只有输入结果发生变化时，结果函数才会运行。Reselect 文档中的[“Reselect 如何工作？”](/reselect/introduction/how-does-reselect-work#cascading-memoization)对此有详细说明。

Reselect 5 默认使用 [`weakMapMemoize`](/reselect/api/weakMapMemoize) 进行记忆化。它会按引用为每组不同参数保留独立的缓存条目，因此连续使用不同输入调用 selector 不会淘汰之前的结果：

```ts
const a = someSelector(state, 1) // first call: runs the result function
const b = someSelector(state, 1) // same inputs: cached
const c = someSelector(state, 2) // new inputs: runs the result function
const d = someSelector(state, 1) // still cached from the first call
```

缓存条目以参数对象作为键保存在 `WeakMap` 中，因此这些对象被垃圾回收时，相应条目也会释放。无需配置缓存大小上限。

Reselect 4 及更早版本使用 [`lruMemoize`](/reselect/api/lruMemoize)，缓存大小为 1，因此只记住最近的一组参数。在该版本中，`c` 会淘汰 `(state, 1)` 的结果，`d` 需要重新计算。如果需要有界缓存，仍可使用 `lruMemoize`；下文[“Selector 工厂”](#selector-factories)一节会说明这种方式何时仍有用。

由于每个输入 selector 都会收到完整参数列表，**你提供的所有输入 selector 都应接受相同类型的参数**：

```ts
const selectItems = (state: RootState) => state.items

// 第二个参数应为数字
const selectItemId = (state: RootState, itemId: number) => itemId

// 第二个参数应为对象
const selectOtherField = (
  state: RootState,
  someObject: { someField: string }
) => someObject.someField

// ❌ 这些输入 selector 对第二个参数的类型要求不一致
const selectItemById = createSelector(
  [selectItems, selectItemId, selectOtherField],
  (items, itemId, someField) => items[itemId]
)
```

如果调用 `selectItemById(state, 42)`，`selectOtherField` 会出错，因为它会尝试访问 `42.someField`。TypeScript 会报告这个类型不匹配；纯 JavaScript 则会在运行时失败。

### Reselect 的用法模式与限制 {#reselect-usage-patterns-and-limitations}

#### Selector 嵌套 {#selector-nesting}

可以将 `createSelector` 创建的 selector 用作另一个 selector 的输入。例如：

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

#### 传递输入参数 {#passing-input-parameters}

Reselect 生成的 selector 可以接受任意数量的参数，例如 `selectThings(a, b, c, d, e)`。是否重新运行结果函数，取决于_输入 selector_的结果是否变化，而不是参数本身。因此，如果想将额外参数传给结果函数，就必须定义输入 selector，从原始 selector 参数中提取这些值：

```ts
const selectItemsByCategory = createSelector(
  [
    // 常见的第一个输入：从 `state` 中提取值
    (state: RootState) => state.items,
    // 获取第二个参数 `category`，并传给结果函数
    (state: RootState, category: string) => category
  ],
  // 结果函数接收 (items, category) 作为参数
  (items, category) => items.filter(item => item.category === category)
)

const electronicItems = selectItemsByCategory(state, 'electronics')
```

为了保持一致，可以考虑将额外参数作为单个对象传给 selector，例如 `selectThings(state, otherArgs)`，再从 `otherArgs` 对象中提取值。另请参阅 Reselect 常见问题中关于[接受参数的 selector](/reselect/FAQ#how-do-i-create-a-selector-that-takes-an-argument)的说明。

#### Selector 工厂 {#selector-factories}

在 Reselect 4 中，`lruMemoize` 默认缓存大小为 1，因此单个 selector 实例只能记住一组参数。如果多个组件使用不同分类调用 `selectItemsByCategory(state, category)`，每次调用都会淘汰上一次结果，并重新运行结果函数。解决办法是使用“selector 工厂”——调用 `createSelector()` 并为每个组件返回新 selector 实例的函数：

```ts
const makeSelectItemsByCategory = () =>
  createSelector(
    [(state: RootState) => state.items, (state, category: string) => category],
    (items, category) => items.filter(item => item.category === category)
  )
```

使用 Reselect 5 默认的 `weakMapMemoize` 时，一个共享 selector 就会为每组不同参数保留缓存条目，因此**通常不需要工厂**。如果改用 `lruMemoize` 设置有界缓存，或希望组件卸载时立即释放缓存（而不是等参数对象被垃圾回收），selector 工厂仍然有用。如何将它与 `useSelector` 配合使用，请参阅[创建唯一 Selector 实例](#creating-unique-selector-instances)；另请参阅 Reselect 常见问题中关于[多个组件实例共享 selector](/reselect/FAQ#can-i-share-a-selector-across-multiple-component-instances)的说明。

### Reselect 5

Reselect 5（于 2023 年 12 月发布）使用 TypeScript 编写，并更改了一些值得了解的默认设置：

- **`weakMapMemoize` 是默认记忆化函数。** 如上所述，它会按不同参数组进行缓存，且没有大小上限。若想恢复以前的行为，可以向 `createSelector` 传入 `memoize: lruMemoize`（也可传入 `memoizeOptions: { maxSize: 10 }`），或使用 [`createSelectorCreator`](/reselect/api/createSelectorCreator) 创建自定义 `createSelector`。
- **[`createSelector.withTypes<RootState>()`](/reselect/api/createSelector#defining-a-pre-typed-createselector)** 会返回一个输入 selector 已预设类型、接收根状态的 `createSelector`，因此无需在每个输入 selector 中标注 `state` 类型。
- **开发模式检查**会对本页前面介绍的两个常见错误发出警告：输入 selector 每次调用都返回新引用，以及结果函数原样返回输入值。检查会在开发环境下每个 selector 首次调用时执行，生产环境中关闭。请参阅[仅开发环境检查](/reselect/api/development-only-checks)。

```ts title="src/app/selectors.ts"
import { createSelector, lruMemoize } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const createAppSelector = createSelector.withTypes<RootState>()

// 输入 selector 会自动接收 `RootState`，无需额外标注
export const selectCompletedTodos = createAppSelector(
  [state => state.todos],
  todos => todos.filter(todo => todo.completed)
)

// 为单个 selector 改回有界 LRU 缓存
export const selectItemsByCategory = createAppSelector(
  [state => state.items, (state, category: string) => category],
  (items, category) => items.filter(item => item.category === category),
  { memoize: lruMemoize, memoizeOptions: { maxSize: 10 } }
)
```

Redux Toolkit 重新导出了 Reselect 的 `createSelector`、`createSelectorCreator`、`lruMemoize` 和 `weakMapMemoize`，因此无需单独安装 Reselect。[Reselect 5 变更摘要](/reselect/introduction/v5-summary)列出了所有变化。

## 其他 Selector 库

虽然 Reselect 是 Redux 中最常用的选择器库，但也有其他库解决类似问题，或增强 Reselect 功能。

### `proxy-memoize`

[`proxy-memoize`](https://github.com/dai-shi/proxy-memoize) 采用了不同的实现方式。它使用 `Proxy` 对象跟踪 selector 实际读取的嵌套值，之后调用时只比较这些值是否变化。在某些情况下，这比 Reselect 的效果更好。

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

与 Reselect 不同，`proxy-memoize` 可以检测到这里只访问了 `todo.text` 字段，因此只有某个 `todo.text` 字段发生变化时才会重新计算。

缺点和区别包括：

- 所有值都通过单个对象参数传入。
- 它的行为更像“魔法”，而 Reselect 更明确。
- 基于 `Proxy` 的跟踪行为存在一些边缘情况。
- 它的使用并不广泛。

如果 selector 只读取大型输入的一小部分，而你希望无关字段变化时避免重新计算，那么 `proxy-memoize` 是 Reselect 的一个合理替代方案。

### `re-reselect`

[`re-reselect`](https://github.com/toomuchdesign/re-reselect) 对 Reselect 进行了封装，并增加了“key selector”，从 selector 参数中选择缓存键，再为每个键管理独立的 Reselect selector 实例。由于 Reselect 5 的 `weakMapMemoize` 已经会为每组参数分别缓存，因此它主要适用于希望用明确的键（例如字符串 ID）而不是引用身份来决定使用哪个缓存条目的场景。

```ts
import { createCachedSelector } from 're-reselect'

const selectUsersByLibrary = createCachedSelector(
  // inputSelectors
  selectUsers,
  selectLibraryId,

  // 结果函数
  (users, libraryId) => expensiveComputation(users, libraryId)
)(
  // re-reselect keySelector（接收 selector 的参数）
  // 使用 "libraryName" 作为 cacheKey
  (_state: RootState, libraryName: string) => libraryName
)
```

## 在 React-Redux 中使用 Selector {#using-selectors-with-react-redux}

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

### 创建唯一的 Selector 实例 {#creating-unique-selector-instances}

记忆化 selector 通常会由多个组件共享，每个组件传入不同参数调用它。使用 Reselect 5 默认的 `weakMapMemoize` 时，这种用法可直接工作：共享 selector 会为每组不同参数保留缓存条目，因此各组件不会相互淘汰对方的结果。

如果选择了缓存容量较小的 `lruMemoize`，或希望组件卸载时立即释放其缓存结果，可以结合[selector 工厂](#selector-factories)和 `useMemo` 为每个组件创建独立的 selector 实例：

```tsx
import { useMemo } from 'react'
import { makeSelectItemsByCategory } from './categoriesSlice'
import { useAppSelector } from '../../app/hooks'

function CategoryList({ category }: { category: string }) {
  // 在挂载时为每个组件实例创建新的记忆化 selector
  const selectItemsByCategory = useMemo(makeSelectItemsByCategory, [])

  const itemsByCategory = useAppSelector(state =>
    selectItemsByCategory(state, category)
  )
}
```

如果仍使用旧版 `connect` API，对应的做法是 [`mapStateToProps` 的“工厂函数”形式](/react-redux/api/connect#factory-functions)：`mapState` 第一次调用时返回新的 `mapState` 函数。

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

### 选择性使用 Selector {#balance-selector-usage}

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

Redux Toolkit 的 [`createEntityAdapter` API](/toolkit/api/createEntityAdapter#selector-functions)就是这一模式的例子。如果不带参数调用 `todosAdapter.getSelectors()`，它会返回一组“局部化” selector，要求传入_实体 slice 状态_作为参数。如果调用 `todosAdapter.getSelectors(state => state.todos)`，则会返回一组“全局化” selector，要求传入 _Redux 根状态_作为参数。

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
