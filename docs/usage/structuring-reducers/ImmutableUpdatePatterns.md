---
id: immutable-update-patterns
title: 不可变更新模式
description: '结构化 Reducers > 不可变更新模式：如何正确地不可变更新状态，并附带常见错误的示例'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# 不可变更新模式

<HandWrittenReducersNote />

在[先决概念：不可变数据管理](PrerequisiteConcepts.md#immutable-data-management)一节中，列出了一些如何执行基本不可变更新的示例，例如更新对象字段或在数组末尾添加条目。不过，reducer 往往需要组合这些基本操作来完成更复杂的任务。下面介绍一些常见的实现方式。

## 更新嵌套对象 {#updating-nested-objects}

更新嵌套数据的关键是**_每个_嵌套层级都必须被复制并适当更新**。这通常是刚学习 Redux 时比较难理解的概念，也经常出现特定问题导致对嵌套对象的直接意外修改，应当避免。

##### 正确方法：复制所有嵌套层级的数据

不幸的是，对深层嵌套状态进行正确的不可变更新往往会变得冗长且难读。下面是更新 `state.first.second[someId].fourth` 的示例：

```js
function updateVeryNestedField(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
}
```

显然，每加一层嵌套，代码的可读性就会降低，出错的机会也增多。这也是我们鼓励尽量让状态扁平化，以及尽量采用组合 reducers 的若干原因之一。

##### 使用 Redux Toolkit 和 Immer 简化嵌套更新

Redux Toolkit 的 [`createSlice`](/toolkit/api/createSlice) 和 [`createReducer`](/toolkit/api/createReducer) 会使用 Immer 的 [`produce` 函数](https://immerjs.github.io/immer/produce)包装 case reducer。在其中，上面的更新只需一行：`state.first.second[action.payload.id].fourth = action.payload.value`。Immer 只复制发生变化的层级。**这只在 `createSlice`、`createReducer` 或手动调用 `produce` 时有效；在 Immer 外部写同样的代码会真正修改状态。**Immer 的工作方式、用法模式和注意事项请参阅[使用 Immer 编写 Reducer](/toolkit/usage/immer-reducers)。

即使所有 reducer 都使用 Redux Toolkit 编写，了解本页其余内容也能帮助你在出错时理解 Immer 代为完成了什么。后续章节将介绍如何手动编写这些更新。

##### 常见错误 #1：新变量仍指向同一个对象

定义新变量并不会创建新的实际对象——它只是创建了对同一对象的另一引用。举例来说：

```js
function updateNestedState(state, action) {
  let nestedState = state.nestedState
  // 错误：直接修改了已有对象的引用——切勿这样做！
  nestedState.nestedField = action.data

  return {
    ...state,
    nestedState
  }
}
```

该函数确实正确返回了顶层 state 对象的浅拷贝，但因为 `nestedState` 仍指向原对象，状态被直接修改了。

##### 常见错误 #2：只浅拷贝了一层

另一个常见的错误表现形式是：

```js
function updateNestedState(state, action) {
  // 问题：这里只做了浅拷贝！
  let newState = { ...state }

  // 错误：nestedState 仍是同一个对象！
  newState.nestedState.nestedField = action.data

  return newState
}
```

只浅拷贝顶层是不够的——`nestedState` 对象也应该被复制。

## 向数组中插入和删除元素

一般情况下，JavaScript 数组内容的修改通过 `push`、`unshift`、`splice` 等变异操作完成。由于我们不想在 reducers 中直接变异状态，这些操作应避免使用。因此，你可能见过这样写“插入”或“删除”行为：

```js
function insertItem(array, action) {
  return [
    ...array.slice(0, action.index),
    action.item,
    ...array.slice(action.index)
  ]
}

function removeItem(array, action) {
  return [...array.slice(0, action.index), ...array.slice(action.index + 1)]
}
```

但请记住，关键是_原内存引用_未发生修改。**只要先复制，就可以安全地对副本进行变异**。这对数组和对象同样适用，但嵌套的值仍必须遵守同样的规则。

这意味着我们也可以这样写插入和删除函数：

```js
function insertItem(array, action) {
  let newArray = array.slice()
  newArray.splice(action.index, 0, action.item)
  return newArray
}

function removeItem(array, action) {
  let newArray = array.slice()
  newArray.splice(action.index, 1)
  return newArray
}
```

删除函数也可以写成：

```js
function removeItem(array, action) {
  return array.filter((item, index) => index !== action.index)
}
```

## 更新数组中的某个元素

通过 `Array.map` 可以更新数组中的某个元素：对想更新的元素返回新的值，其他元素保持原样即可：

```js
function updateObjectInArray(array, action) {
  return array.map((item, index) => {
    if (index !== action.index) {
      // 不是我们关心的元素 - 保持原样
      return item
    }

    // 这是我们想要更新的元素 - 返回更新后的值
    return {
      ...item,
      ...action.item
    }
  })
}
```

## 不可变更新的工具库

[Immer](https://immerjs.github.io/immer/) is the library we recommend and the one Redux Toolkit uses internally: you write mutating code against a draft, and `produce` returns a new immutably-updated value. You can call `produce` directly in a hand-written reducer if you're not using `createSlice`. Other utilities take a string path or an update spec instead, but they solve the same problem with a less familiar syntax, and Immer covers the cases they were written for.

## 进一步信息

- [Redux Toolkit: Writing Reducers with Immer](/toolkit/usage/immer-reducers)
- [Immer docs](https://immerjs.github.io/immer/)
- [Dave Ceddia: The Complete Guide to Immutability in React and Redux](https://daveceddia.com/react-redux-immutability-guide/)
- [React docs: Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [React docs: Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
