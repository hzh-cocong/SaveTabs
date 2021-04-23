import Vue from 'vue'
import './plugins/fontawesome'
import './plugins/element.js'
import './plugins/tool.js'
import SaveTabs from './SaveTabs.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(SaveTabs),
}).$mount('#app')
