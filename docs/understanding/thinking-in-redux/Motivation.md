---
id: motivation
title: 动机
description: '介绍 > 动机：Redux 试图解决什么问题？'
---

# 动机

随着 JavaScript 单页面应用的需求变得越来越复杂，**我们的代码必须管理比以往更多的状态**。这些状态可以包括服务器响应和缓存数据，以及尚未持久化到服务器的本地创建数据。UI 状态的复杂性也在增加，我们需要管理活动路由、选中的标签页、加载动画、分页控件等等。

管理这些不断变化的状态很困难。如果一个模型可以更新另一个模型，那么视图可以更新模型，模型又更新另一个模型，而这又可能导致另一个视图更新。到某个时候，你不再理解你的应用程序中到底发生了什么，因为你**失去了对状态的何时、为何以及如何变化的控制。** 当系统变得不透明且非确定性时，很难重现错误或添加新功能。

如果这还不够糟糕，试想一下**前端产品开发中日益普遍的新需求**。作为开发者，我们被期望处理乐观更新、服务端渲染、在路由转换前抓取数据等等。我们发现自己正在试图管理一种前所未有的复杂性，不可避免地会问出这个问题：[是否该放弃了？](https://www.quirksmode.org/blog/archives/2015/07/stop_pushing_th.html) 答案是否定的。

这种复杂性难以处理，因为**我们正在混合两个极难被人脑推理的概念：** **变异（mutation）和异步（asynchronicity）。** 我称它们为 [Mentos 与可乐（Mentos and Coke）](https://en.wikipedia.org/wiki/Diet_Coke_and_Mentos_eruption)。两者单独存在时都很棒，但放在一起却会制造混乱。像 [React](https://facebook.github.io/react) 这样的库试图通过取消异步和直接 DOM 操作来解决视图层面的问题。然而，数据状态的管理留给了开发者自己。这就是 Redux 的用武之地。

继承了 [Flux](https://facebookarchive.github.io/flux)、[CQRS](https://martinfowler.com/bliki/CQRS.html) 和 [事件溯源（Event Sourcing）](https://martinfowler.com/eaaDev/EventSourcing.html) 的思想，**Redux 试图通过对更新的方式和时间施加一定的限制，使状态变异变得可预测。** 这些限制反映在 Redux 的[三大原则](ThreePrinciples.md)中。