---
id: migrating-rtk-2
title: 迁移到 RTK 2.0 和 Redux 5.0
sidebar_label: 迁移到 RTK 2.0 和 Redux 5.0
hide_title: true
toc_max_heading_level: 4
---

&nbsp;

<div className="migration-guide">

# 迁移到 RTK 2.0 和 Redux 5.0

:::tip 你将学到的内容

- Redux Toolkit 2.0、Redux 核心 5.0、Reselect 5.0 和 Redux Thunk 3.0 的变更，包括破坏性变更和新特性

:::

## 介绍

Redux Toolkit 自 2019 年起发布，至今已成为编写 Redux 应用的标准方式。我们已经 4 年多没有任何破坏性变更。现在，RTK 2.0 给我们带来了现代化的打包机会，清理废弃选项，并收紧了一些边缘情况。

**Redux Toolkit 2.0 同时发布了所有其他 Redux 包的重大版本：Redux 核心 5.0、React-Redux 9.0、Reselect 5.0 和 Redux Thunk 3.0。**

本页列出了这些包中所有已知的潜在破坏性变更，以及 Redux Toolkit 2.0 中的新特性。提醒一下，**你实际上无需直接安装或使用核心 `redux` 包**——RTK 已封装该包，并重新导出所有方法和类型。

实际上，**大多数“破坏”变更不会对最终用户产生实际影响，我们预期许多项目只需更新包版本，而几乎不需要改动代码。**

最可能需要更新应用代码的变更是：

