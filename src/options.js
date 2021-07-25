import Vue from 'vue'

import './plugins/svg-sprite.js'
import './plugins/element3.js'

//*
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
  routes: routes
})

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
  router,
}).$mount('#app')
