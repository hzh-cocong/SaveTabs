import Vue from 'vue'

// import Lang from '../../public/_locales/en/messages.json'
import Lang from '../../public/_locales/zh_CN/messages.json'

let list88 = JSON.parse('[{"name":"Google 翻译33","tabs":[{"icon":"https://ssl.gstatic.com/translate/favicon.ico","title":"Google 翻译","url":"https://translate.google.cn/?hl=zh"}]},{"name":"动漫","tabs":[{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《斗罗大陆》更新至149—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/4066.html"},{"icon":"https://www.kakadm.com/favicon.ico","title":"https://www.kakadm.com/anime/112/","url":"https://www.kakadm.com/anime/112/"},{"icon":"https://www.kakadm.com/favicon.ico","title":"https://www.kakadm.com/anime/319/","url":"https://www.kakadm.com/anime/319/"},{"icon":"https://www.kakadm.com/favicon.ico","title":"https://www.kakadm.com/anime/1065/","url":"https://www.kakadm.com/anime/1065/"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《绝世武魂》更新至48—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5097.html"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《万界法神》更新至30—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5116.html"},{"icon":"https://www.kakadm.com/favicon.ico","title":"拖动验证","url":"https://www.kakadm.com/anime/2842/"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《神武天尊》更新至52—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5095.html"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《我是大神仙》更新至21—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5100.html"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《吞噬星空》更新至19—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5107.html"}]},{"name":"SaveTabs 开发上的浪付款就都说了教师登录开发就塑料袋口附近谁离开的缴费临时卡积分蓝思科技克隆空间","tabs":[{"icon":"https://www.extfans.com/favicon.ico?v=3.1.4","title":"SaveTabs Chrome插件,SaveTabs 谷歌浏览器插件下载_安装_教程-扩展迷","url":"https://www.extfans.com/productivity/ikjiakenkeediiafhihmipcdafkkhdno/"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzh-cocong/Chrome-Workspace: A alfred workflow for the chrome extension of savetabs","url":"https://github.com/hzh-cocong/Chrome-Workspace"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzh-cocong/SaveTabs: Save brower tabs as a file so that you can open them again just like a workspace.","url":"https://github.com/hzh-cocong/SaveTabs"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome Web Store","url":"https://chrome.google.com/webstore/detail/ikjiakenkeediiafhihmipcdafkkhdno/preview?hl=en&authuser=0"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/ikjiakenkeediiafhihmipcdafkkhdno/preview?hl=zh_CN&authuser=0"},{"icon":"https://ssl.gstatic.com/chrome/webstore/images/icon_192px.png","title":"Developer Dashboard","url":"https://chrome.google.com/webstore/devconsole/eeb2f056-b74e-4d17-aa8e-69bddcb52409?hl=en"}]},{"name":"Creative Cloud Tutorials","tabs":[{"icon":"https://helpx.adobe.com/favicon.ico","title":"Creative Cloud tutorials | Learn how to use Creative Cloud","url":"https://helpx.adobwsdfse.cowwm/cn/creative-cloud/tutorials-explore.html?guid=a7bc4d15-80a7-42b0-bd07-4d5e37725f27&product=Creative%20Cloud%20Desktop&product-version=5.4.1.534&mv=product&mv2=accc#"}]},{"name":"视频号","tabs":[{"icon":"https://res.wx.qq.com/t/wx_fed/finder/helper/finder-helper-web/res/favicon.ico","title":"视频号助手","url":"chrome://favicon/size/16@2x/"}]},{"name":"插件下载","tabs":[{"icon":"https://www.extfans.com/favicon.ico?v=3.1.4","title":"SaveTabs Chrome插件,SaveTabs 谷歌浏览器插件下载_安装_教程-扩展迷","url":"https://www.extfans.com/productivity/ikjiakenkeediiafhihmipcdafkkhdno/"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN"}]},{"name":"刷题1","tabs":[{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"8. 字符串转换整数 (atoi) - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/string-to-integer-atoi/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"12. 整数转罗马数字 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/integer-to-roman/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"17. 电话号码的字母组合 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"49. 字母异位词分组 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/group-anagrams/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"剑指 Offer 67. 把字符串转换成整数 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/ba-zi-fu-chuan-zhuan-huan-cheng-zheng-shu-lcof/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"10. 正则表达式匹配 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/regular-expression-matching/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"30. 串联所有单词的子串 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/substring-with-concatenation-of-all-words/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"65. 有效数字 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/valid-number/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"68. 文本左右对齐 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/text-justification/"}]},{"name":"漫画","tabs":[{"icon":"https://resource.feimh5.com/2feimanhua_pc/static/images/favicon.ico","title":"妖神记漫画320话_负重训练_妖神记漫画全集免费『爱飞漫画』","url":"https://www.feimh5.com/yaoshenji/di320hua2-1616893670002.html"}]},{"name":"SaveTabs","tabs":[{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN"}]},{"name":"Mac 应用下载","tabs":[{"icon":"https://macwk.com/favicon.ico","title":"MacWk - 精品mac软件下载","url":"https://macwk.com/"},{"icon":"http://www.sdifen.com/favicon.ico","title":"史蒂芬周的博客 | 软硬兼施，娱乐共享","url":"http://www.sdifen.com/"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzlzh/Best-App: 收集&推荐优秀的 Apps/硬件/技巧/周边等","url":"https://github.com/hzlzh/Best-App"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"jaywcjlove/awesome-mac:  Now we have become very big, Different from the original idea. Collect premium software in various categories.","url":"https://github.com/jaywcjlove/awesome-mac"},{"icon":"https://img.xclient.info/icon/favicon.ico","title":"精品MAC应用分享","url":"https://xclient.info/"},{"icon":"https://static.skyandroid.cn/images/favicon.ico","title":"马可菠萝 - 分享你喜欢的MAC应用","url":"https://www.macbl.com/"}]},{"name":"Chrome Web Store","tabs":[{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"Chrome 网上应用店 - 扩展程序","url":"https://chrome.google.com/webstore/category/extensions?hl=zh-CN"}]},{"name":"前端","tabs":[{"icon":"https://cn.vuejs.org/images/icons/favicon-32x32.png","title":"介绍 — Vue.js","url":"https://cn.vuejs.org/v2/guide/"},{"icon":"https://cn.vuejs.org/images/icons/favicon-32x32.png","title":"API — Vue.js","url":"https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE"},{"icon":"https://cli.vuejs.org/favicon.png","title":"HTML 和静态资源 | Vue CLI","url":"https://cli.vuejs.org/zh/guide/html-and-static-assets.html#%E4%B8%8D%E7%94%9F%E6%88%90-index"},{"icon":"chrome://favicon/size/16@2x/https://vue-loader.vuejs.org","title":"介绍 | Vue Loader","url":"https://vue-loader.vuejs.org/zh/"},{"icon":"https://element.eleme.cn/favicon.ico","title":"组件 | Element","url":"https://element.eleme.cn/#/zh-CN/component/installation"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"element/components.json at master · ElemeFE/element","url":"https://github.com/ElemeFE/element/blob/master/components.json"},{"icon":"https://cdn.jsdelivr.net/npm/@bootcss/www.bootcss.com@0.0.43/dist/ico/favicon.ico","title":"Bootstrap中文网","url":"https://www.bootcss.com/"},{"icon":"https://www.bootcdn.cn/assets/ico/favicon.ico?1616075110550","title":"BootCDN - Bootstrap 中文网开源项目免费 CDN 加速服务","url":"https://www.bootcdn.cn/"},{"icon":"https://www.webpackjs.com/assets/favicon.ico","title":"概念 | webpack 中文网","url":"https://www.webpackjs.com/concepts/"},{"icon":"https://cn.eslint.org/img/favicon.512x512.png","title":"ESLint - Pluggable JavaScript linter - ESLint中文","url":"https://cn.eslint.org/"},{"icon":"https://es6.ruanyifeng.com/favicon.ico","title":"Iterator 和 for...of 循环 - ECMAScript 6入门","url":"https://es6.ruanyifeng.com/?search=%E7%AE%AD%E5%A4%B4&x=0&y=0#docs/iterator"},{"icon":"https://www.babeljs.cn/img/favicon.png","title":"Babel 中文网 · Babel - 下一代 JavaScript 语法的编译器","url":"https://www.babeljs.cn/"}]},{"name":"扩展程序（Extensions）","tabs":[{"icon":"chrome://favicon/size/16@2x/chrome://extensions","title":"扩展程序","url":"chrome://extensions/"},{"icon":"chrome://favicon/size/16@2x/chrome://extensions","title":"扩展程序","url":"chrome://extensions/shortcuts"}]},{"name":"CSS","tabs":[{"icon":"chrome://favicon/size/16@2x/https://www.bootcss.com","title":"Web安全色","url":"https://www.bootcss.com/p/websafecolors/"},{"icon":"http://www.ruanyifeng.com/favicon.ico","title":"Flex 布局教程：语法篇 - 阮一峰的网络日志","url":"http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html"},{"icon":"https://www.ruanyifeng.com/favicon.ico","title":"Flex 布局教程：实例篇 - 阮一峰的网络日志","url":"https://www.ruanyifeng.com/blog/2015/07/flex-examples.html"},{"icon":"https://cpwebassets.codepen.io/assets/favicon/favicon-aec34940fbc1a6e787974dcd360f2c6b63348d4b1f4e06c77743096d55480f33.ico","title":"Flexbox Dice","url":"https://codepen.io/LandonSchropp/pen/KpzzGo"}]},{"name":"OneTab","tabs":[{"icon":"chrome://favicon/size/16@2x/chrome-extension://chphlpgkkbolifaimnlloiipkdnihall","title":"OneTab","url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html"}]},{"name":"头条","tabs":[{"icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png","title":"头条号","url":"https://mp.toutiao.com/profile_v4/index"},{"icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png","title":"头条号","url":"https://mp.toutiao.com/profile_v4/manage/content/all"}]},{"name":"美剧","tabs":[{"icon":"http://www.yyetss.com/favicon.ico","title":"YYeTss.com人人影视_人人美剧迅雷下载_人人影视","url":"http://www.yyetss.com/"},{"icon":"https://www.gttmj.com/templets/gttmj/images/favicon.ico","title":"《迷失第五季》全集在线播放-天天美剧","url":"https://www.gttmj.com/play/2173-0-10.html"},{"icon":"https://91mjw.com/favicon.ico","title":"91美剧网 | 在线美剧天堂,最新美剧资源,高清美剧在线观看","url":"https://91mjw.com/"}]},{"name":"博客","tabs":[{"icon":"https://cdn2.jianshu.io/assets/favicons/favicon-e743bfb1821442341c3ab15bdbe804f7ad97676bd07a770ccc9483473aa76f06.ico","title":"聪聪_只为兴趣 - 简书","url":"https://www.jianshu.com/u/80d9a75d3645"},{"icon":"https://static.zhihu.com/heifetz/favicon.ico","title":"- 搜索结果 - 知乎","url":"https://www.zhihu.com/search?type=content&q="},{"icon":"https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico","title":"微信公众平台","url":"https://mp.weixin.qq.com/"},{"icon":"http://www.cocong.cn/favicon.ico","title":"聪聪，只为兴趣","url":"http://www.cocong.cn/"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzh-cocong","url":"https://github.com/hzh-cocong"},{"icon":"https://pixabay.com/favicon-32x32.png","title":"Clock Alarm Watch - Free photo on Pixabay","url":"https://pixabay.com/photos/clock-alarm-clock-watch-time-old-1274699/"}]},{"name":"Chrome 插件教程","tabs":[{"icon":"http://haoji.me/favicon.png","title":"【干货】Chrome插件(扩展)开发全攻略-好记的博客","url":"http://blog.haoji.me/chrome-plugin-develop.html#bu-zhi-chi-na-lian-JavaScript-de-zhi-xing"},{"icon":"https://common.cnblogs.com/favicon.svg","title":"我的随笔 - Chrome扩展开发极客 - 博客园","url":"https://www.cnblogs.com/champagne/p/"},{"icon":"https://developer.chrome.com/images/meta/favicon-32x32.png","title":"API Reference - Chrome Developers","url":"https://developer.chrome.com/docs/extensions/reference/"},{"icon":"https://www.google.com/images/icons/product/chrome-32.png","title":"JavaScript API - Google Chrome 扩展程序开发文档（非官方中文版）","url":"https://crxdoc-zh.appspot.com/extensions/api_index"},{"icon":"https://ssl.gstatic.com/chrome/webstore/images/icon_192px.png","title":"Developer Dashboard","url":"https://chrome.google.com/webstore/devconsole/eeb2f056-b74e-4d17-aa8e-69bddcb52409?hl=en"}]}]');

