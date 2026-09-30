import React from 'react'
import LibraryLanding from '@site/src/components/LibraryLanding'

const features = [
  {
    title: '简洁',
    content: (
      <p>
        提供多种工具，简化常见任务，例如{' '}
        <strong>配置 store、创建 reducer、编写不可变更新逻辑</strong>
        等。
      </p>
    )
  },
  {
    title: '内置最佳实践',
    content: (
      <p>
        开箱即用，提供<strong>合理的 store 默认配置</strong>，并内置{' '}
        <strong>最常用的 Redux 扩展</strong>。
      </p>
    )
  },
  {
    title: '功能强大',
    content: (
      <p>
        借鉴 Immer、Autodux 等库，让你可以{' '}
        <strong>用类似“可变”的方式编写不可变更新逻辑</strong>，甚至{' '}
        <strong>自动创建完整的状态切片</strong>。
      </p>
    )
  },
  {
    title: '高效开发',
    content: (
      <p>
        让你专注于应用所需的核心逻辑，以便{' '}
        <strong>用更少的代码完成更多工作</strong>。
      </p>
    )
  }
]

export default function ToolkitHome(): React.ReactNode {
  return (
    <LibraryLanding
      name="Redux Toolkit"
      tagline="官方推荐、集成最佳实践的高效 Redux 开发工具集"
      description="官方推荐、集成最佳实践的高效 Redux 开发工具集"
      getStartedPath="toolkit/introduction/getting-started"
      features={features}
    />
  )
}
