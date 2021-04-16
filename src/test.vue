<template>
  <div id="app">
    <button @click="changeList">{{ toggle ? '左边' : '右边' }}</button>
    <div class="search-input">
      <input
        type="text"
        class="el-input__inner"
        v-model="keyword"
        autofocus="autofocus"
        @keydown.down.prevent="selectDelay('down')"
        @keydown.up.prevent="selectDelay('up')"
        @keydown.left.prevent="goToLeft()"
        @keydown.right.prevent="goToRight()"
        @keydown.enter="openWindow"
        @input="search">
    </div>

    <el-carousel
      :autoplay="false"
      height="350px"
      indicator-position="none"
      arrow="never"
      ref="carousel"
      :loop="true">
      <el-carousel-item>
        <List
          :list="list1"
          :itemHeight="50"
          :itemShowCount="7"
          style="margin:5px;"
          v-model="currentIndex">
          <template #item="{ index, item, isActive, isSelected }" style="width:111px!important">
            <div
              style="border: 11px solid red;border-top: 0; border-bottom: 0;height:100%;"
              :style="{ color: isSelected ? 'red' : 'inherit',
                        backgroundColor: isActive ? 'green' : isSelected ? 'blue' : 'white'}">
              <!-- <el-avatar
                shape="square"
                :size="30"
                :src="item.tabs[0].icon"
                style="background:none">
                <img src="./assets/fallback.png" />
              </el-avatar> -->
              <!-- <el-image
                src="https://ssl.gstatic.com/translate/favicon3.ico"
                style="width: 30px; height: 30px"
                fit="contain"
                onload=""
                lazy>
                <div slot="error" class="image-slot">
                  <img src="./assets/fallback.png" style="width: 30px; height: 30px" />
                </div>
                <div slot="placeholder" class="image-slot">
                  加载中<span class="dot">...</span>
                </div>
              </el-image> -->
              <el-image
                :src="isLoad ? item.tabs[0].icon : ''"
                style="width: 30px; height: 30px"
                fit="contain"
                lazy>
                <div slot="error" class="image-slot">
                  <img src="./assets/fallback.png" style="width: 30px; height: 30px" />
                </div>
                <div slot="placeholder" class="image-slot">
                  <img src="./assets/fallback.png" style="width: 30px; height: 30px" />
                </div>
              </el-image>
            </div>
          </template>
        </List>
      </el-carousel-item>
      <el-carousel-item>
        <List
          :list="list2"
          :itemHeight="50"
          :itemShowCount="7"
          style="margin:5px;"
          v-model="currentIndex2">
          <template #item="{ index, item, isActive, isSelected }">
            <div
              style="border: 11px solid red;height:100%;"
              :style="{ color: isSelected ? 'red' : 'inherit',
                        backgroundColor: isActive ? 'green' : isSelected ? 'blue' : 'white'}">
              {{ '【'+index+'】'+item.name+' |（'+isActive+'）'+' |（'+isSelected+'）' }}
            </div>
          </template>
        </List>
      </el-carousel-item>
      <el-carousel-item>
        <List
          :list="list2"
          :itemHeight="50"
          :itemShowCount="7"
          style="margin:5px;"
          v-model="currentIndex2">
          <template #item="{ index, item, isActive, isSelected }">
            <div
              style="border: 11px solid red;height:100%;"
              :style="{ color: isSelected ? 'red' : 'inherit',
                        backgroundColor: isActive ? 'green' : isSelected ? 'blue' : 'white'}">
              {{ '【'+index+'】'+item.name+' |（'+isActive+'）'+' |（'+isSelected+'）' }}
            </div>
          </template>
        </List>
      </el-carousel-item>
    </el-carousel>

    <!-- <List
      :list="list2"
      :itemHeight="50"
      :itemShowCount="7"
      style="width:250px;margin:5px;display:inline-block;"
      v-model="currentIndex2">
      <template #item="{ index, item, isActive, isSelected }">
        <div
          style="border: 11px solid red;height:100%;"
          :style="{ color: isSelected ? 'red' : 'inherit',
                    backgroundColor: isActive ? 'green' : isSelected ? 'blue' : 'white'}">
          {{ '【'+index+'】'+item.name+' |（'+isActive+'）'+' |（'+isSelected+'）' }}
        </div>
      </template>
    </List> -->

  </div>
