import Vue from 'vue'
import Options from './Options.vue'
import './plugins/element3.js'
/*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
//*/
import './plugins/svg-sprite.js'

import routes from './components/options/routes.config.js'

import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
  routes: routes
})

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
  router,
}).$mount('#app')
