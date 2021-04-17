module.exports = {
  pages: {
    index: {
      // 入口js的路径
      entry: 'src/main.js',
      // 在 dist/index.html 的输出
      filename: 'popup.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'SaveTabs',
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    options: {
      // 入口js的路径
      entry: 'src/options.js',
      // 在 dist/index.html 的输出
      filename: 'options.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'SaveTabs',
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'options']
    },
    test: {
      // 入口js的路径
      entry: 'src/test.js',
      // 在 dist/index.html 的输出
      filename: 'test.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'test',
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'test']
    },
    savetabs: {
      // 入口js的路径
      entry: 'src/savetabs.js',
      // 在 dist/index.html 的输出
      filename: 'savetabs.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'SaveTabs',
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'savetabs']
    }
  }
}