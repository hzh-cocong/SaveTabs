const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir)
}

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
      // title: 'SaveTabs',
      title: 'SaveTabs | 此为新窗口，部分功能可能无法使用',
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },

  productionSourceMap: false, //生产环境是否生成 sourceMap 文件，一般情况不建议打开
  lintOnSave: process.env.NODE_ENV !== 'production', //

  chainWebpack: config => {
    // 禁止代码分离
    config.optimization.delete("splitChunks");

    // 处理 svg
    config.module.rules.delete("svg"); // 删除默认配置中处理svg
    config.module.rule('svg-sprite-loader')
                    .test(/\.svg$/)
                    .include
                    .add(resolve('src/assets/icons')) //处理svg目录
                  .end()
                  .use('svg-sprite-loader')
                    .loader('svg-sprite-loader')
                    .options({
                      symbolId: 'icon-[name]'
                    })
                  .end()

    //todo
    // 压缩图片（貌似没什么效果）
    config.module
        .rule('images')
        .test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({ bypassOnDebug: true, disable: true, })
  },

  configureWebpack: {
    output: {
      filename: (pathData) => {
        // console.log('ffffffffffffffffffff', pathData)
        if(pathData.chunk.name == 'background') {
          return 'js/background.js';
        } else if(pathData.chunk.name == 'injected_script') {
          return 'js/injected_script.js';
        }
        // return pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js';

        return 'js/[name].[contenthash:8].js';
      }
    },
    entry: {
      background: [
        resolve('src/background.js')
      ],
      injected_script: [
        resolve('src/injected_script.js')
      ]
    },

    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: false,
          uglifyOptions: {
            output: {
              comments: false, // 去掉注释
            },
            warnings: false,
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log']//移除console
            },
          }
        }),
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  }
}