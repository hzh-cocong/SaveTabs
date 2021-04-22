module.exports = {
  // pages: {
  //   savetabs: {
  //     // 入口js的路径
  //     entry: 'src/savetabs.js',
  //     // 在 dist/index.html 的输出
  //     filename: 'savetabs.html',
  //     // 当使用 title 选项时，
  //     // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
  //     title: 'SaveTabs',
  //     // 提取出来的通用 chunk 和 vendor chunk。
  //     chunks: []
  //   },
  //   options: {
  //     // 入口js的路径
  //     entry: 'src/options.js',
  //     // 在 dist/index.html 的输出
  //     filename: 'options.html',
  //     // 当使用 title 选项时，
  //     // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
  //     title: 'SaveTabs',
  //     // 提取出来的通用 chunk 和 vendor chunk。
  //     chunks: []
  //     // chunks: ['chunk-vendors', 'chunk-common', 'options']
  //   },
  // },
  lintOnSave: true,
  filenameHashing: false,
  chainWebpack: config => {
    config.optimization.delete('splitChunks')
  },
  configureWebpack: config => {
    config.output.filename = '[name].js'
    config.output.chunkFilename = '[name].js'
  },
  css: {
    extract: {
      filename: '[name].css',
    },
  },
  // configureWebpack: config => {
  //   //关闭代码分离，只生成一个js文件和css文件
  //   config.optimization.splitChunks = false;
  //   //config.optimization.splitChunks(false)
  //   // delete config.optimization.splitChunks
  //   // config.optimization.splitChunks.mmmmmmmmmmmm = 'kkkkkkkkkkkkkk'
  // },
  // // configureWebpack: {
  // //   optimization: {
  // //     splitChunks: {
  // //       jjjjjjjjj:'ff'
  // //     }
  // //   }
  // // },
}