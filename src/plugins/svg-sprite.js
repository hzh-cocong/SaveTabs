
import Vue from 'vue'

//引入svg组件
import SvgIcon from '@/components/common/SvgIcon.vue'

// // 一次性加载全部
// // https://webpack.js.org/guides/dependency-management/#context-module-api
// const requireAll = requireContext => requireContext.keys().map(requireContext)
// const req = require.context('@/assets/icons', false, /\.svg$/)
// requireAll(req)

// import "@/assets/icons/*.vue"

//全局注册icon-svg
Vue.component('SvgIcon', SvgIcon)