let test = '[{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"","groupId":-1,"height":609,"highlighted":false,"id":1342,"incognito":false,"index":0,"mutedInfo":{"muted":false},"pinned":true,"selected":false,"status":"complete","title":"Window Manager","url":"chrome-extension://aadahadfdmiibmdhfmpbeeebejmjnkef/manager.html","width":567,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"http://localhost:8000/favicon.ico","groupId":-1,"height":609,"highlighted":false,"id":1414,"incognito":false,"index":1,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"[Beta] build - 任务 - Vue CLI","url":"http://localhost:8000/tasks/%2FUsers%2Fhzh%2F%E6%96%87%E4%BB%B6%2F%E5%A4%A7%E6%96%87%E4%BB%B6%2FExperience%2FWWW%2Fhtml%2FChrome%2Fsave_tabs2:build","width":1152,"windowId":1064},{"active":true,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"chrome-extension://hcdhcpnadajoaeigigfdlggelpmnhkkh/favicon.ico","groupId":-1,"height":609,"highlighted":true,"id":1441,"incognito":false,"index":2,"mutedInfo":{"muted":false},"pinned":false,"selected":true,"status":"complete","title":"SaveTabs","url":"chrome-extension://hcdhcpnadajoaeigigfdlggelpmnhkkh/savetabs.html","width":480,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"http://localhost:8080/favicon.ico","groupId":-1,"height":609,"highlighted":false,"id":1416,"incognito":false,"index":3,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"SaveTabs","url":"http://localhost:8080/savetabs.html","width":480,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"chrome-extension://ikjiakenkeediiafhihmipcdafkkhdno/favicon.ico","groupId":-1,"height":609,"highlighted":false,"id":1417,"incognito":false,"index":4,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"SaveTabs","url":"chrome-extension://ikjiakenkeediiafhihmipcdafkkhdno/popup.html","width":480,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"groupId":-1,"height":609,"highlighted":false,"id":1418,"incognito":false,"index":5,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"www.extfans.com (32×32)","url":"chrome://favicon/size/16@2x/https://www.extfans.com","width":1152,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"","groupId":-1,"height":609,"highlighted":false,"id":1419,"incognito":false,"index":6,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"设置","url":"chrome://settings/","width":1152,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"","groupId":-1,"height":609,"highlighted":false,"id":1420,"incognito":false,"index":7,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"历史记录","url":"chrome://history/","width":1152,"windowId":1064},{"active":false,"audible":false,"autoDiscardable":true,"discarded":false,"favIconUrl":"chrome-extension://ikjiakenkeediiafhihmipcdafkkhdno/favicon.ico","groupId":-1,"height":609,"highlighted":false,"id":1492,"incognito":false,"index":8,"mutedInfo":{"muted":false},"pinned":false,"selected":false,"status":"complete","title":"SaveTabs","url":"chrome-extension://ikjiakenkeediiafhihmipcdafkkhdno/options.html","width":1152,"windowId":1064}]';

