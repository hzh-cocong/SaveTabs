import Vue from 'vue'
import SaveTabs from './SaveTabs.vue'
import './plugins/element.js'
import './plugins/tool.js'

Vue.config.productionTip = false

new Vue({
  render: h => h(SaveTabs),
}).$mount('#app')