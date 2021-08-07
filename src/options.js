import Vue from 'vue'

import './plugins/svg-sprite.js'
import './plugins/element3.js'

// 区分平台（未来要改为 npm 界面设置）
/*
window.$platform = Vue.prototype.$platform = 'chrome';
/*/
window.$platform = Vue.prototype.$platform = 'edge';
//*/

// 区分环境（未来要改为 npm 界面设置）
/*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
//*/

import './plugins/svg-sprite.js'
import './plugins/validate.js'

import routes from './components/options/routes.config.js'

import VueRouter from 'vue-router'

import Options from './Options.vue'

// import enLocale from 'element-ui/lib/locale/lang/en'
// import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
// import locale from 'element-ui/lib/locale'
// // 设置语言
// locale.use(chrome.i18n.getMessage('@@ui_locale') == 'zh_CN' ? zhLocale : enLocale);


Vue.use(VueRouter)

const router = new VueRouter({
  routes: routes,
  scrollBehavior (to, from, savedPosition) {
    // return 期望滚动到哪个的位置
    return { x: 0, y: 0, behavior: 'smooth', };
  }
})

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
  router,
}).$mount('#app')
