const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  pages: {
    options: {
      // 入口js的路径
      entry: 'src/options.js',
      // 模板来源
      template: 'public/options.html',
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
  },

  productionSourceMap: false, //生产环境是否生成 sourceMap 文件，一般情况不建议打开
  lintOnSave: process.env.NODE_ENV !== 'production', //

  chainWebpack: config => {
    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader')

    // 禁止代码分离
    config.optimization.delete("splitChunks");

    // 压缩图片
    // 和 svg-sprite 冲突，暂时不解决，而且压缩后反而变大了
    // config.module
    //     .rule('images')
    //     .test(/\.(png|jpe?g|gif|svg|webp)(\?.*)?$/)
    //     .use('image-webpack-loader')
    //     .loader('image-webpack-loader')
    //     .options({ bypassOnDebug: true, disable: true, })
  },

  configureWebpack: {
    // plugins: [
    //   new UglifyJsPlugin({
    //     uglifyOptions: {
    //       output: {
    //         comments: false, // 去掉注释
    //       },
    //       warnings: false,
    //       compress: {
    //         drop_console: true,
    //         drop_debugger: true,
    //         pure_funcs: ['console.log']//移除console
    //       },
    //     }
    //   })
    // ],
  }
}