- [移除了 `createReducer` 和 `createSlice.extraReducers` 的对象语法](#object-syntax-for-createsliceextrareducers-and-createreducer-removed)
- [`configureStore.middleware` 必须是回调函数](#configurestoremiddleware-must-be-a-callback)
- [`Middleware` 类型发生变化 —— Middleware 的 `action` 和 `next` 参数类型更改为 `unknown`](#middleware-type-changed---middleware-action-and-next-are-typed-as-unknown)

## 包装变更（全部）

我们更新了所有 Redux 相关库的构建打包方式。技术上这些属于“破坏”变更，但**应该对最终用户是透明的**，并且实际上支持了例如在 Node 环境下通过 ESM 文件使用 Redux 等更好的场景。

#### `package.json` 中新增 `exports` 字段

我们迁移了包定义，包含了 `exports` 字段以定义加载哪个构件，使用现代 ESM 构建作为主构件（依然包含 CJS 用于兼容性）。

我们已经在本地测试了该包，但请社区在你们项目中尝试，如果发现断裂请反馈！

#### 构建产物现代化

我们对构建输出做了多项更新：

- **构建输出不再转译！** 而是直接以现代 JS 语法（ES2020）为目标
- 所有构建产物均搬到 `./dist/` 目录下，不再是顶层独立目录
- 我们测试的最低 TypeScript 版本改为 **TS 4.7**。

#### 放弃 UMD 构建

Redux 一直附带 UMD 构建产物，主要供直接作为 script 标签导入，比如在 CodePen 或无打包环境中使用。

目前，我们决定从发布包中移除这些 UMD 构建产物，因为这类用例如今很少见。

我们在 `dist/$PACKAGE_NAME.browser.mjs` 中提供了浏览器就绪的 ESM 构建产物，可通过指向 Unpkg 的文件的 script 标签加载。

如果你有强烈的需求需要我们继续包含 UMD 构建产物，请告知！

## 破坏性变更

### 核心

#### Action 类型 _必须_ 是字符串

我们一直明确告知用户， [action 和 state _必须_ 可序列化](https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions)，且 `action.type` _最好_ 是字符串。原因是保证 actions 可序列化，并方便 Redux DevTools 提供可读的 action 历史。

`store.dispatch(action)` 现在严格要求 **`action.type` _必须_ 是字符串**，如果不是会抛出错误，就像它检测 action 不是普通对象时会抛错一样。

实践中，这一限制 99.99% 的时间已被遵守（尤其是使用 Redux Toolkit 与 `createSlice` 的代码），不会对用户产生影响，但可能有少量遗留代码使用 Symbol 作为 action 类型。

#### `createStore` 弃用

在 [Redux 4.2.0 中，我们将原始的 `createStore` 标记为 `@deprecated`](https://github.com/reduxjs/redux/releases/tag/v4.2.0)。严格说来，**这不是破坏性变更，也不是 5.0 新增的，但这里为完整性做记录。**

**这个弃用仅是一个_视觉_提示，鼓励用户 [将应用从遗留 Redux 模式迁移到现代 Redux Toolkit API](https://redux.js.org/usage/migrating-to-modern-redux)。**

弃用表现为导入和使用时的**删除线显示**，如 **~~`createStore`~~**，但没有任何运行时错误或警告。

**`createStore` 将一直可用，且永远不会移除**。但我们希望**所有 Redux 用户**都能统一使用 Redux Toolkit 管理所有 Redux 逻辑。

修复方法有三种：

- **强烈建议切换到 Redux Toolkit 和 `configureStore`**，详见 [迁移文档](https://redux.js.org/usage/migrating-to-modern-redux)
- 不做任何事情。只是个视觉上的删除线提示，对代码行为无任何影响，直接忽略即可。
- 切换使用现导出的 `legacy_createStore` API，它与原函数完全相同但没有 `@deprecated` 标记。最简单的方案是用别名导入，如 `import { legacy_createStore as createStore } from 'redux'`

<div class="typescript-only">

#### TypeScript 重写

2019 年，我们开启了社区驱动的 Redux 代码库 TypeScript 转换工作。最初工作在 [#3500: Port to TypeScript](https://github.com/reduxjs/redux/issues/3500) 中讨论，后来在 PR [#3536: Convert to TypeScript](https://github.com/reduxjs/redux/issues/3536) 中整合完成。

但那部分 TS 代码几乎闲置多年，未发布，原因是担心兼容性问题以及我们团队缺乏变更动力。

Redux 核心 5 现基于该 TS 源码构建。理论上，其运行时行为和类型应与 4.x 版本极为相似，但某些改动可能导致类型不兼容。

若遇到任何意料之外的兼容性问题，请在 [Github](https://github.com/reduxjs/redux/issues) 报告！

#### `AnyAction` 被废弃，推荐使用 `UnknownAction`

Redux TS 类型一直导出 `AnyAction` 类型，其定义为 `{type: string}`，其他字段均为 `any`。这方便写诸如 `console.log(action.whatever)` 的代码，但缺乏实质类型安全。

我们新增了 `UnknownAction` 类型，对于 `action.type` 以外的字段均视为 `unknown` 类型。这样鼓励用户写类型保护函数，对 action 对象做检查并断言更加具体的 TS 类型。类型保护内部即可安全访问字段。

`UnknownAction` 现在是 Redux 源码中要求 action 对象的默认使用类型。

`AnyAction` 为兼容保留，但已标记为弃用。

值得注意的是，[Redux Toolkit 的 action 创建者有 `.match()` 方法](https://redux-toolkit.js.org/api/createAction#actioncreatormatch)，可用作类型保护：

```ts
if (todoAdded.match(someUnknownAction)) {
  // action 类型变为 PayloadAction<Todo>
}
```

你也可以用新的 `isAction` 工具检查未知值是否为 action 对象。

#### `Middleware` 类型变化 —— 中间件的 `action` 和 `next` 类型改为 `unknown`

之前，`next` 参数类型为传入的泛型 `D`，`action` 类型为从 dispatch 类型提取的 `Action`。这些假设并不总安全：

- `next` 被类型化为拥有**所有** dispatch 扩展，包括链中更前面可能已无效的扩展。
  - 严格来说，`next` 类型很大概率应为 base redux store 默认实现的 Dispatch，但这会导致调用 `next(action)` 报错（因为不能保证 `action` 为有效 `Action`），且无法适配后续中间件在遇到特定 `action` 时返回除传入 action 外的其他值。
- `action` 不一定是已知 action，实际上可以是任意值，比如 thunk 就是无 `.type` 属性的函数（故 `AnyAction` 类型不准确）。

我们改为将 `next` 类型定义为 `(action: unknown) => unknown`（准确反映我们无法确定 `next` 期待什么和返回什么），`action` 参数类型也改为 `unknown`。

为了安全操作 `action` 参数，需要先进行类型保护，如 `isAction(action)` 或某个 action 创建者的 `.match(action)`。

此新类型与 v4 `Middleware` 类型不兼容，如某中间件包提示不兼容，请检查该包引用了哪版 Redux 类型！详见本文稍后章节 [覆盖依赖](#overriding-dependencies)。

#### `PreloadedState` 类型被移除，改用 `Reducer` 泛型参数

我们调整了 TS 类型以提升类型安全和行为。

`Reducer` 类型现在新增了可能的 `PreloadedState` 泛型：

```ts
type Reducer<S, A extends Action, PreloadedState = S> = (
  state: S | PreloadedState | undefined,
  action: A
) => S
```

详见 [#4491](https://github.com/reduxjs/redux/pull/4491) 说明：

为何需要此变更？`createStore` / `configureStore` 创建 store 时，初始 state 会设置为传入的 `preloadedState`（或 undefined）。首次调用 reducer 时使用的是 `preloadedState`，随后的所有调用均使用当前 state（即 `S`）。

大多数常规 reducer，`S | undefined` 是可以接收的 `preloadedState` 类型。但 `combineReducers` 允许预加载状态为部分的 `Partial<S> | undefined`。

解决方法是为 reducer 接收的 `preloadedState` 类型单独定一个泛型，从而让 `createStore` 用它作为 `preloadedState` 参数类型。

过去是通过 `$CombinedState` 类型做的，但复杂且引发用户报告问题。此变动去除了该类型的需要。

该变更对用户确实是破坏性的，但对使用者影响不大：

- `Reducer`、`ReducersMapObject` 以及 `createStore` / `configureStore` 类型/函数增加了一个 `PreloadedState` 泛型，默认为 `S`。
- 移除了 `combineReducers` 的重载，改为单一函数定义，接收泛型 `ReducersMapObject`，因之前有时会选择错误重载。
- 明确列出 reducer 泛型的 enhancer 需要添加第三个泛型参数。

</div>

### 仅限 Toolkit

#### 移除 `createSlice.extraReducers` 和 `createReducer` 的对象语法

RTK 的 `createReducer` API 最初设计接受一个 action type 字符串到 case reducer 的查找表对象，如 `{ "ADD_TODO": (state, action) => {} }`。之后增加了“builder 回调”形式，可以更灵活地添加“matchers”及默认处理函数，`createSlice.extraReducers` 也同步支持了这一形式。

RTK 2.0 取消了 `createReducer` 和 `createSlice.extraReducers` 的“对象”形式，因为 builder 回调形式代码行数相同，但与 TypeScript 配合更佳。

举例，原写法：

```ts
const todoAdded = createAction('todos/todoAdded')

createReducer(initialState, {
  [todoAdded]: (state, action) => {}
})

createSlice({
  name,
  initialState,
  reducers: {
    /* case reducers here */
  },
  extraReducers: {
    [todoAdded]: (state, action) => {}
  }
})
```

应迁移为：

```ts
createReducer(initialState, builder => {
  builder.addCase(todoAdded, (state, action) => {})
})

createSlice({
  name,
  initialState,
  reducers: {
    /* case reducers here */
  },
  extraReducers: builder => {
    builder.addCase(todoAdded, (state, action) => {})
  }
})
```

##### 代码转换工具（Codemods）

为了简化升级，我们发布了一组 codemods，可以自动将弃用的“对象”语法转换为等价的“builder”语法。

codemods 包在 NPM 上名为 [`@reduxjs/rtk-codemods`](https://www.npmjs.com/package/@reduxjs/rtk-codemods)。更多详见 [文档](https://redux-toolkit.js.org/api/codemods)。

运行方法：

```sh
npx @reduxjs/rtk-codemods createReducerBuilder ./src

npx @reduxjs/rtk-codemods createSliceBuilder ./packages/my-app/**/*.ts
```

建议运行后再用 Prettier 格式化代码，方便提交。

该 codemod 应该有效，我们非常欢迎更多真实项目反馈！

#### `configureStore.middleware` 必须是回调函数

从头开始，`configureStore` 的 `middleware` 可接受直接数组。但直接提供数组阻止了 `configureStore` 调用 `getDefaultMiddleware()`，意味着 `middleware: [myMiddleware]` 不包含 thunk 中间件和开发模式检查。

这是潜在陷阱，多个用户误配置后造成应用失败。

因此我们现在只接受回调形式。如果要完全替换**所有**默认中间件，需以回调返回数组：

```ts
const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware => {
    // 警告：这意味着不会包含任何默认中间件！
    return [myMiddleware]
    // TS 用户可用：
    // return new Tuple(myMiddleware)
  }
})
```

但我们**强烈推荐**不要完全替换默认中间件，建议使用：

```ts
return getDefaultMiddleware().concat(myMiddleware)
```

#### `configureStore.enhancers` 必须是回调函数

`configureStore.middleware` 的规则同理适用于 `enhancers` 字段。

回调参数是 `getDefaultEnhancers` 函数，支持自定义默认批处理增强器（[现在默认包含](#configurestore-adds-autobatchenhancer-by-default)）。

示例：

```ts
const store = configureStore({
  reducer,
  enhancers: getDefaultEnhancers => {
    return getDefaultEnhancers({
      autoBatch: { type: 'tick' }
    }).concat(myEnhancer)
  }
})
```

注意，`getDefaultEnhancers` 的结果还包含由配置中间件创建的中间件增强器。为防止错误，如果用户传了 `middleware` 但在回调返回结果里没包含中间件增强器，`configureStore` 会在控制台打印错误。

```ts
const store = configureStore({
  reducer,
  enhancers: getDefaultEnhancers => {
    return [myEnhancer] // 这里丢失了 middleware 增强器
    // 应该改为
    return getDefaultEnhancers().concat(myEnhancer)
  }
})
```

#### 移除单独的 `getDefaultMiddleware` 和 `getType`

自 v1.6.1 起，单独导出 `getDefaultMiddleware` 已弃用，现在彻底移除。请使用传入`middleware`回调的函数，类型正确。

`getType` 导出也被移除，该函数用于从 `createAction` 创建的 action creator 抽取类型字符串。请改用静态属性 `actionCreator.type`。

#### RTK Query 行为变更

有多条用户反馈指出，在使用 `dispatch(endpoint.initiate(arg, {subscription: false}))` 时 RTK Query 存在问题，也有报告多个懒查询（lazy queries）在触发后 Promise 解决时机异常。这二者的根因都是 RTKQ 在这些情况下没跟踪缓存条目（这是故意的）。我们重写了逻辑，使其始终追踪缓存条目（并按需移除），解决了行为问题。

还有关于连续多次 mutation 以及标签失效行为的反馈。RTKQ 现在内部会稍作延迟标签失效，合并多次失效处理。此行为由 `createApi` 的新 `invalidationBehavior: 'immediate' | 'delayed'` 参数控制，默认是 `'delayed'`。设置为 `'immediate'` 可回退到 RTK 1.9 行为。

RTK 1.9 改写了 RTK Query 内部，绝大多数订阅状态保存在 RTKQ 中间件内。状态仍同步到 Redux store，主要供 Redux DevTools “RTK Query” 面板使用。结合缓存条目变化，我们优化了同步频率以提升性能。

#### `reactHooksModule` 自定义 Hook 配置

早期可单独传递 React Redux Hooks 的自定义实现（`useSelector`、`useDispatch`、`useStore`）给 `reactHooksModule`，例如使用不同的 context。

实际上，react hooks 模块需要同时传三个 hook，单独只传两个容易出错（通常是漏了 `useStore`）。

现新版本改为统一放在一个 `hooks` 配置项内，且如果提供该配置，将校验三个 hook 都被提供。

```ts
// 以前
const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    useDispatch: createDispatchHook(MyContext),
    useSelector: createSelectorHook(MyContext),
    useStore: createStoreHook(MyContext)
  })
)

// 现在
const customCreateApi = buildCreateApi(
  coreModule(),
  reactHooksModule({
    hooks: {
      useDispatch: createDispatchHook(MyContext),
      useSelector: createSelectorHook(MyContext),
      useStore: createStoreHook(MyContext)
    }
  })
)
```

#### 错误消息提取

Redux 4.1.0 优化了包体积，将错误消息字符串从生产版中提取出去（借鉴 React 做法），RTK 同样采用此技术。可减小约 1000 字节体积（实际视导入情况）。

<div class="typescript-only">

#### `configureStore` 中字段顺序重要

同时给 `configureStore` 传入 `middleware` 和 `enhancers`，则 `middleware` **必须** 在前，否则 TS 内部推断失效。

#### 非默认的 middleware/enhancers 必须使用 `Tuple`

发现许多用户传入 `middleware` 参数时，直接扩展了 `getDefaultMiddleware()` 返回的数组，或使用另一个普通数组，导致单个 middleware 类型失效，TS 出错，例如 `dispatch` 类型降级为 `Dispatch<AnyAction>`，无法识别 thunk。

`getDefaultMiddleware()` 内部实现了一个 `MiddlewareArray` 类，为数组子类，提供强类型的 `.concat/prepend()` 方法，捕获并保留中间件类型。

该类型现改名为 `Tuple`。`configureStore` 的 TS 类型强制要求传入的中间件数组必须是 `Tuple`：

```ts
import { configureStore, Tuple } from '@reduxjs/toolkit'

configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => new Tuple(additionalMiddleware, logger)
})
```

（使用纯 JS 时不受影响，仍可传普通数组。）

同样限制适用于 `enhancers` 字段。

#### Entity adapter 类型更新

`createEntityAdapter` 现在增加了 `Id` 泛型参数，用以强类型化实体的 ID，此类型覆盖原来始终为 `string | number` 的限制。TS 会尝试从实体类型的 `.id` 字段或 `selectId` 返回推断，或可直接传该泛型。

**直接使用 `EntityState<Data, Id>` 类型时，必须提供两个泛型参数！**

`.entities` 查找表类型改为标准 TS 的 `Record<Id, MyEntityType>`，默认假设所有 ID 都存在。原先的 `Dictionary<MyEntityType>` 则包含 `MyEntityType | undefined`，现在删除该类型。

如需保留查找可能不存在的假设，可使用 TypeScript 的 `noUncheckedIndexedAccess` 选项控制。

</div>

### Reselect

#### `createSelector` 默认使用 `weakMapMemoize` 作为默认缓存器

**`createSelector` 默认 memoizer 改为 `weakMapMemoize`**。该 memoizer 提供几乎无限的缓存大小，简化了传入不同参数的使用，但只基于引用比较。

如果你需要自定义相等比较，可以显式配置 `createSelector` 使用原始的 `lruMemoize`：

```ts no-emit
createSelector(inputs, resultFn, {
  memoize: lruMemoize,
  memoizeOptions: { equalityCheck: yourEqualityFunction }
})
```

#### `defaultMemoize` 改名为 `lruMemoize`

因默认 memoizer 改变，原 `defaultMemoize` 函数被更名为 `lruMemoize`，方便区分。仅当你主动导入自定义选择器时相关。

#### `createSelector` 开发模式检查

`createSelector` 现在在开发模式下对常见错误做检查，例如输入选择器总返回新引用，或结果函数直接返回参数等。这些检查可在选择器创建时或全局进行配置。

此检查重要，因为输入选择器返回新引用会导致缓存根本不起作用，结果选择器频繁计算新值，引起不必要的重复渲染。

举例：

```ts
const addNumbers = createSelector(
  // 该输入选择器每次返回新对象，缓存永远无效
  (a, b) => ({ a, b }),
  ({ a, b }) => ({ total: a + b })
)
// 应该使用稳定的输入选择器
const addNumbersStable = createSelector(
  (a, b) => a,
  (a, b) => b,
  (a, b) => ({
    total: a + b
  })
)
```

这些检查在选择器首次被调用时进行，除非配置关闭。详细请参考 [Reselect 开发模式检查文档](https://reselect.js.org/api/development-only-stability-checks)。

注意 RTK 导出 `createSelector`，但不会导出配置全局检查的方法；如需使用，请直接依赖 `reselect` 并自行导入。

<div class="typescript-only">

#### `ParametricSelector` 类型移除

移除 `ParametricSelector` 和 `OutputParametricSelector`，请使用 `Selector` 和 `OutputSelector`。

</div>

### React-Redux

#### 需要 React 18

React-Redux v7 和 v8 在支持 hooks 的所有 React 版本（16.8+、17、18）均可用。v8 通过 React 新的 `useSyncExternalStore` hook 维护内部订阅，使用 shim 兼容了 React 16.8 和 17。

**React-Redux v9 要求 _必须_ 使用 React 18，不再支持 React 16 或 17。** 这使我们能移除 shim，减少包尺寸。

### Redux Thunk

#### Thunk 使用具名导出

`redux-thunk` 包曾默认导出中间件，且上附 `withExtraArgument` 字段用于自定义。

默认导出已移除。现在两个具名导出：`thunk`（基础中间件）和 `withExtraArgument`。

如果你用 Redux Toolkit，通常无影响，因为 `configureStore` 内已处理。

## 新特性

这些特性是 Redux Toolkit 2.0 新增，解决了生态系统用户对额外使用场景的需求。

### `combineSlices` API 支持切片 reducer 动态注入，实现代码拆分

Redux 核心一直含 `combineReducers`，接受许多“切片 reducer”对象，生成调用它们的 reducer。RTK 的 `createSlice` 生成切片 reducer 及对应 action creator，我们一般习惯导出命名 action creator 与默认默认导出切片 reducer。我们未官方支持懒加载 reducer，但曾在文档有示例教程。

本版本引入新的 [`combineSlices`](https://redux-toolkit.js.org/api/combineSlices) API，支持在运行时动态注入切片、实现懒加载。该函数接受单个切片或切片对象，自动调用 `combineReducers`，以 `sliceObject.name` 作为对应 state 字段键名。生成的 reducer 还带 `.inject()` 方法，可用来动态注入切片；以及 `.withLazyLoadedSlices()` 方法，支持为稍后注入的 reducer 生成 TS 类型。参考 [#2776](https://github.com/reduxjs/redux-toolkit/issues/2776)。

注意，该功能暂未内置到 `configureStore`，你需手动调用：

```ts
const rootReducer = combineSlices(...)
configureStore({ reducer: rootReducer })
```

**基础示例：混合传入切片和普通 reducer**

```ts
const stringSlice = createSlice({
  name: 'string',
  initialState: '',
  reducers: {}
})

const numberSlice = createSlice({
  name: 'number',
  initialState: 0,
  reducers: {}
})

const booleanReducer = createReducer(false, () => {})

const api = createApi(/*  */)

const combinedReducer = combineSlices(
  stringSlice,
  {
    num: numberSlice.reducer,
    boolean: booleanReducer
  },
  api
)
expect(combinedReducer(undefined, dummyAction())).toEqual({
  string: stringSlice.getInitialState(),
  num: numberSlice.getInitialState(),
  boolean: booleanReducer.getInitialState(),
  api: api.reducer.getInitialState()
})
```

**基本切片 reducer 注入**

```ts
// 创建类型推断会知道 `numberSlice` 会被注入的 reducer
const combinedReducer =
  combineSlices(stringSlice).withLazyLoadedSlices<
    WithSlice<typeof numberSlice>
  >()

// 初始时 `state.number` 不存在
expect(combinedReducer(undefined, dummyAction()).number).toBe(undefined)

// 创建带 `numberSlice` 注入的 reducer（主要为类型用途）
const injectedReducer = combinedReducer.inject(numberSlice)

// `state.number` 存在，injectedReducer 的类型也不再 optional
expect(injectedReducer(undefined, dummyAction()).number).toBe(
  numberSlice.getInitialState()
)

// 原始 reducer 也被动态改变，但类型仍标为 optional
expect(combinedReducer(undefined, dummyAction()).number).toBe(
  numberSlice.getInitialState()
)
```

### `createSlice` 新增 `selectors` 字段

`createSlice` API 新增 [`selectors`](https://redux-toolkit.js.org/api/createSlice#selectors) 字段，支持切片内定义选择器。默认这些选择器假设切片挂载在根 state 中，使用 `slice.name` 作为状态字段，如 `name: "todos"` 映射为 `rootState.todos`。另有 `slice.selectSlice` 方法进行默认根状态访问。

也可调用 `sliceObject.getSelectors(selectSliceState)`，基于其他路径生成选择器，类似 `entityAdapter.getSelectors()`。

示例：

```ts
const slice = createSlice({
  name: 'counter',
  initialState: 42,
  reducers: {},
  selectors: {
    selectSlice: state => state,
    selectMultiple: (state, multiplier: number) => state * multiplier
  }
})

// 基础使用
const testState = {
  [slice.name]: slice.getInitialState()
}
const { selectSlice, selectMultiple } = slice.selectors
expect(selectSlice(testState)).toBe(slice.getInitialState())
expect(selectMultiple(testState, 2)).toBe(slice.getInitialState() * 2)

// 如果切片挂载到真路径下
const customState = {
  number: slice.getInitialState()
}
const { selectSlice, selectMultiple } = slice.getSelectors(
  (state: typeof customState) => state.number
)
expect(selectSlice(customState)).toBe(slice.getInitialState())
expect(selectMultiple(customState, 2)).toBe(slice.getInitialState() * 2)
```

### `createSlice.reducers` 回调语法及 thunk 支持

长期以来，用户反馈希望能在 `createSlice` 内直接声明 thunk。以往你不得不分开写 thunk，指定其 action 前缀字符串，通过 `createSlice.extraReducers` 处理它产生的动作：

```ts
// thunk 独立声明
const fetchUserById = createAsyncThunk(
  'users/fetchByIdStatus',
  async (userId: number, thunkAPI) => {
    const response = await userAPI.fetchById(userId)
    return response.data
  }
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // 普通 case reducers
  },
  extraReducers: builder => {
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      state.entities.push(action.payload)
    })
  }
})
```

用户都觉得这不方便。

我们一直想在 `createSlice` 内支持定义 thunk，尝试了多种方案。主要难点及顾虑：

1. thunk 在 slice 内的声明语法不明确。
2. thunk 有 `getState` 和 `dispatch`，但 `RootState` 和 `AppDispatch` 类型通常从 store 推断，store 又依赖 slice，导致类型循环。我们不想发布对于 JS 用户可用但 TS 用户体验差的 API。
3. ES 模块无法同步条件导入 `createAsyncThunk`，只能要么始终依赖它（增大包体），要么根本没法在 `createSlice` 里用。

我们现在折中方案：

- **在 `createSlice` 内用 thunk，需先自定义一个包含 `createAsyncThunk` 的 `createSlice` 实例，详见[文档说明](https://redux-toolkit.js.org/api/createSlice#createasyncthunk)**。
- 通过类似 RTK Query `createApi` 的 `build` 回调语法，在 `reducers` 字段内声明 thunk。
- 可以部分定制 thunk 类型，但不能定制 `state` 和 `dispatch`，如需定制，可用 `as` 类型断言。

希望这些权衡合理。若 TS 类型限制，可仍用旧法在外声明 async thunk。多数异步 thunk 也无需 `dispatch` 或 `getState`。

新语法示例：

```ts
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator }
})

const todosSlice = createSliceWithThunks({
  name: 'todos',
  initialState: {
    loading: false,
    todos: [],
    error: null
  } as TodoState,
  reducers: create => ({
    // 普通 case reducer
    deleteTodo: create.reducer((state, action: PayloadAction<number>) => {
      state.todos.splice(action.payload, 1)
    }),
    // 带 prepare 回调的 case reducer
    addTodo: create.preparedReducer(
      (text: string) => {
        const id = nanoid()
        return { payload: { id, text } }
      },
      (state, action) => {
        state.todos.push(action.payload)
      }
    ),
    // 异步 thunk
    fetchTodo: create.asyncThunk(
      // 第一参数：异步任务函数
      async (id: string, thunkApi) => {
        const res = await fetch(`myApi/todos?id=${id}`)
        return (await res.json()) as Item
      },
      // 第二参数：含 `{pending?, rejected?, fulfilled?, settled?, options?}` 的对象
      {
        pending: state => {
          state.loading = true
        },
        rejected: (state, action) => {
          state.error = action.payload ?? action.error
        },
        fulfilled: (state, action) => {
          state.todos.push(action.payload)
        },
        // rejected 和 fulfilled 都触发的 settled
        settled: (state, action) => {
          state.loading = false
        }
      }
    )
  })
})

// 导出 action creators
export const { addTodo, deleteTodo, fetchTodo } = todosSlice.actions
```

#### Codemod

**使用新回调语法完全可选（对象语法仍然有效）**，但现有 slice 需要转换才能用新功能，相关[代码转化工具](https://redux-toolkit.js.org/api/codemods)已提供。

示例：

```sh
npx @reduxjs/rtk-codemods createSliceReducerBuilder ./src/features/todos/slice.ts
```

### “动态 middleware”中间件

Redux store 的 middleware 管道在创建时固定，无法后续增删。生态系统部分库尝试支持动态添加和移除中间件，用于代码拆分场景。

这是边缘用例，但我们实现了自己的“动态中间件”中间件，[API 文档](https://redux-toolkit.js.org/api/createDynamicMiddleware)。

运行时先添加到 store，之后可动态添加中间件。还有 React hook 集成，自动添加中间件并返回更新的 dispatch 方法。

示例：

```ts
import { createDynamicMiddleware, configureStore } from '@reduxjs/toolkit'

const dynamicMiddleware = createDynamicMiddleware()

const store = configureStore({
  reducer: {
    todos: todosReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(dynamicMiddleware.middleware)
})

// 后续添加中间件
dynamicMiddleware.addMiddleware(someOtherMiddleware)
```

### `configureStore` 默认添加 `autoBatchEnhancer`

[1.9.0 版中，我们新增了 `autoBatchEnhancer`](https://github.com/reduxjs/redux-toolkit/releases/tag/v1.9.0)，它会延迟通知订阅者，批处理连续的“低优先级”动作。UI 更新通常是性能瓶颈，此增强可提升性能。RTK Query 默认标记自身绝大部分内部动作为“低优先级”，但需要该增强器才能生效。

我们已修改 `configureStore` 使其默认添加 `autoBatchEnhancer`，让用户自动享受性能优化，无需手动配置。

### `entityAdapter.getSelectors` 接受 `createSelector` 函数

[`entityAdapter.getSelectors()`](https://redux-toolkit.js.org/api/createEntityAdapter#selector-functions) 现在接受第二个选项对象，允许你传入自定义的 `createSelector` 函数，用于缓存生成的选择器。这样你可以用 Reselect 的新 memoizer 或类似功能的库。

### Immer 10.0

[Immer 10.0](https://github.com/immerjs/immer/releases/tag/v10.0.0) 现已正式发布，带来重大改进：

- 更新性能大幅提升
- 包体积显著缩小
- 更好的 ESM/CJS 包结构
- 移除了默认导出
- 放弃 ES5 fallback

RTK 现在依赖最终版 Immer 10.0。

### Next.js 设置指南

新增文档页，讲解 [如何正确在 Next.js 中使用 Redux](https://redux.js.org/usage/nextjs)。针对许多关于 Redux、Next 和 App Router 配合的问题，提供指导。

（目前 Next.js 官方 `with-redux` 示例包内仍使用过时模式，我们会提交 PR 更正以符合文档。）

## 覆盖依赖

包更新 peerDependencies 以支持 Redux 核心 5.0 需时间间隔，**此期间类似 [Middleware 类型变更](#middleware-type-changed---middleware-action-and-next-are-typed-as-unknown) 会导致兼容性问题**。

多数库实际上不兼容 5.0，只是因为依赖了旧的 4.0 类型定义。

可通过手动覆盖依赖解决，npm 和 yarn 都支持。

### `npm` - `overrides`

在 `package.json` 中 `overrides` 字段可覆盖依赖：

```json title="单包覆盖 - redux-persist"
{
  "overrides": {
    "redux-persist": {
      "redux": "^5.0.0"
    }
  }
}
```

```json title="全局覆盖"
{
  "overrides": {
    "redux": "^5.0.0"
  }
}
```

### `yarn` - `resolutions`

Yarn 使用 `package.json` 中 `resolutions` 字段选择性覆盖：

```json title="单包覆盖 - redux-persist"
{
  "resolutions": {
    "redux-persist/redux": "^5.0.0"
  }
}
```

```json title="全局覆盖"
{
  "resolutions": {
    "redux": "^5.0.0"
  }
}
```

## 推荐实践

基于 2.0 和之前版本变更，总结一些思考，非必需但建议了解。

### 替代 `actionCreator.toString()` 的方法

RTK 原始 API 中，`createAction` 创建的 action creator 重写了 `toString()`，返回 action type。

此设计最方便用在 [已移除的对象语法中](#object-syntax-for-createsliceextrareducers-and-createreducer-removed)：

```ts
const todoAdded = createAction<Todo>('todos/todoAdded')

createReducer(initialState, {
  [todoAdded]: (state, action) => {} // 触发 toString，返回 'todos/todoAdded'
})
```

虽方便（其他 Redux 库如 `redux-saga` 和 `redux-observable` 也不同程度支持），但与 TypeScript 配合略显“魔法”：

```ts
const test = todoAdded.toString()
//    ^? 类型为 string，不是具体 action type
```

action creator 增加了静态 `type` 属性与 `match` 方法，更好兼容 TS，且明确：

```ts
const test = todoAdded.type
//    ^? 'todos/todoAdded'

// `match` 是类型谓词
if (todoAdded.match(unknownAction)) {
  unknownAction.payload
  // ^? 类型变为 PayloadAction<Todo>
}
```

为兼容，`toString` 仍保留，但建议使用这些静态属性。

例如 `redux-observable` 中：

```ts
// 旧写法（运行正常，但类型过滤不理想）
const epic = (action$: Observable<Action>) =>
  action$.pipe(
    ofType(todoAdded),
    map(action => action)
    //   ^? 类型仍为 Action<any>
  )

// 推荐写法（类型过滤更好）
const epic = (action$: Observable<Action>) =>
  action$.pipe(
    filter(todoAdded.match),
    map(action => action)
    //   ^? 变为 PayloadAction<Todo>
  )
```

`redux-saga` 中：

```ts
// 旧写法（仍可用）
yield takeEvery(todoAdded, saga)

// 推荐写法
yield takeEvery(todoAdded.match, saga)
// 或
yield takeEvery(todoAdded.type, saga)
```

## 未来计划

### 自定义切片 reducer 创建器

伴随 [createSlice 回调语法](#callback-syntax-for-createslicereducers) 诞生，有建议支持自定义切片 reducer 创建器。这些创建器可：

- 通过添加 case reducer 或 matcher 修改 reducer 行为
- 将行动（或其它函数）附加到 `slice.actions`
- 将定义的 case reducer 附加到 `slice.caseReducers`

创建器初始经过 `createSlice` 调用返回“定义”结构，由其处理添加任何 reducer 或 action。

目前 API 未定，但现有 `create.asyncThunk` 创建器示意如下：

```js
const asyncThunkCreator = {
  type: ReducerType.asyncThunk,
  define(payloadCreator, config) {
    return {
      type: ReducerType.asyncThunk, // 用于匹配 reducer 类型，调用正确处理函数
      payloadCreator,
      ...config
    }
  },
  handle(
    {
      reducerName,
      type
    },
    definition,
    context
  ) {
    const { payloadCreator, options, pending, fulfilled, rejected, settled } =
      definition
    const asyncThunk = createAsyncThunk(type, payloadCreator, options)

    if (pending) context.addCase(asyncThunk.pending, pending)
    if (fulfilled) context.addCase(asyncThunk.fulfilled, fulfilled)
    if (rejected) context.addCase(asyncThunk.rejected, rejected)
    if (settled) context.addMatcher(asyncThunk.settled, settled)

    context.exposeAction(reducerName, asyncThunk)
    context.exposeCaseReducer(reducerName, {
      pending: pending || noop,
      fulfilled: fulfilled || noop,
      rejected: rejected || noop,
      settled: settled || noop
    })
  }
}

const createSlice = buildCreateSlice({
  creators: {
    asyncThunk: asyncThunkCreator
  }
})
```

但不确定有多少用户或库会采用，欢迎至 [Github 讨论](https://github.com/reduxjs/redux-toolkit/issues/3837) 提反馈。

### `createSlice.selector` 选择器工厂

内部存在关于 `createSlice.selectors` 是否充分支持 memoized 选择器的担忧。它支持传入 memoized 选择器，但仅有一实例。

```ts
const todoSlice = createSlice({
  name: 'todos',
  initialState: {
    todos: [] as Todo[]
  },
  reducers: {},
  selectors: {
    selectTodosByAuthor = createSelector(
      (state: TodoState) => state.todos,
      (state: TodoState, author: string) => author,
      (todos, author) => todos.filter(todo => todo.author === author)
    )
  }
})

export const { selectTodosByAuthor } = todoSlice.selectors
```

由于 `createSelector` 默认缓存大小 1，调用多个组件传不同参数会失效。

常见解决办法（非 `createSlice` 使用）是[选择器工厂](https://redux.js.org/usage/deriving-data-selectors#creating-unique-selector-instances)：

```ts
export const makeSelectTodosByAuthor = () =>
  createSelector(
    (state: RootState) => state.todos.todos,
    (state: RootState, author: string) => author,
    (todos, author) => todos.filter(todo => todo.author === author)
  )

function AuthorTodos({ author }: { author: string }) {
  const selectTodosByAuthor = useMemo(makeSelectTodosByAuthor, [])
  const todos = useSelector(state => selectTodosByAuthor(state, author))
}
```

`createSlice.selectors` 无法动态创建实例，因为需在 `createSlice` 创建时声明选择器。

在 2.0.0 目前无定论，有些 API 思路被浮现（[PR 1](https://github.com/reduxjs/redux-toolkit/pull/3671), [PR 2](https://github.com/reduxjs/redux-toolkit/pull/3836)），但未最终确定。若对此有兴趣，欢迎在 [Github 讨论](https://github.com/reduxjs/redux-toolkit/discussions/3387) 发表意见！

### 3.0 - RTK Query

RTK 2.0 主要关注核心与 Toolkit 改进。2.0 发布后，我们计划转向 RTK Query，目前尚有不完善之处，或需破坏性变更，可能导致 3.0 版本发布。

请在 [RTK Query API 痛点反馈主题](https://github.com/reduxjs/redux-toolkit/issues/3692) 提交意见！

</div>