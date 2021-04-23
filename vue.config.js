module.exports = {
  pages: {
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
    index: {
      // 入口js的路径
      entry: 'src/main.js',
      // 模板来源
      template: 'public/savetabs.html',
      // 在 dist/index.html 的输出
      filename: 'savetabs.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'SaveTabs',
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  }
}