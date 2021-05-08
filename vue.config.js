// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

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
  },

  productionSourceMap: false, //生产环境是否生成 sourceMap 文件，一般情况不建议打开

  chainWebpack: config => {
    config.module
      .rule('svg-sprite')
      .use('svgo-loader')
      .loader('svgo-loader');

    // 禁止代码分离
    config.optimization.delete("splitChunks");

    // config.optimization.minimizer = [new UglifyJsPlugin()];

    // if (process.env.NODE_ENV === 'production') {
    //   config.plugins.push(new UglifyJsPlugin())
    // }
  },

  configureWebpack: {
    // optimization: {
    //   minimizer: [
    //     new UglifyJsPlugin({
    //       test: /\.js(\?.*)?$/i,
    //       uglifyOptions: {
    //         warnings: false,
    //         parse: {},
    //         compress: {},
    //         mangle: true, // Note `mangle.properties` is `false` by default.
    //         output: null,
    //         toplevel: false,
    //         nameCache: null,
    //         ie8: false,
    //         keep_fnames: false,
    //       },
    //     })
    //   ]
    // },
    // plugins: [
    //   new UglifyJsPlugin({
    //     test: /\.js(\?.*)?$/i,
    //     uglifyOptions: {
    //       warnings: false,
    //       parse: {},
    //       compress: {},
    //       mangle: true, // Note `mangle.properties` is `false` by default.
    //       output: null,
    //       toplevel: false,
    //       nameCache: null,
    //       ie8: false,
    //       keep_fnames: false,
    //     },
    //   })
    // ]
  }
}