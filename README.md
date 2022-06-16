## 简介

**[SaveTabs - 窗口标签管理器](https://www.cocong.cn/savetabs)** 是一个浏览器扩展，它可以将浏览器窗口内的所有网址保存起来，这样你就可以安全地关闭浏览器窗口以便腾出系统资源，并且在下次需要的时候你可以很方便地去重新打开它们。

## 功能概览

1、支持一键保存和打开所有网页，提高工作和学习效率

![](https://www.cocong.cn/savetabs/img/feature1.png)

2、支持书签、历史和标签页等的聚合搜索，避免多处查找

![](https://www.cocong.cn/savetabs/img/feature2.png)

3、可以根据自己的喜好调整插件的行为和样式，喜欢 DIY 的朋友可以尽情发挥

![](https://www.cocong.cn/savetabs/img/feature3.png)



[点此](https://zhuanlan.zhihu.com/p/398804467)可查看更详细的教程

## 下载地址

[https://www.cocong.cn/savetabs](https://www.cocong.cn/savetabs)

## 开发

### 本地测试

> 先拷贝仓库到本地

```bash
git clone https://github.com/hzh-cocong/SaveTabs
```

> 在项目根目录下执行以下命令安装项目所需要的全部包（注意：node_modules 文件多大 4.79 G，注意下载流量消耗）

```bash
cd SaveTabs
npm install
```

> 使用图形化界面管理项目，会自动打开 http://localhost:8000 管理页面，后面我们将用它来执行热更新和编译

```bash
vue ui
```

> 代码修改

由于该扩展内部使用了大量只有浏览器扩展才能调用的 API，为了方便在浏览器网页上直接进行测试，`src/plugins/tool-test.js` 文件内部模拟了这些 API，并填充了大量测试数据，这样就不会因为 API 未定义而报错。同时，因为是写死了的数据，在运行时所做的所有修改，都会因为浏览器刷新而全部还原。

下面是需要修改的地方，不多，当然你有更好的方法也欢迎提出。

1. 修改 `src/main.js` 文件第 14 行

修改前：

```js
// 区分环境（未来要改为 npm 界面设置）
/*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
```

修改后：

```js
// 区分环境（未来要改为 npm 界面设置）
//*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
```

即引入 `src/plugins/tool-test.js` 文件以实现本地浏览器网页测试。



2. 修改 `src/options.js` 文件第 14 行（同上）

修改前：

```js
// 区分环境（未来要改为 npm 界面设置）
/*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
//*/
```

修改后：

```js
// 区分环境（未来要改为 npm 界面设置）
//*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
//*/
```



3. 修改`vue.config.js` 文件第 71 行

修改前：

```js
configureWebpack: {
    //*
    output: {
      filename: (pathData) => {
        if(pathData.chunk.name == 'background') {
          return 'js/background.js';
        } else if(pathData.chunk.name == 'injected_script') {
          return 'js/injected_script.js';
        }
        // return pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js';

        return 'js/[name].[contenthash:8].js';
      }
    },//*/
```

修改后：

```js
configureWebpack: {
    /*
    output: {
      filename: (pathData) => {
        if(pathData.chunk.name == 'background') {
          return 'js/background.js';
        } else if(pathData.chunk.name == 'injected_script') {
          return 'js/injected_script.js';
        }
        // return pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js';

        return 'js/[name].[contenthash:8].js';
      }
    },//*/
```

这个功能是为了固定`background.js`和`injected_script.js`的生成名称，因为在`dist/manifest.json`中对其的引用名是写死的。这两个文件只有在以浏览器扩展的模式下才会自动执行，我们难以在网页中进行测试。当然，在测试时注释掉它最大的原因是为了实现热更新，因为如果不注释掉它的话，热更新将失败，即 `npm run serve` 会报错。



4. 修改`src/plugins/tool-test.js` 文件第 3 行

```js
/*
import Lang from '../../public/_locales/en/messages.json'/*/
import Lang from '../../public/_locales/zh_CN/messages.json'
//*/
```

如果要切换语言，只需 import 对应的语言配置文件，运行时将展示对应的翻译结果。

注意这个只在以 **Web** 模式执行时有用，实际在以 **浏览器扩展** 模式下执行时，浏览器扩展会自动根据本地语言导入对应的语言配置文件，因此在 **编译部署** 时也无需还原，不过为了保持整个代码库的一致性，push 的时候请忽略该文件，除非是有价值的修改。



> 开始测试

打开 http://localhost:8000 管理页面，点击左侧的 **任务**，再点击 **任务** 页面下的 **serve** 选项，最后点击 **运行** 按钮，等编译完成后，我们就可以打开 `http://localhost:8080/savetabs.html` 或 `http://localhost:8080/options.html` 页面进行测试了。此时，在代码中任何地方做修改，网页都会自动更新。

喜欢命令模式的也可以执行以下命令进行编译

```bash
npm run serve
```

注意，编译一般很快，也就三、四秒，如果编译很久都未结束或者报错，或者找不到网页，请确保你已经进行了前面的 **代码修改**（尤其是第三项修改），以及端口是否正确，当本地启用了多个管理页面或者修改了默认端口，则端口号可能和本文不同。



### 编译部署

和本地测试差不多，我们需要把前面因为测试所做的修改给全部还原，再点击 **任务** 页面下的 **build** 选项，最后点击 **运行** 进行编译。编译是可以设置 **参数** 的，使用 **现代模式** 虽然可以提升性能，但会大大增加编译后整个包的大小。虽然现代版本的对应的包会很少，但由于每次启动扩展时都需要进行判断并导入对应的包，这部分的耗时反而影响扩展的启动速度，因为该扩展大部分时间都是用完即走，所以性能的提升在这里反而无用武之地，因此我们一般不采用这种模式。

编译后会生成 `dist` 文件，这就是我们向应用市场提交的文件，不过在这之前我们有必要先进行一次真实的本地扩展使用测试，毕竟之前都是以 **Web** 的方式执行，这和以 **浏览器扩展** 方式执行有很大的不同，而且 `background` 和 `injected_script` 功能也只有在以  **浏览器扩展** 方式执行下才能被调用。

以 **浏览器扩展** 方式执行需要在 [chrome://extensions](chrome://extensions/) 页面下开启 **开发者模式**，然后选择加载 `dist` 文件，或者直接拖动  `dist` 文件到该网页下即可导入该扩展，最后点击浏览器搜索栏右侧的扩展图标就可以进行测试了。

可能你在前面修改`src/main.js`或`src/options.js`文件时会看到**区分平台**。没错，这个是为了区分部署 **Chrome** 和 **Edge** 浏览器，因为这两个平台的审核规范不同，所以代码会有少许的差异，其实主要是外链地址的不同。当然代码本身会有判断，我们需要做的仅是设置一个全局变量，这样程序才能判断出当前是哪个平台。我们只需要把全局变量修改为对应的平台名就行，这个代码中已有注释，就不演示如何修改了。

前面说过在以 **浏览器扩展** 方式执行时，浏览器扩展会自动根据本地语言导入对应的语言配置文件，如果想要切换语言以进行不同语言的测试，可以先在控制台下执行以下命令，再重启浏览器。（这里说的是 MAC 环境，Windows 可以网上搜搜，都是差不多的）

```bash
// 切换为中文
defaults write com.google.Chrome AppleLanguages '(zh-CN)'
// 切换为英文
defaults write com.google.Chrome AppleLanguages 'en'
// 后缀名可以通过打开 https://www.cocong.cn/savetabs/#/ja 网页，选择需要的语言获得，不同的语言会有不同的后缀，如这里 韩语 对应的就是 ja
```