list88 = list88.map((item) => {
  if(item.name=='OneTab') {
    item.windowId=33;
  } else if(item.name=='头条' || item.name=="视频号" || item.name=="扩展程序（Extensions）") {
    item.windowId=34;
  }
  return item;
})
// console.warn('lllllllllllll', list)
list88 = list88.filter((item) => {
  return true || item.name=='动漫' || item.name=='头条' || item.name=='OneTab';
})
console.error('list88', list88)

const tool = {
  install(Vue) {
    // 注入组件选项
    Vue.mixin({
      methods: {
        lang: function(key) {
          return Lang[key].message;

          //return chrome.i18n.getMessage(key);
        },
        getIconSize: function(size) {
          if(size <= 16) return 16;
          if(size >= 256) return 256;

          return (2**Math.ceil(Math.log(size/16)/Math.log(2)))*16;
        },
        getIcon(url, size) {
          size = this.getIconSize(size);
          let res = url.match(/([a-zA-z-]+):\/\/[^/]+/);
          let icon = '';
          if(res != null) {
            if(res[1] == 'http' || res[1] == 'https') {
              icon = "https://s2.googleusercontent.com/s2/favicons?sz="+size+"&domain="+res[0];
            } else {
              icon = "chrome://favicon/size/"+(size/2)+"@2x/"+res[0];
            }
          }
          return icon;
        },
      },
      // 方便测试
      //*
      mounted: function() {
        // console.warn('start')
        // console.log(this);

        chrome.storage = {
          sync: {
            get: function() {
              console.log('chrome.storage.local.get', arguments);
            }
          },
          local: {
            get: function(options, callback) {
              console.log('chrome.storage.sync.get', arguments);
              console.log('options', options)
              console.log('list', list88)
              callback({list: list88, fffff: 'kkkkkkkkkkkkkki', fff2: list88});
            },
            set: function(options, callback) {
              console.log('chrome.storage.sync.set', arguments);
              console.log('options', options)
              callback();
            },
          }
        }
        chrome.windows = {
          getCurrent: function(options, callback) {
            console.log('chrome.windows.getCurrent', arguments);
            console.log('options', options)
            callback({
              id: 33,
              tabs: [],
            });
          },
          getAll: function(options, callback) {
            console.log('chrome.windows.getAll', arguments);
            console.log('options', options)
            callback([{
              id: 33
            },{
              id: 34
            }]);
          },
        }
        chrome.tabs = {
          query: function(options, callback) {
            console.log('chrome.tabs.query', arguments);
            console.log('options', options)
            callback(JSON.parse(test));
          }
        }
      }//*/
    })

    // 添加实例方法
    Vue.prototype.$open = function (url) {
        chrome.tabs.create({
            url: url
        });
    }

  }
}

Vue.use(tool)