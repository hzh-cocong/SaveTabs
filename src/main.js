import Vue from 'vue'
// import './plugins/fontawesome'
<link rel="stylesheet" href="https://cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.css"></link>
import './plugins/element.js'
import './plugins/tool.js'
import SaveTabs from './SaveTabs.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(SaveTabs),
}).$mount('#app')
