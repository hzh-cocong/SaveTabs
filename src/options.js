import Vue from 'vue'

import './plugins/svg-sprite.js'
import './plugins/element3.js'
//*
import './plugins/tool-test.js'
/*/
import './plugins/tool.js'
//*/
import './plugins/svg-sprite.js'

import routes from './components/options/routes.config.js'

import VueRouter from 'vue-router'

import Options from './Options.vue'

Vue.use(VueRouter)

//todo
console.log('routes', routes)
const router = new VueRouter({
  routes: routes
})

Vue.config.productionTip = false

new Vue({
  render: h => h(Options),
  router,
}).$mount('#app')
