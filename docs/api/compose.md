---
id: compose
title: compose
hide_title: true
description: 'API > compose：将多个函数组合在一起'
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

&nbsp;

# `compose(...functions)`

## 概述

从右到左组合函数。

这是一个函数式编程的工具函数，并作为 Redux 中的一个方便工具包含在内。
你可能想用它来连续应用多个[store增强器](../understanding/thinking-in-redux/Glossary.md#store-enhancer)。
`compose` 同样可作为一个通用的独立方法使用。

<CoreApiNote />

You shouldn't have to call `compose` directly. `configureStore` sets up the standard `applyMiddleware` and Redux DevTools store enhancers, and offers an `enhancers` callback for adding more.

## 参数

1. (_arguments_): 要组合的函数。每个函数期望接受单个参数。其返回值会作为参数传递给左侧的函数，以此类推。唯一例外的是最右侧的函数参数可以接受多个参数，因为它将决定组合后最终函数的参数签名。

### 返回值

(_Function_): 通过从右到左组合给定函数生成的最终函数。

## 示例

This example demonstrates how to use `compose` to enhance a [store](Store.md) with [`applyMiddleware`](applyMiddleware.md) and a second store enhancer. The enhancers are applied from right to left, so `applyMiddleware` wraps the store that `persistEnhancer` produced.

```js
import { createStore, applyMiddleware, compose } from 'redux'
import { thunk } from 'redux-thunk'
import { persistEnhancer } from './enhancers/persist'
import reducer from '../reducers'

const store = createStore(
  reducer,
  compose(applyMiddleware(thunk), persistEnhancer)
)
```

## 小贴士

- `compose` 只是让你写出深度嵌套的函数转换时不出现代码右移的情况。别过度神化它！