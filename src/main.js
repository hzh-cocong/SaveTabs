import Vue from 'vue'

import './plugins/svg-sprite.js'
import './plugins/element2.js'
import './plugins/animate.js'

//*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
//*/
import SaveTabs from './SaveTabs.vue'


// import enLocale from 'element-ui/lib/locale/lang/en'
// import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
// import locale from 'element-ui/lib/locale'
// // 设置语言
// locale.use(chrome.i18n.getMessage('@@ui_locale') == 'zh_CN' ? zhLocale : enLocale);


// import lang from 'element-ui/lib/locale/lang/en'
// import locale from 'element-ui/lib/locale'
// // 设置语言
// locale.use(lang)


// todo
Vue.config.productionTip = false

new Vue({
  render: h => h(SaveTabs),
}).$mount('#app')
