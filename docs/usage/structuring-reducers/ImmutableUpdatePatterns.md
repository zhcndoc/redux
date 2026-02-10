---
id: immutable-update-patterns
title: 不可变更新模式
description: '结构化 Reducers > 不可变更新模式：如何正确地不可变更新状态，并附带常见错误的示例'
---

# 不可变更新模式

在文章 [先决概念#不可变数据管理](PrerequisiteConcepts.md#immutable-data-management) 中，列举了多种如何以不可变方式执行基本更新操作的好例子，比如更新对象中的某个字段或向数组末尾添加元素等。然而，reducers 通常需要将这些基本操作组合起来，以执行更复杂的任务。以下是一些常见任务的示例。

## 更新嵌套对象

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

##### 常见错误 #1：新变量指向同一对象

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

由于手写不可变更新代码容易枯燥，有许多工具库尝试抽象出这个过程。它们的 API 和用法各有差异，但都旨在提供更简短、简洁的写法。例如，[Immer](https://github.com/mweststrate/immer) 将不可变更新简化为普通函数和普通 JS 对象：

```js
var usersState = [{ name: 'John Doe', address: { city: 'London' } }]
var newState = immer.produce(usersState, draftState => {
  draftState[0].name = 'Jon Doe'
  draftState[0].address.city = 'Paris'
  // 嵌套更新类似可变写法
})
```

还有像 [dot-prop-immutable](https://github.com/debitoor/dot-prop-immutable) 这样接收字符串路径的命令：

```js
state = dotProp.set(state, `todos.${index}.complete`, true)
```

以及 [immutability-helper](https://github.com/kolodny/immutability-helper)（React Immutability Helpers 的分支）这样使用嵌套值和辅助函数的：

```js
var collection = [1, 2, { a: [12, 17, 15] }]
var newCollection = update(collection, {
  2: { a: { $splice: [[1, 1, 13, 14]] } }
})
```

它们为手写不可变更新逻辑提供了不错的替代方案。

大量不可变更新工具的列表可以查看 [Redux Addons Catalog](https://github.com/markerikson/redux-ecosystem-links) 中的 [Immutable Data#Immutable Update Utilities](https://github.com/markerikson/redux-ecosystem-links/blob/master/immutable-data.md#immutable-update-utilities) 一节。

## 使用 Redux Toolkit 简化不可变更新

我们的 **[Redux Toolkit](https://redux-toolkit.js.org/)** 包含了一个内部使用 Immer 的 [`createReducer` 工具](https://redux-toolkit.js.org/api/createReducer)。
因此，你可以编写看似“变异”状态的 reducers，但其更新实际上是以不可变方式应用的。

这使得不可变更新逻辑可以写得更简单。以下展示了使用 `createReducer` 后，[嵌套数据示例](#正确方法复制所有嵌套层级数据) 的写法：

```js
import { createReducer } from '@reduxjs/toolkit'

const initialState = {
  first: {
    second: {
      id1: { fourth: 'a' },
      id2: { fourth: 'b' }
    }
  }
}

const reducer = createReducer(initialState, {
  UPDATE_ITEM: (state, action) => {
    state.first.second[action.someId].fourth = action.someValue
  }
})
```

这明显更短更易读。但**这只有在你使用 Redux Toolkit 提供的“魔法”`createReducer` 函数时才有效**，该函数会将你的 reducer 包装到 Immer 的 [`produce` 函数](https://immerjs.github.io/immer/produce) 中。**如果在没有 Immer 的情况下使用这个 reducer，它实际上会直接修改状态！**此外，仅凭代码本身很难看出这个函数实际上是安全的，并且做了不可变更新。请务必深入理解不可变更新的概念。如果真的使用该方法，建议在代码中加注释说明该 reducer 是使用 Redux Toolkit 和 Immer 实现的。

另外，Redux Toolkit 的 [`createSlice` 工具](https://redux-toolkit.js.org/api/createSlice) 会基于你提供的 reducer 函数自动生成 action 创建器和 action 类型，同时仍具备 Immer 支持的更新能力。

## 进一步信息

- [Dave Ceddia：React 和 Redux 中不可变性的完整指南](https://daveceddia.com/react-redux-immutability-guide/)
- [React 文档：更新 State 中的对象](https://beta.reactjs.org/learn/updating-objects-in-state)
- [React 文档：更新 State 中的数组](https://beta.reactjs.org/learn/updating-arrays-in-state)