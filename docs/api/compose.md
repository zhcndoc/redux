---
id: compose
title: compose
hide_title: true
description: 'API > compose：将多个函数组合在一起'
---

&nbsp;

# `compose(...functions)`

## 概述

从右到左组合函数。

这是一个函数式编程的工具函数，并作为 Redux 中的一个方便工具包含在内。
你可能想用它来连续应用多个[store增强器](../understanding/thinking-in-redux/Glossary.md#store-enhancer)。
`compose` 同样可作为一个通用的独立方法使用。

:::warning 警告

你通常不需要直接调用 `compose`。
Redux Toolkit 的 [`configureStore` 方法](https://redux-toolkit.js.org/api/configureStore) 会自动配置带有标准 `applyMiddleware` 和 Redux DevTools store增强器的 Redux 存储，并提供 `enhancers` 参数以传入额外的增强器。

:::

## 参数

1. (_arguments_): 要组合的函数。每个函数期望接受单个参数。其返回值会作为参数传递给左侧的函数，以此类推。唯一例外的是最右侧的函数参数可以接受多个参数，因为它将决定组合后最终函数的参数签名。

### 返回值

(_Function_): 通过从右到左组合给定函数生成的最终函数。

## 示例

此示例展示了如何使用 `compose` 来增强一个[store](Store.md)，结合 [`applyMiddleware`](applyMiddleware.md) 和来自 [redux-devtools](https://github.com/reduxjs/redux-devtools) 包的几个开发者工具。

```js
import { createStore, applyMiddleware, compose } from 'redux'
import { thunk } from 'redux-thunk'
import DevTools from './containers/DevTools'
import reducer from '../reducers'

const store = createStore(
  reducer,
  compose(applyMiddleware(thunk), DevTools.instrument())
)
```

## 小贴士

- `compose` 只是让你写出深度嵌套的函数转换时不出现代码右移的情况。别过度神化它！