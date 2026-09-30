---
id: index
title: 使用指南索引
sidebar_label: 使用指南索引
---

# 使用指南

使用指南部分提供了有关如何在实际应用中正确使用 Redux 的实用指导，包括项目设置与架构、模式、实践和技术。

:::info 前提条件

本类别中的页面假设你已经理解了[“Redux 基础”教程](../tutorials/fundamentals/part-1-overview.md)中解释的核心 Redux 术语和概念，包括 actions、reducers、stores、不可变性（immutability）、React-Redux 以及异步逻辑。

:::

## 设置和组织

本节涵盖了如何设置和组织基于 Redux 的项目的信息。

- [Configuring Your Store](ConfiguringYourStore.md)
- [Redux Toolkit Setup with Next.js](nextjs.mdx)
- [Code Splitting](CodeSplitting.md)
- [Server Rendering](ServerRendering.md)
- [Isolating Redux Sub-Apps](IsolatingSubapps.md)

## Migrations

This section covers how to update existing Redux code to current patterns and versions.

- [Migrating to Modern Redux](migrating-to-modern-redux.mdx)
- [Migrating to RTK 2.0 and Redux 5.0](migrations/migrating-rtk-2.md)

## Code Quality

本节提供了用于提升 Redux 代码质量的工具和技术信息。

- [Usage with TypeScript](UsageWithTypescript.md)
- [Writing Tests](WritingTests.mdx)
- [Troubleshooting](Troubleshooting.md)
- [Debugging Redux](DebuggingRedux.md)

## Redux 逻辑与模式

本节提供了有关典型 Redux 模式和编写各种 Redux 逻辑方法的信息。

- [Structuring Reducers](structuring-reducers/StructuringReducers.md)
- [Reducing Boilerplate](ReducingBoilerplate.md)
- [Deriving Data with Selectors](deriving-data-selectors.md)
- [Writing Logic with Thunks](writing-logic-thunks.mdx)
- [Side Effects Approaches](side-effects-approaches.mdx)
- [Writing Custom Middleware](WritingCustomMiddleware.md)
- [Implementing Undo History](ImplementingUndoHistory.md)
