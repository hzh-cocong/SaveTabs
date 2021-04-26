import Vue from 'vue'
import Options from './Options.vue'
import './plugins/element3.js'
import './plugins/tool.js'
import './plugins/svg-sprite.js'

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
}).$mount('#app')
