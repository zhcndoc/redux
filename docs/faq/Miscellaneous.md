---
id: miscellaneous
title: 杂项
sidebar_label: 杂项
---

## Redux 常见问答：杂项

### 有没有规模较大、真正的 Redux 项目？

有，很多！举几个例子：

- [Twitter 的移动端网站](https://mobile.twitter.com/)
- [Wordpress 的新管理页面](https://github.com/Automattic/wp-calypso)
- [Firefox 的新调试器](https://github.com/devtools-html/debugger.html)
- [HyperTerm 终端应用](https://github.com/zeit/hyperterm)

还有许许多多！Redux Addons 目录中有**[一份基于Redux的应用和示例列表](https://github.com/markerikson/redux-ecosystem-links/blob/master/apps-and-examples.md)**，其中包含各种实际应用，无论大小。

#### 进一步信息

**文档**

- [介绍：示例](../introduction/Examples.md)

**讨论**

- [Reddit：大型开源 React/Redux 项目有哪些？](https://www.reddit.com/r/reactjs/comments/496db2/large_open_source_reactredux_projects/)
- [HN：有使用 Redux 构建的巨大 Web 应用吗？](https://news.ycombinator.com/item?id=10710240)

### 如何在 Redux 中实现身份认证？

身份认证对任何真实的应用都是必不可少的。实现身份认证时，你必须记住，这不会改变你组织应用的方式，应像实现其他功能一样实现身份认证。过程相对简单：

1. 创建表示 `LOGIN_SUCCESS`、`LOGIN_FAILURE` 等的 action 常量。

2. 创建 action creators，接收凭证、表示认证是否成功的标志、token 或错误消息作为 payload。

3. 使用 Redux Thunk 中间件或任何你认为合适的中间件创建异步 action creator，发送网络请求到 API，若凭证有效则返回 token。然后将 token 保存在本地存储，或者如果失败则向用户显示响应。你可以在上一步写的 action creators 中执行这些副作用。

4. 创建 reducer，根据每种可能的认证情况（如 `LOGIN_SUCCESS`、`LOGIN_FAILURE` 等）返回下一个状态。

#### 进一步信息

**文章**

- [Auth0: 使用 JWT 进行身份认证](https://auth0.com/blog/2016/01/04/secure-your-react-and-redux-app-with-jwt-authentication/)
- [处理 Redux 中身份认证的技巧](https://medium.com/@MattiaManzati/tips-to-handle-authentication-in-redux-2-introducing-redux-saga-130d6872fbe7)

**示例**

- [react-redux-jwt-auth-example](https://github.com/joshgeller/react-redux-jwt-auth-example)

**库**

- [Redux Addons 目录：使用场景 - 身份认证](https://github.com/markerikson/redux-ecosystem-links/blob/master/use-cases.md#authentication)