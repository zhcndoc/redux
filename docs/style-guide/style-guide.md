---
id: style-guide
title: 风格指南
description: 'Redux 风格指南：使用 Redux 的推荐模式和最佳实践'
hide_title: true
sidebar_label: '风格指南：最佳实践'
---

import { DetailedExplanation } from '../components/DetailedExplanation'

<div class="style-guide">

# Redux 风格指南

## 介绍

这是官方的 Redux 代码编写风格指南。**它列出了我们推荐的模式、最佳实践以及编写 Redux 应用程序的建议方法。**

Redux 核心库和大部分 Redux 文档都是非强制性的。Redux 有许多使用方式，很多情况下并不存在单一的“正确”的做法。

然而，时间和经验表明，对于某些话题，某些方法比其他方法更有效。另外，许多开发者也希望我们提供官方指导以减少决策疲劳。

基于此，**我们整理了这份建议清单，帮助你避免错误、纠结和反面模式**。我们也理解不同团队有不同的偏好，不同项目有不同的需求，所以没有哪份风格指南能适用于所有情况。**我们鼓励你遵循这些建议，但请花时间评估自身情况，决定是否适合你的需求**。

最后，我们感谢 Vue 文档作者撰写的 [Vue 风格指南页面](https://vuejs.org/v2/style-guide/)，该页面为本页提供了灵感。

## 规则分类

我们将这些规则划分为三个类别：

### 优先级 A：必需

**这些规则有助于防止错误，因此务必学习并遵守。** 例外情况可能存在，但应极为罕见，并且只能由对 JavaScript 和 Redux 都有专家级知识的人决定。

### 优先级 B：强烈推荐

这些规则被发现能提高大多数项目的可读性和/或开发者体验。如果违反规则，代码依然能运行，但应尽量避免且有充分理由。**只要合理可能，务必遵守这些规则**。

### 优先级 C：推荐

当存在多个同等优秀的选项时，可任选其一以保证一致性。此类别中，**我们描述每个可接受的选项并建议一个默认选择**。这意味着你可以在自己的代码库中作出不同选择，只要保持一致并有合理理由。当然，请确保你有合理理由！

<div class="priority-rules priority-essential">

## 优先级 A 规则：必需

### 不要直接修改 State

修改 state 是 Redux 应用中最常见的 bug 源，包括组件无法正确重新渲染，也会破坏 Redux DevTools 中的时间旅行调试。**应始终避免实际修改 state 值**，无论是在 reducers 内部还是在其他所有应用代码中。

开发时可使用 [`redux-immutable-state-invariant`](https://github.com/leoasis/redux-immutable-state-invariant) 这类工具检测修改，使用 [Immer](https://immerjs.github.io/immer/) 避免状态更新中的意外修改。

> **注意**：修改_复制_的现有值是允许的——这是编写不可变更新逻辑的正常部分。如果你使用 Immer 进行不可变更新，编写类似“修改”的逻辑是可以接受的，因为实际数据本身未被修改——Immer 会安全追踪更改，并在内部生成不可变更新的值。

### Reducers 不能有副作用

Reducer 函数应_仅_依赖其 `state` 与 `action` 参数，并仅基于这两个参数计算并返回新的 state 值。**不得执行任何异步逻辑（AJAX 调用、定时器、Promise）、生成随机值（`Date.now()`、`Math.random()`）、修改 reducer 外部变量，或执行其他影响 reducer 作用域外部事物的代码**。

> **注意**：Reducer 调用定义在外部的函数（例如库导入或工具函数）是被允许的，前提是它们遵守相同规则。

<DetailedExplanation>

此规则的目的是保证调用 reducer 时其行为可预测。例如，时间旅行调试可能会多次调用 reducer 处理早期动作以生成“当前”状态。如果 reducer 有副作用，这些副作用将在调试过程中执行，导致应用表现异常。

此规则存在一些灰色地带。严格来说，类似 `console.log(state)` 的代码是副作用，但实际上对应用行为无影响。

</DetailedExplanation>

### 不要在 State 或 Actions 中放置不可序列化的值

**避免将不可序列化的值（如 Promise、Symbol、Map/Set、函数或类实例）放入 Redux 存储的 state 或派发的 actions 中**。这保证了 Redux DevTools 等调试工具能按预期工作，也保证 UI 能按预期更新。

> **例外**：如果某个 action 会被中间件拦截并在到达 reducer 前终止，则可以在 action 中放置不可序列化的值。诸如 `redux-thunk` 和 `redux-promise` 等中间件即为示例。

### 每个应用只使用一个 Redux Store

**标准 Redux 应用应仅有一个 Redux store 实例，由整个应用共享**。一般应在单独文件（如 `store.js`）中定义。

理想情况下，应用逻辑不直接导入 store，应该通过 `<Provider>` 传递给 React 组件树，或通过如 thunks 的中间件间接引用。在极少数情况下，可能需要在其他逻辑文件中导入 store，但应尽量避免。

</div>

<div class="priority-rules priority-stronglyrecommended">

## 优先级 B 规则：强烈推荐

### 使用 Redux Toolkit 编写 Redux 逻辑

**[Redux Toolkit](../redux-toolkit/overview.md) 是我们推荐的 Redux 使用工具集**。它集成了我们建议的最佳实践函数，包括设置 store 以捕获修改和启用 Redux DevTools 扩展、利用 Immer 简化不可变更新逻辑等。

你不必一定使用 RTK，也可使用其他方法，但**使用 RTK 能简化你的逻辑，确保应用默认配置良好**。

### 使用 Immer 编写不可变更新

手工编写不可变更新逻辑通常困难且易出错。[Immer](https://immerjs.github.io/immer/) 允许你用“可变”逻辑编写更简单的不可变更新，还会在开发中冻结状态以捕获应用其他处的修改。**我们推荐在编写不可变更新时使用 Immer，最好作为 [Redux Toolkit](../redux-toolkit/overview.md) 的一部分使用**。

<a id="structure-files-as-feature-folders-or-ducks"></a>

### 使用“功能文件夹+单文件逻辑”结构组织文件

Redux 本身不关心你如何组织应用文件夹和文件。但将某个功能的逻辑聚集在一起通常更易维护。

因此，**我们建议大多数应用使用“功能文件夹”结构**（将一个功能的所有文件放在同一文件夹）。在功能文件夹内，**应使用单个“slice”文件编写该功能的 Redux 逻辑**，最好用 Redux Toolkit 的 `createSlice` API。（这也称为 ["ducks" 模式](https://github.com/erikras/ducks-modular-redux)）。虽然旧的 Redux 代码库多用“按类型划分文件夹”方式（如将 actions、reducers 放在不同文件夹），但集中相关逻辑更易查找和更新。

<DetailedExplanation title="详细说明：示例文件结构">
示例文件结构可能如下所示：

- `/src`
  - `index.tsx`：入口文件，渲染 React 组件树
  - `/app`
    - `store.ts`：store 配置
    - `rootReducer.ts`：根 reducer（可选）
    - `App.tsx`：根 React 组件
  - `/common`：hooks、通用组件、工具等
  - `/features`：包含所有“功能文件夹”
    - `/todos`：单个功能文件夹
      - `todosSlice.ts`：Redux reducer 逻辑及关联 actions
      - `Todos.tsx`：React 组件

`/app` 包含依赖于其他目录的应用级设置和布局。

`/common` 包含真正通用且可重用工具和组件。

`/features` 中的文件夹包含与特定功能相关的所有功能。本例中，`todosSlice.ts` 是一个“duck”风格文件，调用 RTK 的 `createSlice()` 函数，导出 slice reducer 和 action 创建器。

</DetailedExplanation>

### 尽可能将逻辑放入 Reducers

尽可能**把计算新 state 的大部分逻辑放到相应 reducer 中，而不是在准备和派发 action 的代码里（比如点击处理函数）**。这有助于确保更多实际业务逻辑易于测试，支持更有效的时间旅行调试，避免导致修改和错误的常见失误。

有些场景确实需要先行计算新 state（如生成唯一 ID），但应尽量减少。

<DetailedExplanation>

Redux 核心不关心新 state 是在 reducer 还是在 action 创建逻辑中计算的。比如一个待办事项应用，“切换待办”动作需要不可变地更新待办数组。可以只在 action 中携带待办 ID，在 reducer 中计算新数组：

```js
// 点击处理函数：
const onTodoClicked = (id) => {
    dispatch({type: "todos/toggleTodo", payload: {id}})
}

// Reducer：
case "todos/toggleTodo": {
    return state.map(todo => {
        if(todo.id !== action.payload.id) return todo;

        return {...todo, completed: !todo.completed };
    })
}
```

也可以先计算新数组，再将整个新数组放入 action：

```js
// 点击处理函数：
const onTodoClicked = id => {
  const newTodos = todos.map(todo => {
    if (todo.id !== id) return todo

    return { ...todo, completed: !todo.completed }
  })

  dispatch({ type: 'todos/toggleTodo', payload: { todos: newTodos } })
}

// Reducer：
case "todos/toggleTodo":
    return action.payload.todos;
```

但在 reducer 中做逻辑更好，理由有：

- Reducers 是纯函数，易于测试 —— 只需调用 `const result = reducer(testState, action)` 并断言结果符合预期。逻辑越多在 reducer，测试覆盖越高。
- Redux 状态更新必须遵循[不可变更新规则](../usage/structuring-reducers/ImmutableUpdatePatterns.md)。大多数人知道 reducer 内必须遵守，但不明显的是，如果新 state 在 reducer 外部计算，也必须遵守，这容易出错，如意外修改或将 store 里的值读出后原样写回 action。全部状态计算放到 reducer 避免这类错误。
- 使用 Redux Toolkit 或 Immer，在 reducer 中编写不可变更新更简易，Immer 会冻结状态捕获意外修改。
- 时间旅行调试是通过“撤销”已派发的 action，再重做或做其他操作实现的。热重载 reducer 也通常是在现有 action 上重新运行 reducer。如果 action 正确而 reducer 有 bug，可以编辑 reducer 修复，热重载后马上得到正确状态；如果 action 错误，则必须重新执行产生该 action 的操作。将更多逻辑放入 reducer 有利于调试。
- 最后，放在 reducer 里意味着知道在哪里找状态更新逻辑，不会分散在应用代码各处。

</DetailedExplanation>

### Reducers 应该拥有 State 形状

Redux 根状态由单根 reducer 计算。为维护性考虑，该 reducer 通常拆成按 key/value 切分的“slice”，**每个“slice reducer”负责提供该状态片段的初始值并计算更新**。

此外，slice reducer 应对返回的状态值保持控制。**尽量减少使用“盲目展开/返回”**，比如 `return action.payload` 或 `return {...state, ...action.payload}`，因为这依赖派发 action 的代码的正确格式，等于 reducer 放弃了对状态形态的拥有权，若 action 内容不正确会导致 bug。

> **注意**：对于像表单数据编辑这类场景，写单独的 action 类型来对应每个字段既费时又无多大益处，使用“展开返回”的 reducer 是合理选择。

<DetailedExplanation>
例如，有个“当前用户” reducer：

```js
const initialState = {
    firstName: null,
    lastName: null,
    age: null,
};

export default usersReducer = (state = initialState, action) {
    switch(action.type) {
        case "users/userLoggedIn": {
            return action.payload;
        }
        default: return state;
    }
}
```

这里 reducer 直接假设 `action.payload` 是格式正确的用户对象。

但若某处代码错误地派发了一个“待办”对象，而非用户对象：

```js
dispatch({
  type: 'users/userLoggedIn',
  payload: {
    id: 42,
    text: 'Buy milk'
  }
})
```

reducer 盲目返回了该待办对象，导致后续应用读取用户数据时崩溃。

至少可在 reducer 加入部分验证，确保 `action.payload` 有正确字段，或按名称取字段，虽会增加代码，但提高安全性。

使用静态类型会让此类代码更安全、易接受。如果 reducer 知道 `action` 是 `PayloadAction<User>`，那么做 `return action.payload` 应该是安全的。

</DetailedExplanation>

### 根据存储数据命名状态切片

如 [Reducers 应该拥有 State 形状](#reducers-should-own-the-state-shape) 所述，划分 reducer 逻辑时通常基于状态“切片”，`combineReducers` 正是用来合并这些 slice reducer。

传给 `combineReducers` 的对象中的键名决定了返回状态对象中的键名。请确保根据状态数据含义命名这些键名，避免在键名中包含“reducer”。对象应如 `{users: {}, posts: {}}`，而非 `{usersReducer: {}, postsReducer: {}}`。

<DetailedExplanation>
对象字面量简写让声明键名和值同时完成变得简单：

```js
const data = 42
const obj = { data }
// 等同于：{data: data}
```

`combineReducers` 接收一个 reducer 函数组成的对象，并生成具有相同键名的状态对象。

这导致了常见错误：导入 reducer 时变量名带有 “reducer”，且使用字面量简写传给 `combineReducers`：

```js
import usersReducer from 'features/users/usersSlice'

const rootReducer = combineReducers({
  usersReducer
})
```

此处 `{usersReducer}` 实际生成 `{usersReducer: usersReducer}`，使“reducer”成为状态键名的一部分，冗余无用。

应只用键名反映所存数据，建议明确写法：

```js
import usersReducer from 'features/users/usersSlice'
import postsReducer from 'features/posts/postsSlice'

const rootReducer = combineReducers({
  users: usersReducer,
  posts: postsReducer
})
```

多写几个字符，却生成更易懂的代码和状态定义。

</DetailedExplanation>

### 根据数据类型组织状态结构，而非组件

根状态切片的定义和命名应基于应用的主要数据类型或功能区块，而非特定 UI 组件。由于 Redux store 中的数据与 UI 组件之间不存在严格的 1:1 关系，且许多组件可能使用相同数据。应将状态树视为任意部分 app 可访问的全局数据库，组件只读取自身需要的状态片段。

例如，一个博客应用可能需要跟踪谁登录了、作者和帖子信息、以及当前激活的屏幕信息。合理的状态结构可能是 `{auth, posts, users, ui}`。糟糕的结构如 `{loginScreen, usersList, postsList}`。

### 把 Reducers 看作状态机

许多 Redux reducer 是“无条件”的，只看派发的 action，计算新状态，而不基于当前状态的上下文。这样容易出错，因为某些动作在特定状态下逻辑上“无效”，例如“请求成功”动作只当状态是“加载中”时才有新状态，或“更新某项”动作只在有“正在编辑”的项目时才应派发。

为避免，**应把 reducer 当作“状态机”，以当前状态和派发动作的组合决定是否计算新状态，而不是无条件只基于动作本身**。

<DetailedExplanation>

[有限状态机](https://en.wikipedia.org/wiki/Finite-state_machine) 是一种建模工具，用于表征某事物在任何时刻只处于有限多个“有限状态”之一。例如 `fetchUserReducer` 可有状态：

- `"idle"`（尚未开始获取）
- `"loading"`（正在获取用户）
- `"success"`（成功获取用户）
- `"failure"`（获取失败）

为了明确表示有限状态并[让不可能的状态不可能](https://kentcdodds.com/blog/make-impossible-states-impossible)，可以在 state 中指定表示状态的属性：

```js
const initialUserState = {
  status: 'idle', // 显式有限状态
  user: null,
  error: null
}
```

使用 TypeScript，可方便采用[判别式联合类型](https://basarat.gitbook.io/typescript/type-system/discriminated-unions)描述各有限状态。例如，当 `state.status === 'success'`，你可期望 `state.user` 有值且 `state.error` 不应为真。类型系统可强制执行此逻辑。

通常，写 reducer 逻辑时优先看 action。但用状态机建模重要的是优先考虑 state。针对每种状态创建“有限状态 reducer”可封装每个状态对应行为：

```js
import {
  FETCH_USER,
  // ...
} from './actions'

const IDLE_STATUS = 'idle';
const LOADING_STATUS = 'loading';
const SUCCESS_STATUS = 'success';
const FAILURE_STATUS = 'failure';

const fetchIdleUserReducer = (state, action) => {
  // state.status 是 "idle"
  switch (action.type) {
    case FETCH_USER:
      return {
        ...state,
        status: LOADING_STATUS
      }
    }
    default:
      return state;
  }
}

// ... 其他状态对应 reducer

const fetchUserReducer = (state, action) => {
  switch (state.status) {
    case IDLE_STATUS:
      return fetchIdleUserReducer(state, action);
    case LOADING_STATUS:
      return fetchLoadingUserReducer(state, action);
    case SUCCESS_STATUS:
      return fetchSuccessUserReducer(state, action);
    case FAILURE_STATUS:
      return fetchFailureUserReducer(state, action);
    default:
      // 不应达到此处
      return state;
  }
}
```

这样，因为行为是按状态定义而非按动作，避免了不可能的状态转移。例如，当 `status === LOADING_STATUS` 时，`FETCH_USER` 动作不会生效。

</DetailedExplanation>

### 规范复杂嵌套/关联数据状态为标准化结构

许多应用需要在 store 缓存复杂数据，这些数据通常在 API 返回时是嵌套形式，或者不同实体之间有关联（如博客中用户、帖子、评论关系）。

**建议以[“标准化”形式](../usage/structuring-reducers/NormalizingStateShape.md)存储数据**。这方便根据 ID 查找条目并单独更新，更有利于性能优化。

### 保持状态最小化并派生附加值

尽可能**让 Redux store 中保存的实际数据保持最小，只在需要时从状态“派生”附加值**。如计算过滤列表或求和。举例，todo 应用在状态中存储原始 todo 数组，过滤后的 todo 列表则在状态外计算。是否所有 todo 完成、剩余数量等也应在状态外计算。

该做法优点：

- 实际状态易读
- 计算附加值的逻辑和同步保持较少
- 原始状态始终可得且不会被替换

派生数据通常写在“选择器”函数中，方便封装更新计算逻辑。为提升性能，可通过 `reselect` 或 `proxy-memoize` 等库给选择器做缓存。

### 将 Actions 视为事件而非设置器（Setters）

Redux 本身不关心 `action.type` 内容，只要被定义即可。action 值可用现在时（"users/update"）、过去时（"users/updated"）、事件描述（"upload/progress"）、或当做设置器（"users/setUserName"）等。你自己决定动作在应用中的含义及建模方式。

然而，**我们推荐尽量把动作视为“描述发生的事件”，而非“设置器”**。视为“事件”通常导致更有意义的动作名称、更少动作派发与更有价值的动作日志。写“设置器”往往导致动作类型过多、派发次数太多，且动作日志不具备实质意义。

<DetailedExplanation>
假设你写餐厅应用，顾客点了一个披萨和一瓶可乐。你可以派发：

```js
{ type: "food/orderAdded",  payload: {pizza: 1, coke: 1} }
```

或者派发：

```js
{
    type: "orders/setPizzasOrdered",
    payload: {
        amount: getState().orders.pizza + 1,
    }
}

{
    type: "orders/setCokesOrdered",
    payload: {
        amount: getState().orders.coke + 1,
    }
}
```

第一例是“事件”，意为“有人点了披萨和可乐，请处理”。

第二例则是“设置器”，意为“我知道有披萨和可乐的字段，命令你设置当前值”。

“事件”只需派发一条动作，更灵活。不管之前点了多少披萨，可能当时没厨师，订单被忽略。

“设置器”要求客户端知道状态结构及正确值，得派发多条动作完成“事务”。

</DetailedExplanation>

### 编写有意义的 Action 名称

`action.type` 有两个主要作用：

- reducer 根据类型判断是否处理该动作以计算新状态
- Redux DevTools 历史日志显示动作类型供开发者查看

如 [将动作建模为“事件”](#model-actions-as-events-not-setters) 所述，Redux 不关心 `type` 内容，但对开发者而言非常重要。**应使用有意义、信息丰富且描述清晰的类型字段**。理想情况下，浏览 dispatched 的动作类型列表时，无需查看动作具体内容即可理解应用发生了什么。避免使用诸如 `"SET_DATA"`、`"UPDATE_STORE"` 这类过于笼统的名称。

### 允许多个 Reducers 响应同一 Action

Redux reducer 逻辑预期拆成很多小 reducer，各自独立更新状态树的对应部分，最终合并成根 reducer。当某动作派发时，可由所有、部分或无 reducer 处理。

你应当**允许多个 reducer 分别响应相同动作**。实际经验表明，大多数动作通常只被单一 reducer 处理，这无问题。但把动作视作“事件”，允许多个 reducer 响应，有助代码库规模扩张，减少派发多个动作才能完成一项业务的次数。

### 避免连续派发大量动作

**避免为完成较大“事务”而连续派发许多动作**。此做法虽合法，但通常导致多次较昂贵的 UI 更新，且某些中间状态可能被别处逻辑视为无效。优先派发单条“事件”类动作以完成所有状态更新，或考虑使用动作合批插件以单次 UI 更新派发多个动作。

<DetailedExplanation>
无数量限制，可连续多次派发动作。但每次派发都会触发所有 store 订阅回调（通常一个或多个连接的 UI 组件），通常伴随 UI 更新。

React 事件处理器中的更新会批量渲染，但事件处理器外触发的更新不会（如异步函数、定时器回调、非 React 代码中的 dispatch）。此时每次 dispatch 会同步执行完整 React 渲染，影响性能。

此外，多次派发的动作组成的“事务”在中间路径将产生不完整状态。例如同时派发 `"UPDATE_A"`、`"UPDATE_B"`、`"UPDATE_C"`，若某代码期望三者同时更新，则前两次派发后状态不完整。

如确实需多次派发，请考虑合批更新。具体做法可为合批 React 渲染（比如使用 [React-Redux 的 `batch()`](https://react-redux.js.org/api/batch)）、对 store 通知回调做去抖动，或将多个动作封装成单个动作只触发一次订阅通知。更多示例见[常见问答关于减少 store 更新事件](../faq/Performance.md#how-can-i-reduce-the-number-of-store-update-events)。

</DetailedExplanation>

### 评估每个状态片段应该存放位置

[Redux 三大原则](../understanding/thinking-in-redux/ThreePrinciples.md)说“整个应用的状态存储在单一树中”，该说法已被过度解读。这并不意味着所有值都必须存在 Redux store，而是**应有一个单一位置存储所有你认为的全局、应用范围内的状态**。局部值一般应放在最近的 UI 组件中。

因此，开发者应自行决定哪些状态应放在 Redux store，哪些应保留在组件状态。**[参考此规则帮助评估每个状态并确定存放位置](../faq/OrganizingState.md#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer)**。

### 使用 React-Redux Hooks API

**建议默认使用 [React-Redux 的 hooks API (`useSelector` 和 `useDispatch`)](https://react-redux.js.org/api/hooks) 来从 React 组件访问 Redux store**。虽然传统的 `connect` API 依然正常且持续支持，但 hooks API 在多方面更易用。hooks 减少了间接层、代码量，且在 TypeScript 下更简单。

hooks API 在性能和数据流上与 `connect` 有不同权衡，但我们现推荐其作为默认选择。

<DetailedExplanation>

[传统 `connect` API](https://react-redux.js.org/api/connect) 是高阶组件（HOC），生成新包装组件，订阅 store，渲染原组件，并通过 props 传入 store 数据和 action 创建器。

这是有意设计的间接层，便于写无特定 Redux 依赖的“展示组件”。

Hooks 改变了大部分 React 开发者的写法。虽然“容器/展示组件”概念仍有用，但 hooks 鼓励组件自身通过调用 hook 获取数据，导致编写和测试组件及逻辑的方式不同。

`connect` 的间接性让部分用户难理解数据流。此外，`connect` 的复杂性也使其在 TypeScript 下难以类型化，因其存在多重重载、可选参数、`mapState`/`mapDispatch`/父组件 props 合并、绑定 action 创建器和 thunk 等。

`useSelector` 和 `useDispatch` 去除了间接，组件与 Redux 交互更清晰。`useSelector` 仅接收单个选择器，使用 TypeScript 更简单，`useDispatch` 同理。

更多细节请参考 Redux 主维护者 Mark Erikson 关于 hooks 与高阶组件权衡的博文和演讲：

- [关于 React Hooks、Redux 及关注点分离的思考](https://blog.isquaredsoftware.com/2019/07/blogged-answers-thoughts-on-hooks/)
- [ReactBoston 2019: Hooks、HOCs 和权衡](https://blog.isquaredsoftware.com/2019/09/presentation-hooks-hocs-tradeoffs/)

还请查看 [React-Redux hooks API 文档](https://react-redux.js.org/api/hooks)，了解如何正确优化组件及处理罕见边缘情况。

</DetailedExplanation>

### 连接更多组件从 Store 读取数据

建议让更多 UI 组件订阅 Redux store，按更细粒度读取数据。这通常提升 UI 性能，因为状态变化时需重新渲染的组件变少。

例如，不只连接 `<UserList>` 并读取全部用户数组，而是让 `<UserList>` 获取所有用户 ID，渲染多个 `<UserListItem userId={userId}>`，让 `<UserListItem>` 自身连接 store 并读取对应用户。

此原则适用于 React-Redux `connect()` 和 `useSelector()`。

### 使用 `connect` 时，`mapDispatch` 用对象简写形式

`connect` 的 `mapDispatch` 参数可是函数（接受 dispatch 参数），也可为包含 action 创建器的对象。**建议始终使用 [对象简写形式定义 `mapDispatch`](https://react-redux.js.org/using-react-redux/connect-mapdispatch#defining-mapdispatchtoprops-as-an-object)**，这样代码更简洁，几乎无需用函数形式。

### 在函数组件中多次调用 `useSelector`

**使用 `useSelector` 读取数据时，优先多次调用 `useSelector` 拿小块数据，而非单次调用返回多个结果的对象**。`useSelector` 不要求返回对象，小数据选择器减少了状态变化导致组件渲染的概率。

不过请找到合适的粒度平衡。若单组件确实需要一整个状态切片，写一个返回整个切片的 `useSelector` 比为每个字段写多个选择器更好。

### 使用静态类型

**推荐使用 TypeScript 或 Flow 这类静态类型系统，而非纯 JavaScript**。类型系统可捕获许多常见错误，提升代码自文档化，最终带来更好的长期维护性。Redux 和 React-Redux 虽最初设计为支持纯 JS，但在 TS 和 Flow 中运作良好。Redux Toolkit 特别使用 TS 编写，设计时就兼顾类型安全且需要极少额外类型声明。

### 使用 Redux DevTools 扩展调试

**配置 Redux store 以启用 [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension) 调试**。该工具允许你查看：

- 派发动作的历史日志
- 每个动作的内容
- 派发动作后的最终状态
- 状态改变的 diff
- [显示动作实际派发代码的函数调用栈](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/Features/Trace.md)

此外，DevTools 支持时间旅行调试，允许你在动作历史中前后切换，查看不同时刻的应用状态和 UI。

**Redux 就是为支持此类调试设计的，DevTools 是使用 Redux 的最强大理由之一**。

### 状态树应使用普通 JS 对象

建议状态树使用普通 JS 对象和数组，而不是像 Immutable.js 这类专门库。虽然使用 Immutable.js 有一些潜在好处，但常说的轻量级引用比较及高效更新是不可变更新的普遍特性，不必特定库支持。这样可减小包体积，减少数据类型转换引入的复杂性。

如前所述，若想简化不可变更新逻辑，特别推荐将 Immer 作为 Redux Toolkit 的一部分使用。

<DetailedExplanation>
Immutable.js 自 Redux 诞生以来偶尔用于 Redux 应用，原因多为：

- 利用廉价引用比较提升性能
- 利用特殊数据结构加快更新
- 避免意外修改
- 方便嵌套更新，如 `setIn()` API

这些理由中有部分合理，但实践中收益不及预期，且存在问题：

- 廉价引用比较是所有不可变更新的属性，不唯 Immutable.js 独有
- 可通过 Immer 或 `redux-immutable-state-invariant` 等其它机制防止意外修改
- Immer 简化整体更新逻辑，取代了 `setIn()` 的必要
- Immutable.js 体积庞大
- API 复杂
- API 影响应用代码风格，程序需区分处理普通对象与 Immutable 对象
- 转换 Immutable 到普通对象代价高且会产生全新深层对象引用
- 维护活跃度不足

唯一保留的有力理由是非常大体量对象的快速更新（数万个键）。大多数应用不会涉及如此庞大对象。

综上，Immutable.js 造成的负担大于实际收益。Immer 是更好选择。

</DetailedExplanation>

</div>

<div class="priority-rules priority-recommended">

## 优先级 C 规则：推荐

### 将 Action 类型写作 `domain/eventName`

Redux 原始文档示例一般使用“全大写下划线”格式定义 action 类型，如 `"ADD_TODO"`、`"INCREMENT"`，符合大多数编程语言常量写法惯例，但大写字符串阅读起来不便。

其他社区采用其它惯例，往往包含动作关联的“领域”或“特性”及具体动作类型。NgRx 采用 `"[Domain] Action Type"` 模式，如 `"[Login Page] Login"`，也有人用 `"domain:action"`。

Redux Toolkit 的 `createSlice` 当前生成的动作类型是 `"domain/action"` 格式，如 `"todos/addTodo"`。未来仍推荐用 `"domain/action"` 风格提高可读性。

### 使用 Flux Standard Action 规范编写 Actions

最初的 Flux 架构只规定 action 对象必须有 `type` 字段，无其他字段或命名规范。为统一，Andrew Clark 在 Redux 早期设计了 ["Flux Standard Actions（FSA）"](https://github.com/redux-utilities/flux-standard-action) 规范。核心内容是：

- 数据应放在 `payload` 字段
- 可选 `meta` 字段存放额外信息
- 可选 `error` 字段指示动作代表错误

Redux 生态许多库采用 FSA 格式，Redux Toolkit 生成的 action creators 也符合 FSA。

**建议优先使用符合 FSA 格式的动作以保证一致性**。

> **注意**：FSA 规定错误动作 `error: true` 并用与正常动作同一类型。实际上多数学者习惯为成功和错误分别写不同类型，二者都可。

### 使用 Action 创建函数

“Action 创建函数” 源自最初 Flux 架构，Redux 中非强制。组件或其他代码可直接调用 `dispatch({type: "some/action"})`，内联写动作对象。

不过，使用 action 创建函数可确保一致性，尤其用于填充动作内容需准备额外逻辑（如生成唯一 ID）时。

**建议优先使用 action 创建函数派发动作**。同时，避免手写，**推荐用 Redux Toolkit 的 `createSlice` 自动生成 action creators 和类型**。

### 使用 RTK Query 进行数据获取

在实践中，**Redux 应用中最常见的副作用用例是向服务器请求并缓存数据**。

因此，**推荐默认使用 [RTK Query](../tutorials/essentials/part-7-rtk-query-basics.md) 作为 Redux 应用的数据获取和缓存方法**。RTK Query 设计用于正确管理服务器数据请求逻辑、缓存、请求去重、组件更新等。几乎所有情况建议不要手写数据获取逻辑。

### 对其他异步逻辑，使用 Thunks 和 Listeners

Redux 设计上是可扩展的，middleware API 用于让不同形式的异步逻辑接入 Redux。用户不用强制学习 RxJS 等不适合需求的库。

因此，产生了许多 Redux 异步中间件插件，导致选择困惑。

**推荐使用 [Redux thunk middleware](../usage/writing-logic-thunks.mdx) 编写命令式逻辑**，包括需要访问 `dispatch` 或 `getState` 的复杂同步逻辑与适中复杂的异步逻辑，如将逻辑从组件中剥离。

**推荐使用 [RTK "listener" middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) 编写需要响应动作或状态变化的“反应式”逻辑**，如长时运行的异步流程、“后台线程”行为。

多数情况下不推荐使用复杂的 Redux-Saga 和 Redux-Observable 库，尤其是用于异步数据获取。仅当其它工具无能为力时才考虑。

### 将复杂逻辑移出组件

我们一直建议将大部分逻辑移出组件。这部分源于推动“容器/展示”模式，许多组件仅接受数据并展示 UI，且在 class 组件生命周期处理异步时维护较难。

**仍然鼓励将复杂同步或异步逻辑移入组件外，通常放入 thunks**，尤其逻辑需要从 store 读取状态。

不过，React hooks 的使用使得在组件内管理诸如数据请求类逻辑变得简单，有时可替代 thunks。

### 使用 Selector 函数读取 Store 状态

“选择器函数” 是封装读取 Redux store 状态并派生附加数据的有力工具。此外，Reselect 等库支持 memoized 选择器，仅在输入变化时重新计算，是性能优化关键。

**强烈推荐在尽可能情况下，使用 memoized 选择器函数读取 store 状态，建议用 Reselect 创建选择器**。

但无需对每个状态字段都写选择器。根据访问和更新频率及选择器带来的实际益处平衡粒度。

### 选择器命名以 `selectThing` 为前缀

**建议给选择器函数名添加 `select` 前缀，并描述所选取的内容**。示例有 `selectTodos`、`selectVisibleTodos`、`selectTodoById`。

### 避免将表单状态放入 Redux

**大多数表单状态不应存入 Redux**。多数情况下，表单数据非真正全局，不缓存且不被多个组件共享。此外，连接表单与 Redux 通常导致每个改动事件都需派发动作，造成性能开销且无实质好处。（你大概不需要倒着一路时间旅行，去到 `name: "Mark"` 的上一刻 `name: "Mar"`。）

即使数据最终入 Redux，也建议把表单编辑保留在组件本地状态，只在表单完成时派发动作更新 Redux 状态。

某些用例（如所见即所得编辑器的实时预览）确实适合将表单状态放入 Redux，但大部分场景不需要。

</div>

</div>