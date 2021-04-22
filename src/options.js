import Vue from 'vue'
import Options from './Options.vue'
import './plugins/element.js'
import './plugins/tool.js'

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
}).$mount('#app')