</template>

<script>
import List from './components/List.vue'

export default {
  name: 'app',
  data() {
    return {
      keyword: '',
      toggle: true,
      list: [],
      list1: [],
      list2: [],
      storageList: [],
      currentIndex: 1,
      currentIndex2: 1,
      show: true,
      isLoad: false,
    }
  },
  watch: {
    currentIndex: function (newVal, oldVal) {
      console.log('currentIndex', newVal, oldVal)
    }
  },
  components: {
    List
  },
  methods: {
    kk() {
      console.error('error:', arguments);
    },
    gg() {
      console.warn('load:', arguments);
    },
    changeList() {
      this.toggle = ! this.toggle;
    },
    selectDelay(type) {
      if(this.lock == false) return;
      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      this.lock = setTimeout(() => {
        type == 'down' ? this.selectDown() : this.selectUp();
        this.lock = true;
      }, 1);
      this.lock = false;
    },
    selectDown() {
      if(this.toggle) {
        this.currentIndex++;
      } else {
        this.currentIndex2++;
      }
    },
    goToLeft() {
      this.show = ! this.show;
      this.$refs.carousel.next();
    },
    goToRight() {
      this.show = ! this.show;
      this.$refs.carousel.prev();
    },
    selectUp() {
      if(this.toggle) {
        this.currentIndex--;
      } else {
        this.currentIndex2--;
      }
    },
    openWindow() {

    },
    search: function() {
      let filterList = this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        for(let keyword of this.keyword.trim().toUpperCase().split(/\s+/)) {
          if(name.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      this.list = filterList;
      if(this.toggle) {
        this.list1 = filterList;
      } else {
        this.list2 = filterList;
      }

      if(this.toggle) {
        this.currentIndex = 0;
      } else {
        this.currentIndex2 = 0;
      }
    },
  },
  mounted() {
    // todo
    window.vue = this;

    // 等页面加载完了再加载图片，否则插件弹出的速度回变慢
    document.body.onload=() => {
      console.info('onload')
      this.isLoad = true;
    };

    this.storageList = JSON.parse('[{"name":"Google 翻译","tabs":[{"icon":"https://ssl.gstatic.com/translate/favicon.ico","title":"Google 翻译","url":"https://translate.google.cn/?hl=zh"}]},{"name":"动漫","tabs":[{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《斗罗大陆》更新至149—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/4066.html"},{"icon":"https://www.kakadm.com/favicon.ico","title":"https://www.kakadm.com/anime/112/","url":"https://www.kakadm.com/anime/112/"},{"icon":"https://www.kakadm.com/favicon.ico","title":"https://www.kakadm.com/anime/319/","url":"https://www.kakadm.com/anime/319/"},{"icon":"https://www.kakadm.com/favicon.ico","title":"https://www.kakadm.com/anime/1065/","url":"https://www.kakadm.com/anime/1065/"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《绝世武魂》更新至48—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5097.html"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《万界法神》更新至30—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5116.html"},{"icon":"https://www.kakadm.com/favicon.ico","title":"拖动验证","url":"https://www.kakadm.com/anime/2842/"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《神武天尊》更新至52—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5095.html"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《我是大神仙》更新至21—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5100.html"},{"icon":"http://www.yhdm.io/js/20180601/favicon.ico","title":"《吞噬星空》更新至19—大陆—樱花动漫，视频高清在线观看","url":"http://www.yhdm.io/show/5107.html"}]},{"name":"SaveTabs 开发","tabs":[{"icon":"https://www.extfans.com/favicon.ico?v=3.1.4","title":"SaveTabs Chrome插件,SaveTabs 谷歌浏览器插件下载_安装_教程-扩展迷","url":"https://www.extfans.com/productivity/ikjiakenkeediiafhihmipcdafkkhdno/"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzh-cocong/Chrome-Workspace: A alfred workflow for the chrome extension of savetabs","url":"https://github.com/hzh-cocong/Chrome-Workspace"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzh-cocong/SaveTabs: Save brower tabs as a file so that you can open them again just like a workspace.","url":"https://github.com/hzh-cocong/SaveTabs"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome Web Store","url":"https://chrome.google.com/webstore/detail/ikjiakenkeediiafhihmipcdafkkhdno/preview?hl=en&authuser=0"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/ikjiakenkeediiafhihmipcdafkkhdno/preview?hl=zh_CN&authuser=0"},{"icon":"https://ssl.gstatic.com/chrome/webstore/images/icon_192px.png","title":"Developer Dashboard","url":"https://chrome.google.com/webstore/devconsole/eeb2f056-b74e-4d17-aa8e-69bddcb52409?hl=en"}]},{"name":"Creative Cloud Tutorials","tabs":[{"icon":"https://helpx.adobe.com/favicon.ico","title":"Creative Cloud tutorials | Learn how to use Creative Cloud","url":"https://helpx.adobe.com/cn/creative-cloud/tutorials-explore.html?guid=a7bc4d15-80a7-42b0-bd07-4d5e37725f27&product=Creative%20Cloud%20Desktop&product-version=5.4.1.534&mv=product&mv2=accc#"}]},{"name":"视频号","tabs":[{"icon":"https://res.wx.qq.com/t/wx_fed/finder/helper/finder-helper-web/res/favicon.ico","title":"视频号助手","url":"https://channels.weixin.qq.com/login"}]},{"name":"插件下载","tabs":[{"icon":"https://www.extfans.com/favicon.ico?v=3.1.4","title":"SaveTabs Chrome插件,SaveTabs 谷歌浏览器插件下载_安装_教程-扩展迷","url":"https://www.extfans.com/productivity/ikjiakenkeediiafhihmipcdafkkhdno/"},{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN"}]},{"name":"刷题1","tabs":[{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"8. 字符串转换整数 (atoi) - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/string-to-integer-atoi/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"12. 整数转罗马数字 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/integer-to-roman/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"17. 电话号码的字母组合 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/letter-combinations-of-a-phone-number/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"49. 字母异位词分组 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/group-anagrams/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"剑指 Offer 67. 把字符串转换成整数 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/ba-zi-fu-chuan-zhuan-huan-cheng-zheng-shu-lcof/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"10. 正则表达式匹配 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/regular-expression-matching/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"30. 串联所有单词的子串 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/substring-with-concatenation-of-all-words/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"65. 有效数字 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/valid-number/"},{"icon":"https://static.leetcode-cn.com/cn-mono-assets/production/assets/favicon-notification-32x32.3f045777.png","title":"68. 文本左右对齐 - 力扣（LeetCode）","url":"https://leetcode-cn.com/problems/text-justification/"}]},{"name":"漫画","tabs":[{"icon":"https://resource.feimh5.com/2feimanhua_pc/static/images/favicon.ico","title":"妖神记漫画320话_负重训练_妖神记漫画全集免费『爱飞漫画』","url":"https://www.feimh5.com/yaoshenji/di320hua2-1616893670002.html"}]},{"name":"SaveTabs","tabs":[{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"SaveTabs - Chrome 网上应用店","url":"https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN"}]},{"name":"Mac 应用下载","tabs":[{"icon":"https://macwk.com/favicon.ico","title":"MacWk - 精品mac软件下载","url":"https://macwk.com/"},{"icon":"http://www.sdifen.com/favicon.ico","title":"史蒂芬周的博客 | 软硬兼施，娱乐共享","url":"http://www.sdifen.com/"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzlzh/Best-App: 收集&推荐优秀的 Apps/硬件/技巧/周边等","url":"https://github.com/hzlzh/Best-App"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"jaywcjlove/awesome-mac:  Now we have become very big, Different from the original idea. Collect premium software in various categories.","url":"https://github.com/jaywcjlove/awesome-mac"},{"icon":"https://img.xclient.info/icon/favicon.ico","title":"精品MAC应用分享","url":"https://xclient.info/"},{"icon":"https://static.skyandroid.cn/images/favicon.ico","title":"马可菠萝 - 分享你喜欢的MAC应用","url":"https://www.macbl.com/"}]},{"name":"Chrome Web Store","tabs":[{"icon":"https://www.google.com/images/icons/product/chrome_web_store-32.png","title":"Chrome 网上应用店 - 扩展程序","url":"https://chrome.google.com/webstore/category/extensions?hl=zh-CN"}]},{"name":"前端","tabs":[{"icon":"https://cn.vuejs.org/images/icons/favicon-32x32.png","title":"介绍 — Vue.js","url":"https://cn.vuejs.org/v2/guide/"},{"icon":"https://cn.vuejs.org/images/icons/favicon-32x32.png","title":"API — Vue.js","url":"https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80%E9%85%8D%E7%BD%AE"},{"icon":"https://cli.vuejs.org/favicon.png","title":"HTML 和静态资源 | Vue CLI","url":"https://cli.vuejs.org/zh/guide/html-and-static-assets.html#%E4%B8%8D%E7%94%9F%E6%88%90-index"},{"icon":"chrome://favicon/size/16@2x/https://vue-loader.vuejs.org","title":"介绍 | Vue Loader","url":"https://vue-loader.vuejs.org/zh/"},{"icon":"https://element.eleme.cn/favicon.ico","title":"组件 | Element","url":"https://element.eleme.cn/#/zh-CN/component/installation"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"element/components.json at master · ElemeFE/element","url":"https://github.com/ElemeFE/element/blob/master/components.json"},{"icon":"https://cdn.jsdelivr.net/npm/@bootcss/www.bootcss.com@0.0.43/dist/ico/favicon.ico","title":"Bootstrap中文网","url":"https://www.bootcss.com/"},{"icon":"https://www.bootcdn.cn/assets/ico/favicon.ico?1616075110550","title":"BootCDN - Bootstrap 中文网开源项目免费 CDN 加速服务","url":"https://www.bootcdn.cn/"},{"icon":"https://www.webpackjs.com/assets/favicon.ico","title":"概念 | webpack 中文网","url":"https://www.webpackjs.com/concepts/"},{"icon":"https://cn.eslint.org/img/favicon.512x512.png","title":"ESLint - Pluggable JavaScript linter - ESLint中文","url":"https://cn.eslint.org/"},{"icon":"https://es6.ruanyifeng.com/favicon.ico","title":"Iterator 和 for...of 循环 - ECMAScript 6入门","url":"https://es6.ruanyifeng.com/?search=%E7%AE%AD%E5%A4%B4&x=0&y=0#docs/iterator"},{"icon":"https://www.babeljs.cn/img/favicon.png","title":"Babel 中文网 · Babel - 下一代 JavaScript 语法的编译器","url":"https://www.babeljs.cn/"}]},{"name":"扩展程序（Extensions）","tabs":[{"icon":"chrome://favicon/size/16@2x/chrome://extensions","title":"扩展程序","url":"chrome://extensions/"},{"icon":"chrome://favicon/size/16@2x/chrome://extensions","title":"扩展程序","url":"chrome://extensions/shortcuts"}]},{"name":"CSS","tabs":[{"icon":"chrome://favicon/size/16@2x/https://www.bootcss.com","title":"Web安全色","url":"https://www.bootcss.com/p/websafecolors/"},{"icon":"http://www.ruanyifeng.com/favicon.ico","title":"Flex 布局教程：语法篇 - 阮一峰的网络日志","url":"http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html"},{"icon":"https://www.ruanyifeng.com/favicon.ico","title":"Flex 布局教程：实例篇 - 阮一峰的网络日志","url":"https://www.ruanyifeng.com/blog/2015/07/flex-examples.html"},{"icon":"https://cpwebassets.codepen.io/assets/favicon/favicon-aec34940fbc1a6e787974dcd360f2c6b63348d4b1f4e06c77743096d55480f33.ico","title":"Flexbox Dice","url":"https://codepen.io/LandonSchropp/pen/KpzzGo"}]},{"name":"OneTab","tabs":[{"icon":"chrome://favicon/size/16@2x/chrome-extension://chphlpgkkbolifaimnlloiipkdnihall","title":"OneTab","url":"chrome-extension://chphlpgkkbolifaimnlloiipkdnihall/onetab.html"}]},{"name":"头条","tabs":[{"icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png","title":"头条号","url":"https://mp.toutiao.com/profile_v4/index"},{"icon":"https://sf1-ttcdn-tos.pstatp.com/obj/ttfe/pgcfe/sz/mp_logo.png","title":"头条号","url":"https://mp.toutiao.com/profile_v4/manage/content/all"}]},{"name":"美剧","tabs":[{"icon":"http://www.yyetss.com/favicon.ico","title":"YYeTss.com人人影视_人人美剧迅雷下载_人人影视","url":"http://www.yyetss.com/"},{"icon":"https://www.gttmj.com/templets/gttmj/images/favicon.ico","title":"《迷失第五季》全集在线播放-天天美剧","url":"https://www.gttmj.com/play/2173-0-10.html"},{"icon":"https://91mjw.com/favicon.ico","title":"91美剧网 | 在线美剧天堂,最新美剧资源,高清美剧在线观看","url":"https://91mjw.com/"}]},{"name":"博客","tabs":[{"icon":"https://cdn2.jianshu.io/assets/favicons/favicon-e743bfb1821442341c3ab15bdbe804f7ad97676bd07a770ccc9483473aa76f06.ico","title":"聪聪_只为兴趣 - 简书","url":"https://www.jianshu.com/u/80d9a75d3645"},{"icon":"https://static.zhihu.com/heifetz/favicon.ico","title":"- 搜索结果 - 知乎","url":"https://www.zhihu.com/search?type=content&q="},{"icon":"https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico","title":"微信公众平台","url":"https://mp.weixin.qq.com/"},{"icon":"http://www.cocong.cn/favicon.ico","title":"聪聪，只为兴趣","url":"http://www.cocong.cn/"},{"icon":"https://github.githubassets.com/favicons/favicon.svg","title":"hzh-cocong","url":"https://github.com/hzh-cocong"},{"icon":"https://pixabay.com/favicon-32x32.png","title":"Clock Alarm Watch - Free photo on Pixabay","url":"https://pixabay.com/photos/clock-alarm-clock-watch-time-old-1274699/"}]},{"name":"Chrome 插件教程","tabs":[{"icon":"http://haoji.me/favicon.png","title":"【干货】Chrome插件(扩展)开发全攻略-好记的博客","url":"http://blog.haoji.me/chrome-plugin-develop.html#bu-zhi-chi-na-lian-JavaScript-de-zhi-xing"},{"icon":"https://common.cnblogs.com/favicon.svg","title":"我的随笔 - Chrome扩展开发极客 - 博客园","url":"https://www.cnblogs.com/champagne/p/"},{"icon":"https://developer.chrome.com/images/meta/favicon-32x32.png","title":"API Reference - Chrome Developers","url":"https://developer.chrome.com/docs/extensions/reference/"},{"icon":"https://www.google.com/images/icons/product/chrome-32.png","title":"JavaScript API - Google Chrome 扩展程序开发文档（非官方中文版）","url":"https://crxdoc-zh.appspot.com/extensions/api_index"},{"icon":"https://ssl.gstatic.com/chrome/webstore/images/icon_192px.png","title":"Developer Dashboard","url":"https://chrome.google.com/webstore/devconsole/eeb2f056-b74e-4d17-aa8e-69bddcb52409?hl=en"}]}]');

    this.list1 = this.list2 = this.storageList;//.splice(0, 1);
    this.list1 =  this.storageList;//.splice(0, 1);
    console.log(this.storageList);
    console.log(this.list);
  }
}
</script>

<style>
#app {
  border: 1px solid blue;
  width: 500px;
  /*height: 350px;
  overflow: hidden; */
}
</style>
