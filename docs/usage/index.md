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

- [配置你的 Store](ConfiguringYourStore.md)
- [代码拆分](CodeSplitting.md)
- [服务端渲染](ServerRendering.md)
- [隔离 Redux 子应用](IsolatingSubapps.md)

## 代码质量

本节提供了用于提升 Redux 代码质量的工具和技术信息。

- [与 TypeScript 一起使用](UsageWithTypescript.md)
- [编写测试](WritingTests.mdx)
- [故障排除](Troubleshooting.md)

## Redux 逻辑与模式

本节提供了有关典型 Redux 模式和编写各种 Redux 逻辑方法的信息。

- [构建 Reducers 结构](structuring-reducers/StructuringReducers.md)
- [减少样板代码](ReducingBoilerplate.md)
- [使用 Selectors 派生数据](../usage/deriving-data-selectors.md)
- [实现撤销历史](ImplementingUndoHistory.md)