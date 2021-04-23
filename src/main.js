import Vue from 'vue'

// vue插件方式导入（运行速度慢）
// import './plugins/fontawesome'

// npm 导入（文件还是太大）
// import '@fortawesome/fontawesome-free/js/solid.min.js'
// import '@fortawesome/fontawesome-free/js/brands.min.js'
// import '@fortawesome/fontawesome-free/js/fontawesome.min.js'

import './plugins/element.js'
import './plugins/tool.js'
import SaveTabs from './SaveTabs.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(SaveTabs),
}).$mount('#app')
