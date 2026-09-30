---
id: utils
title: 额外实用工具
hide_title: true
description: 'API > utils: 额外的实用工具函数'
---

&nbsp;

# 实用工具函数

Redux 核心导出了额外的实用工具函数以供重用。

## `isAction`

如果参数是一个有效的 Redux action 对象（一个带有字符串 `type` 字段的普通对象），则返回 true。

这也作为一个 TypeScript 类型谓词，能将 TS 类型缩小为 `Action<string>`。

这在中间件中尤其有用：传入的 `action` 类型为 `unknown`，因为它可能是 thunk 函数或其他非对象值：

```ts
import { isAction } from 'redux'
import type { Middleware } from 'redux'

const loggerMiddleware: Middleware = store => next => action => {
  if (isAction(action)) {
    // `action` is now typed as `Action<string>`
    console.log('dispatching', action.type)
  }
  return next(action)
}
```

## `isPlainObject`

如果值看起来是一个普通的 JS 对象，则返回 true。
