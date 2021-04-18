import Vue from 'vue'

const tool = {
  install(Vue) {
    // 注入组件选项
    // Vue.mixin({
    //   methods: {
    //     open(url) {
    //         chrome.tabs.create({
    //             url: url
    //         });
    //     }
    //   }
    // })

    // 添加实例方法
    Vue.prototype.$open = function (url) {
        chrome.tabs.create({
            url: url
        });
    }
  }
}

Vue.use(tool)