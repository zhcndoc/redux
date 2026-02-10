---
id: troubleshooting
title: 故障排除
---

# 故障排除

这里是分享常见问题及其解决方案的地方。  
示例使用 React，但如果你使用其他框架，仍然会觉得有用。

### 触发（dispatch）一个 action 后没有任何反应

有时你尝试 dispatch 一个 action，但视图没有更新。这是为什么？可能有几个原因。

#### 不要修改 reducer 的参数

修改 Redux 传给你的 `state` 或 `action` 是很诱人的，但千万不要这么做！

Redux 假设你永远不会修改传给 reducer 的对象。**每一次，都必须返回新的状态对象。** 即使你不使用类似 [Immer](https://github.com/immerjs/immer) 这样库，也需要完全避免变异（mutation）。

不可变性使得 [react-redux](https://github.com/gaearon/react-redux) 能够高效订阅状态的细粒度更新。同时也支持诸如 [redux-devtools](https://github.com/reduxjs/redux-devtools) 的时间旅行等极佳的开发体验功能。

例如，下面的 reducer 是错误的，因为它修改了 state：

```js
function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      // 错误！这会修改 state
      state.push({
        text: action.text,
        completed: false
      })
      return state
    case 'COMPLETE_TODO':
      // 错误！这会修改 state[action.index]
      state[action.index].completed = true
      return state
    default:
      return state
  }
}
```

它需要改写成这样：

```js
function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      // 返回一个新数组
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case 'COMPLETE_TODO':
      // 返回一个新数组
      return state.map((todo, index) => {
        if (index === action.index) {
          // 先复制对象再修改
          return Object.assign({}, todo, {
            completed: true
          })
        }
        return todo
      })
    default:
      return state
  }
}
```

代码稍微多一点，但这正是使 Redux 可预测且高效的关键。  
如果你想写更少的代码，可以用类似 [`React.addons.update`](https://facebook.github.io/react/docs/update.html) 的辅助工具，通过简洁的语法写不可变变换：

```js
// 之前：
return state.map((todo, index) => {
  if (index === action.index) {
    return Object.assign({}, todo, {
      completed: true
    })
  }
  return todo
})

// 之后：
return update(state, {
  [action.index]: {
    completed: {
      $set: true
    }
  }
})
```

最后，要更新对象，你需要用类似 Underscore 里的 `_.extend`，或更好的 [`Object.assign`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) polyfill。

确保正确使用 `Object.assign`。例如，别直接返回 `Object.assign(state, newData)`，而要返回 `Object.assign({}, state, newData)`，这样不会覆盖之前的 `state`。

你也可以使用对象扩展运算符（object spread operator）提案，语法更简洁：

```js
// 之前：
return state.map((todo, index) => {
  if (index === action.index) {
    return Object.assign({}, todo, {
      completed: true
    })
  }
  return todo
})

// 之后：
return state.map((todo, index) => {
  if (index === action.index) {
    return { ...todo, completed: true }
  }
  return todo
})
```

注意，实验语言特性可能会改变。

同时注意需要深拷贝的嵌套状态对象。`_.extend` 和 `Object.assign` 只会做浅拷贝。参考 [更新嵌套对象](./structuring-reducers/ImmutableUpdatePatterns.md#updating-nested-objects)，了解如何处理嵌套状态。

#### 别忘了调用 [`dispatch(action)`](api/Store.md#dispatchaction)

如果你定义了 action creator，调用它**不会**自动 dispatch action。例如，这段代码什么都不会发生：

#### `TodoActions.js`

```js
export function addTodo(text) {
  return { type: 'ADD_TODO', text }
}
```

#### `AddTodo.js`

```js
import React, { Component } from 'react'
import { addTodo } from './TodoActions'

class AddTodo extends Component {
  handleClick() {
    // 不会生效！
    addTodo('Fix the issue')
  }

  render() {
    return <button onClick={() => this.handleClick()}>Add</button>
  }
}
```

它不生效，因为你的 action creator 只是一个**返回** action 的函数。真正 dispatch 是你的责任。我们无法在定义时把 action creator 绑定到特定的 store，因为服务器渲染需要为每个请求单独的 Redux store。

解决方案是调用 [store](api/Store.md) 实例的 [`dispatch()`](api/Store.md#dispatchaction) 方法：

```js
handleClick() {
  // 有效！但你需要获取 store
  store.dispatch(addTodo('Fix the issue'))
}
```

如果你处在组件层级很深的位置，手动传递 store 非常麻烦。  
这也是为什么 [react-redux](https://github.com/gaearon/react-redux) 提供了 `connect` [高阶组件](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750)，它除了帮你订阅 Redux store，还会把 `dispatch` 注入到你的组件 props 里。

修正后的代码像这样：

#### `AddTodo.js`

```js
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addTodo } from './TodoActions'

class AddTodo extends Component {
  handleClick() {
    // 有效！
    this.props.dispatch(addTodo('Fix the issue'))
  }

  render() {
    return <button onClick={() => this.handleClick()}>Add</button>
  }
}

// 除了 state，`connect` 会把 `dispatch` 放入组件的 props。
export default connect()(AddTodo)
```

你也可以将 `dispatch` 手动传递给其他组件。

#### 确保 mapStateToProps 函数正确

有时你正确地 dispatch 了 action 并且 reducer 也起作用了，但对应的状态没有正确映射到组件 props。

## 其他问题

可以去 **#redux** [Reactiflux](https://www.reactiflux.com/) Discord 频道问问，或者 [创建 issue](https://github.com/reduxjs/redux/issues)。

如果你解决了问题，也欢迎[编辑此文档](https://github.com/reduxjs/redux/edit/master/docs/usage/Troubleshooting.md)，帮助下一个遇到同样问题的人。