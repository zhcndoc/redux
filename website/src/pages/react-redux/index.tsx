import React from 'react'
import LibraryLanding from '@site/src/components/LibraryLanding'

const features = [
  {
    title: '官方维护',
    content: (
      <p>
        React Redux 由 Redux 团队维护，并且{' '}
        <strong>
          始终跟进 Redux 和 React 的最新 API
        </strong>
        .
      </p>
    )
  },
  {
    title: '符合预期',
    content: (
      <p>
        <strong>专为 React 组件模型设计</strong>。你可以定义如何从 Redux 中提取组件所需的值，组件会在需要时自动更新。
      </p>
    )
  },
  {
    title: '封装完善',
    content: (
      <p>
        提供相关 API，{' '}
        <strong>让组件能够与 Redux store 交互</strong>
        ，无需你自行编写这部分逻辑。
      </p>
    )
  },
  {
    title: '性能优化',
    content: (
      <p>
        自动完成<strong>复杂的性能优化</strong>，只有组件所需的数据实际发生变化时才会重新渲染。
      </p>
    )
  }
]

export default function ReactReduxHome(): React.ReactNode {
  return (
    <LibraryLanding
      name="React Redux"
      tagline="Redux 官方 React 绑定库"
      description="Redux 官方 React 绑定库"
      getStartedPath="react-redux/introduction/getting-started"
      features={features}
    />
  )
}
