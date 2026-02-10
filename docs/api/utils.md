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

## `isPlainObject`

如果值看起来是一个普通的 JS 对象，则返回 true。