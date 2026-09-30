---
id: miscellaneous
title: 杂项
sidebar_label: 杂项
---

## Redux 常见问答：杂项

### 有没有规模较大、真正的 Redux 项目？ {#are-there-any-larger-real-redux-projects}

有，很多！举几个例子：

- [Twitter / X's web client](https://x.com/)
- [Wordpress's admin page](https://github.com/Automattic/wp-calypso)
- [Firefox's debugger](https://github.com/firefox-devtools/debugger)
- [The Hyper terminal application](https://github.com/vercel/hyper)

此外还有很多类似项目！

#### 进一步信息

**文档**

- [介绍：示例](../introduction/Examples.md)

**讨论**

- [Reddit：大型开源 React/Redux 项目有哪些？](https://www.reddit.com/r/reactjs/comments/496db2/large_open_source_reactredux_projects/)
- [HN：有使用 Redux 构建的巨大 Web 应用吗？](https://news.ycombinator.com/item?id=10710240)

### 如何在 Redux 中实现身份认证？ {#how-can-i-implement-authentication-in-redux}

身份认证对任何真实的应用都是必不可少的。实现身份认证时，你必须记住，这不会改变你组织应用的方式，应像实现其他功能一样实现身份认证。过程相对简单：

1. 使用 `createSlice` 创建 `auth` slice，保存当前用户和 token（或表示用户是否已登录的标记），并添加登录请求的 loading 和 error 字段。

2. 使用 [RTK Query mutation](/toolkit/rtk-query/usage/mutations) 或 [`createAsyncThunk`](/toolkit/api/createAsyncThunk) 发起登录请求，传入凭据并返回 token。在 slice 的 `extraReducers` 中处理 pending、fulfilled 和 rejected 状态（mutation 的生命周期 action 也可以通过 `addMatcher` 处理），保存 token 或错误信息。

3. 发起其他请求时，从 store 中读取 token。使用 RTK Query 时，可以在 `baseQuery` 的 [`prepareHeaders`](/toolkit/rtk-query/api/fetchBaseQuery#setting-default-headers-on-requests) 回调中读取；该回调会收到 `getState`。若组件外的其他代码也需要 token，请参阅[如何在非组件文件中使用 Redux store？](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files)。

4. 如果希望页面重新加载后仍保留会话，可以在登录成功时通过 [listener middleware](/toolkit/api/createListenerMiddleware) effect 持久化 token，并在创建 store 时将其读回 `preloadedState`。

#### 进一步信息

**文档**

- [RTK Query：身份验证示例](/toolkit/rtk-query/usage/examples#authentication)

**Articles**

- [Auth0：使用 JWT 进行身份验证](https://auth0.com/blog/secure-your-react-and-redux-app-with-jwt-authentication/)（2016 年文章，使用 `connect` 和手写 thunk；整体流程仍然适用）
