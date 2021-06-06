import Vue from 'vue'

// vue插件方式导入（运行速度慢）
// import './plugins/fontawesome'

// npm 导入（文件还是太大）
// import '@fortawesome/fontawesome-free/js/solid.min.js'
// import '@fortawesome/fontawesome-free/js/brands.min.js'
// import '@fortawesome/fontawesome-free/js/fontawesome.min.js'

import './plugins/svg-sprite.js'
import './plugins/element2.js'
///*
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
