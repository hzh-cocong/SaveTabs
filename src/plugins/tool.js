import Vue from 'vue'

const tool = {
  install(Vue) {
    // 注入组件选项
    Vue.mixin({
      methods: {
        lang: function(key) {
          return chrome.i18n.getMessage(key);
        },
        getIconSize: function(size) {
          if(size <= 16) return 16;
          if(size >= 256) return 256;

          return (2**Math.ceil(Math.log(size/16)/Math.log(2)))*16;
        },
        getIcon(icon, url, size) {
          // 网址空直接返回空
          if(url == '' || url == undefined) return '';

          size = this.getIconSize(size);

          // 图标为空或者是插件图标则返回缓存图标
          if(icon == '' || icon == undefined || icon.indexOf("chrome-extension://") > -1) {
            let res = url.match(/[a-zA-z-]+:\/\/[^/]+/);
            return res ? "chrome://favicon/size/"+size+"/"+res[0] : '';
          }

          // 不安全的网址直接返回空
          let res = url.match(/([a-zA-z-]+):\/\/[^/]+/);
          if(res == null) return '';

          // 不安全的网址直接返回空
          if( ! (res[1] == 'http' || res[1] == 'https')) {
            return  "chrome://favicon/size/"+size+"/"+res[0];
          }

          // 不安全的图标直接返回空
          let res2 = icon.match(/([a-zA-z-]+):\/\/[^/]+/);
          if(res2 == null) return '';

          // 不安全的网址直接返回空
          if( ! (res2[1] == 'http' || res2[1] == 'https')) {
            return '';
          }

          return icon;
        },
        getDomain(url) {
          let res = url.match(/[a-zA-z-]+:\/\/([^/]+)/);
          if(res != null) {
            return res[1];
          } else {
            return '';
          }
        },
        timeShow(timestamp) { // 毫秒时间戳
          let time = Math.floor((new Date().getTime()-timestamp)/1000);

          if(time < 0) {
            let date = new Date(timestamp);
            return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
          } else if(time == 0) {
            return this.lang('justNow');
          } else if(time < 60) {
            return time+this.lang('secondAgo');
          } else if(time < 3600) {
            return Math.floor(time/60)+this.lang('minuteAgo');
          } else if(time < 86400) {
            return Math.floor(time/3600)+this.lang('hourAgo');
          } else {
            let date = new Date(timestamp);
            return date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
          }
        },
        getUrlParam(name) {
          var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
          var r = window.location.search.substr(1).match(reg); // 匹配目标参数
          if (r != null) return decodeURI(r[2]);
          return null; // 返回参数值
        }
      }
    })

    // 添加实例方法
    Vue.prototype.$open = function (url) {
      // 注意 view 不支持，需要安装依赖
      // let tab = await new Promise((resolve) => {
      //   chrome.tabs.getCurrent((tab) => {
      //     resolve(tab);
      //   })
      // })
      // 注意 background 和 popup 没有结果
      // chrome.tabs.getCurrent((tab) => {
      //   console.log('tab', tab)
      //   chrome.tabs.create({
      //     url: url,
      //     openerTabId: tab.id,
      //     index: tab.index+1,
      //   });
      // })
      chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
        if(tabs.length == 1) {
          chrome.tabs.create({
            url: url,
            openerTabId: tabs[0].id,
            index: tabs[0].index+1,
          });
        } else {
          chrome.tabs.create({
            url: url
          });
        }
      })
    }
    Vue.prototype.$active = function (tabId) {
      chrome.tabs.update(tabId, {
        active: true
      });
    }
    Vue.prototype._device = (function() {
      let platform = '';
      let isPC = true;
      let u = navigator.userAgent;
      if(u.match(/Mobile/i)) {
        // 移动端
        if(u.indexOf('Android') > -1 || u.indexOf('Adr') > -1) {
          platform = 'Android';
        } else if(u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
          platform = 'IOS';
        }
        isPC = false;
      } else {
        // PC 端口
        if(u.indexOf("Windows",0) != -1) {
          platform = 'Win';
        } else if(u.indexOf("Mac",0) != -1) {
          platform = 'Mac';
        } else if(u.indexOf("Linux",0) != -1) {
          platform = 'Linux';
        } else if(u.indexOf("X11",0) != -1) {
          platform = 'Unix';
        }
        isPC = true;
      }
      return {
        platform: platform,
        isPC: isPC
      };
    })();

  }
}

Vue.use(tool)