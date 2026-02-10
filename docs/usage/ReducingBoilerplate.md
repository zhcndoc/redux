---
id: reducing-boilerplate
title: 减少样板代码
---

# 减少样板代码

Redux 部分是受 [Flux](../understanding/history-and-design/PriorArt.md) 启发而来，而对 Flux 最常见的抱怨是它让你写了大量的样板代码。在本指南中，我们将探讨 Redux 如何让我们根据个人风格、团队偏好、长期可维护性等，选择代码的冗长度。

## Actions（动作）

Actions 是描述应用内发生了什么的普通对象，是描述修改数据意图的唯一方式。重要的是，**Actions 作为你必须 dispatch 的对象，并不是样板代码，而是 Redux 的 [根本设计选择之一](../understanding/thinking-in-redux/ThreePrinciples.md)**。

市面上有声称类似 Flux 的框架，但没有动作对象的概念。从可预测性角度讲，这比 Flux 或 Redux 退步了一步。没有可序列化的普通对象 Actions，就无法录制和回放用户会话，也无法实现带时间旅行的 [热加载](https://www.youtube.com/watch?v=xsSnOQynTHs)。如果你更愿意直接修改数据，你根本不需要 Redux。

Actions 看起来像这样：

```js
{ type: 'ADD_TODO', text: '使用 Redux' }
{ type: 'REMOVE_TODO', id: 42 }
{ type: 'LOAD_ARTICLE', response: { ... } }
```

一个常见的惯例是，Actions 有一个常量类型，帮助 reducers（或 Flux 中的 Stores）识别它们。我们推荐使用字符串，而非 [Symbols](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 作为 action 类型，因为字符串是可序列化的，使用 Symbols 会让录制和回放变得比必要时更困难。

在 Flux 中，传统上认为你会把每个动作类型定义为字符串常量：

```js
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const LOAD_ARTICLE = 'LOAD_ARTICLE'
```

这有什么好处？**通常有人说常量是不必要的，对于小项目来说，这或许是对的。**但对于大型项目，将动作类型定义为常量有些好处：

- 有助于保持命名一致，因为所有动作类型都汇聚在一个地方。
- 有时你想在开发新功能前先看看已有的所有动作，也许你需要的动作已经被团队某人添加了，但你不知道。
- 在 Pull Request 中新增、删除和修改的动作类型列表，帮助团队成员了解新功能的范围和实现。
- 万一导入动作常量时出现拼写错误，会变成 `undefined`。Redux 在 dispatch 该动作时会立即报错，你可以更早发现错误。

具体的约定由你来定。可以从内联字符串开始，后面过渡到常量，再后来统一放到一个文件中。Redux 没有强制意见，使用你的判断。

## Action Creators（动作创建函数）

另一个常见的惯例是，不直接在 dispatch 的地方内联创建动作对象，而是创建生成动作的函数。

例如，不是这样内联调用 `dispatch`：

```js
// 在某处事件处理器内
dispatch({
  type: 'ADD_TODO',
  text: '使用 Redux'
})
```

你可以写一个动作创建函数，单独放在一个文件，组件中导入使用：

#### `actionCreators.js`

```js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}
```

#### `AddTodo.js`

```js
import { addTodo } from './actionCreators'

// 在某处事件处理器内
dispatch(addTodo('使用 Redux'))
```

动作创建函数常被批评为样板代码。其实，你不必非写它们不可！**如果觉得更适合你的项目，可以直接用对象字面量。**不过写动作创建函数有一些优点，你应该了解。

假设设计师在看了我们的原型后反馈，要限制最多添加三个待办。我们可以用配合 [redux-thunk](https://github.com/reduxjs/redux-thunk) 中间件的回调形式修改动作创建函数，并加个早期返回：

```js
function addTodoWithoutCheck(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

export function addTodo(text) {
  // 这是被 Redux Thunk 中间件支持的形式
  // 详见下面“异步动作创建函数”部分。
  return function (dispatch, getState) {
    if (getState().todos.length === 3) {
      // 早期退出
      return
    }
    dispatch(addTodoWithoutCheck(text))
  }
}
```

我们修改了 `addTodo` 动作创建函数的行为，调用它的代码完全不用改。**不需要对添加待办的每个调用点都加检查。**动作创建函数让你把分发动作的额外逻辑和触发动作的组件解耦。当应用处于快速开发状态、需求频繁变更时，非常方便。

### 生成动作创建函数

一些框架如 [Flummox](https://github.com/acdlite/flummox) 会从动作创建函数定义自动生成动作类型常量。这样，你不需要既定义 `ADD_TODO` 常量又写 `addTodo()` 函数。它们底层仍生成动作类型常量，但隐式创建，多了一层间接，可能令人困惑。我们建议显式地创建动作类型常量。

写简单动作创建函数很容易腻，经常会产生冗余的样板代码：

```js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

export function editTodo(id, text) {
  return {
    type: 'EDIT_TODO',
    id,
    text
  }
}

export function removeTodo(id) {
  return {
    type: 'REMOVE_TODO',
    id
  }
}
```

你可以写一个函数来生成动作创建函数：

```js
function makeActionCreator(type, ...argNames) {
  return function (...args) {
    const action = { type }
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
    })
    return action
  }
}

const ADD_TODO = 'ADD_TODO'
const EDIT_TODO = 'EDIT_TODO'
const REMOVE_TODO = 'REMOVE_TODO'

export const addTodo = makeActionCreator(ADD_TODO, 'text')
export const editTodo = makeActionCreator(EDIT_TODO, 'id', 'text')
export const removeTodo = makeActionCreator(REMOVE_TODO, 'id')
```

还有辅助生成动作创建函数的库，比如 [redux-act](https://github.com/pauldijou/redux-act) 和 [redux-actions](https://github.com/acdlite/redux-actions)。它们能帮助减少样板代码，且符合 [Flux 标准动作（FSA）](https://github.com/acdlite/flux-standard-action) 等规范。

## 异步动作创建函数

[中间件](../understanding/thinking-in-redux/Glossary.md#middleware) 允许你注入自定义逻辑，用来解释每个被 dispatch 的动作对象。异步动作是中间件最常见的应用。

没有中间件时， [`dispatch`](../api/Store.md#dispatchaction) 只接受普通对象，因此我们必须在组件中发起 AJAX 请求：

#### `actionCreators.js`

```js
export function loadPostsSuccess(userId, response) {
  return {
    type: 'LOAD_POSTS_SUCCESS',
    userId,
    response
  }
}

export function loadPostsFailure(userId, error) {
  return {
    type: 'LOAD_POSTS_FAILURE',
    userId,
    error
  }
}

export function loadPostsRequest(userId) {
  return {
    type: 'LOAD_POSTS_REQUEST',
    userId
  }
}
```

#### `UserInfo.js`

```js
import { Component } from 'react'
import { connect } from 'react-redux'
import {
  loadPostsRequest,
  loadPostsSuccess,
  loadPostsFailure
} from './actionCreators'

class Posts extends Component {
  loadData(userId) {
    // 由 React Redux 的 `connect()` 注入到 props:
    const { dispatch, posts } = this.props

    if (posts[userId]) {
      // 有缓存数据！啥也不干。
      return
    }

    // Reducer 可对这个动作做出反应，设置
    // `isFetching`，从而显示加载动画。
    dispatch(loadPostsRequest(userId))

    // Reducer 会响应下面的动作，填充 `users`。
    fetch(`http://myapi.com/users/${userId}/posts`).then(
      response => dispatch(loadPostsSuccess(userId, response)),
      error => dispatch(loadPostsFailure(userId, error))
    )
  }

  componentDidMount() {
    this.loadData(this.props.userId)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.loadData(this.props.userId)
    }
  }

  render() {
    if (this.props.isFetching) {
      return <p>加载中...</p>
    }

    const posts = this.props.posts.map(post => (
      <Post post={post} key={post.id} />
    ))

    return <div>{posts}</div>
  }
}

export default connect(state => ({
  posts: state.posts,
  isFetching: state.isFetching
}))(Posts)
```

然而这很快就重复了，不同组件会请求相同的 API。我们还想在多个组件之间复用某些逻辑（比如缓存判断的早期退出）。

**中间件让你写更具表达力、可能是异步的动作创建函数。** 它允许你 dispatch 非普通对象，而由中间件去解释这些值。例如，中间件可“拦截” dispatch 的 Promise，并将其转换为请求和成功/失败动作对。

最简单的中间件例子是 [redux-thunk](https://github.com/reduxjs/redux-thunk) 。**“Thunk” 中间件让你写出“thunks”的动作创建函数，即返回函数的函数。** 这反转了控制权：你会得到 `dispatch` 作为参数，因此能写出多次调用 dispatch 的动作创建函数。

> ##### 注意
>
> Thunk 中间件只是中间件的一个例子。中间件不只是“让你 dispatch 函数”，而是让你 dispatch 任何该中间件能识别处理的东西。Thunk 增加了针对 dispatch 函数时的特殊行为，但具体行为还是取决于你用什么中间件。

参考上面代码，用 [redux-thunk](https://github.com/reduxjs/redux-thunk) 重写：

#### `actionCreators.js`

```js
export function loadPosts(userId) {
  // 由 thunk 中间件解释：
  return function (dispatch, getState) {
    const { posts } = getState()
    if (posts[userId]) {
      // 有缓存数据！啥也不干。
      return
    }

    dispatch({
      type: 'LOAD_POSTS_REQUEST',
      userId
    })

    // 异步 dispatch 普通动作
    fetch(`http://myapi.com/users/${userId}/posts`).then(
      response =>
        dispatch({
          type: 'LOAD_POSTS_SUCCESS',
          userId,
          response
        }),
      error =>
        dispatch({
          type: 'LOAD_POSTS_FAILURE',
          userId,
          error
        })
    )
  }
}
```

#### `UserInfo.js`

```js
import { Component } from 'react'
import { connect } from 'react-redux'
import { loadPosts } from './actionCreators'

class Posts extends Component {
  componentDidMount() {
    this.props.dispatch(loadPosts(this.props.userId))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.props.dispatch(loadPosts(this.props.userId))
    }
  }

  render() {
    if (this.props.isFetching) {
      return <p>加载中...</p>
    }

    const posts = this.props.posts.map(post => (
      <Post post={post} key={post.id} />
    ))

    return <div>{posts}</div>
  }
}

export default connect(state => ({
  posts: state.posts,
  isFetching: state.isFetching
}))(Posts)
```

这样写，代码量少多了！你也可以保留“普通”的动作创建函数如 `loadPostsSuccess`， 在容器级的 `loadPosts` 动作创建函数中调用它们。

**最后，你可以自己写中间件。** 假设你想把上面的模式通用化，把异步动作创建函数写成：

```js
export function loadPosts(userId) {
  return {
    // 在开始和结束前后发出的动作类型
    types: ['LOAD_POSTS_REQUEST', 'LOAD_POSTS_SUCCESS', 'LOAD_POSTS_FAILURE'],
    // 缓存检查（可选）：
    shouldCallAPI: state => !state.posts[userId],
    // 执行请求：
    callAPI: () => fetch(`http://myapi.com/users/${userId}/posts`),
    // 在开始/结束动作中注入的参数
    payload: { userId }
  }
}
```

解释这类动作的中间件可以写成：

```js
function callAPIMiddleware({ dispatch, getState }) {
  return next => action => {
    const { types, callAPI, shouldCallAPI = () => true, payload = {} } = action

    if (!types) {
      // 普通动作，传给下一个中间件或 reducer
      return next(action)
    }

    if (
      !Array.isArray(types) ||
      types.length !== 3 ||
      !types.every(type => typeof type === 'string')
    ) {
      throw new Error('期望三元素字符串数组。')
    }

    if (typeof callAPI !== 'function') {
      throw new Error('期望 callAPI 是函数。')
    }

    if (!shouldCallAPI(getState())) {
      return
    }

    const [requestType, successType, failureType] = types

    dispatch(
      Object.assign({}, payload, {
        type: requestType
      })
    )

    return callAPI().then(
      response =>
        dispatch(
          Object.assign({}, payload, {
            response,
            type: successType
          })
        ),
      error =>
        dispatch(
          Object.assign({}, payload, {
            error,
            type: failureType
          })
        )
    )
  }
}
```

经过 [`applyMiddleware(...middlewares)`](../api/applyMiddleware.md) 一次，你可以统一这样写所有调用 API 的动作创建函数：

```js
export function loadPosts(userId) {
  return {
    types: ['LOAD_POSTS_REQUEST', 'LOAD_POSTS_SUCCESS', 'LOAD_POSTS_FAILURE'],
    shouldCallAPI: state => !state.posts[userId],
    callAPI: () => fetch(`http://myapi.com/users/${userId}/posts`),
    payload: { userId }
  }
}

export function loadComments(postId) {
  return {
    types: [
      'LOAD_COMMENTS_REQUEST',
      'LOAD_COMMENTS_SUCCESS',
      'LOAD_COMMENTS_FAILURE'
    ],
    shouldCallAPI: state => !state.comments[postId],
    callAPI: () => fetch(`http://myapi.com/posts/${postId}/comments`),
    payload: { postId }
  }
}

export function addComment(postId, message) {
  return {
    types: [
      'ADD_COMMENT_REQUEST',
      'ADD_COMMENT_SUCCESS',
      'ADD_COMMENT_FAILURE'
    ],
    callAPI: () =>
      fetch(`http://myapi.com/posts/${postId}/comments`, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      }),
    payload: { postId, message }
  }
}
```

## Reducers（状态处理函数）

Redux 通过用函数描述更新逻辑，大大减少了 Flux store 的样板代码。函数比对象简单多了，也比类简单很多。

看看这个 Flux store：

```js
const _todos = []

const TodoStore = Object.assign({}, EventEmitter.prototype, {
  getAll() {
    return _todos
  }
})

AppDispatcher.register(function (action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      const text = action.text.trim()
      _todos.push(text)
      TodoStore.emitChange()
  }
})

export default TodoStore
```

用 Redux，同样的更新逻辑可写成 reducer 函数：

```js
export function todos(state = [], action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      const text = action.text.trim()
      return [...state, text]
    default:
      return state
  }
}
```

开关语句 *不是* 真正的样板代码。Flux 真正的样板是概念上的：需要触发更新事件，需要注册 Store 到 Dispatcher，需要 Store 是对象（以及通用应用中带来的复杂问题）。

遗憾的是，许多人仍基于文档中是否使用 `switch` 语句来选择 Flux 框架。如果不喜欢 `switch`，完全可以用单函数解决，下面会展示。

### 生成 Reducers（状态处理函数）

我们写个函数，让 reducers 用对象映射动作类型到处理函数来表达。比如想把 `todos` reducer 定义成：

```js
export const todos = createReducer([], {
  [ActionTypes.ADD_TODO]: (state, action) => {
    const text = action.text.trim()
    return [...state, text]
  }
})
```

可以写下面的辅助函数实现：

```js
function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}
```

其实不难，是吧？Redux 默认不提供这类辅助函数，因为写法千差万别。你也许想自动把普通 JS 对象转成 Immutable 对象以服务端渲染时使用；你或许想返回的状态与当前状态合并。可能还想写“兜底” handler。都取决于你和团队给项目定的约定。

Redux reducer API 是 `(state, action) => newState`，但 reducers 具体如何写你说了算。