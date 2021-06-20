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
          // console.warn('getIcon', icon, url ,size);
          // console.warn('getIcon')
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
        },
        highlight(content, keywords, leftTag, rightTag) {
          if(keywords == '') {
            return content.escape();
          }

          keywords = keywords.split(/\s+/);

          // 查找所有位置
          let pos = [];
          let str = content.toUpperCase();
          for(let keyword of keywords) {
            keyword = keyword.toUpperCase();
            if(keyword == '') continue;

            let index = 0;
            do {
              index = str.indexOf(keyword, index);
              if(index == -1) break;
              pos.push([index, index+keyword.length-1]);
              index = index+keyword.length;
            }while(index != -1);
          }

          // 无任何匹配
          if(pos.length <= 0) {
            return content.escape();
          }

          // 合并重复区间
          if(pos.length > 1) {
            // alert('s')
            pos = pos.sort(function(a, b){return a[0] - b[0]});
            let merge = [];
            for(let i = 0, k = 0; i < pos.length; i++) {
              if(i == 0 || merge[k-1][1] < pos[i][0]) {
                merge.push(pos[i]);
                k++;
              } else {
                merge[k-1][1] = Math.max(merge[k-1][1], pos[i][1]);
              }
            }
            pos = merge;
          }

          // 字符替换（高亮）
          let res = '';
          for(let i in pos) {
            if(i == 0) {
              res += content.substring(0, pos[i][0]).escape()
                  + leftTag+content.substring(pos[i][0], pos[i][1]+1).escape()+rightTag;
            } else {
              res += content.substring(pos[i-1][1]+1, pos[i][0]).escape()
                  + leftTag+content.substring(pos[i][0], pos[i][1]+1).escape()+rightTag;
            }
          }
          res += content.substring(pos[pos.length-1][1]+1, content.length).escape();

          return res;
        },
        getKeyType(event) {
          if(this._device.platform == 'Mac') {
            if(event.ctrlKey == true) {
              return 'ctrl';
            } else if(event.metaKey == true) {
              return 'meta/ctrl';
            } else if(event.shiftKey == true) {
              return 'shift';
            } else if(event.altKey == true) {
              return 'alt';
            }
          } else {
            if(event.metaKey == true) {
              return 'meta';
            } else if(event.ctrlKey == true) {
              return 'meta/ctrl'
            } else if(event.shiftKey == true) {
              return 'shift';
            } else if(event.altKey == true) {
              return 'alt';
            }
          }
          return '';
        },
      }
    })

    // 添加实例方法
    window.$open = Vue.prototype.$open = function (url, keyType, callback) {
      if(keyType == 'meta/ctrl') {
        // 下个位置打开，但不激活
        chrome.tabs.query({ active:true, currentWindow: true }, (tabs) => {
          if(tabs.length == 1) {
            chrome.tabs.create({url: url, openerTabId: tabs[0].id, index: tabs[0].index+1, active: false }, (tab) => {
              callback != undefined && callback(tab, 'tab');
            });
          } else {
            // 理论上不可能发生
            chrome.tabs.create({ url: url, active: false }, (tab) => {
              callback != undefined && callback(tab, 'tab');
            });
          }
        })
      } else if(keyType == 'shift') {
        // 新窗口打开
        chrome.windows.create({ url: [ url ], focused: true, type: 'normal' }, (window) => {
          callback != undefined && callback(window.tabs[0], 'window');
        });
      } else if(keyType == 'alt') {
        // 覆盖当前窗口
        chrome.tabs.query({ active:true, currentWindow: true }, (tabs) => {
          if(tabs.length == 1) {
            chrome.tabs.update(tabs[0].id, { url: url }, (tab) => {
              // tab 并没有更新 url，我们来修复它，title其实也不对，不过并没有用到它，这里也无法修复
              tab.url = url;
              callback != undefined && callback(tab, 'cover');
            });
          } else {
            // 理论上不可能发生
            chrome.tabs.create({ url: url }, (tab) => {
              callback != undefined && callback(tab, 'tab');
            });
          }
        })
      } else {
        // 下个位置打开（默认方式）
        chrome.tabs.query({ active:true, currentWindow: true }, (tabs) => {
          if(tabs.length == 1) {
            chrome.tabs.create({url: url, openerTabId: tabs[0].id, index: tabs[0].index+1 }, (tab) => {
              callback != undefined && callback(tab, 'tab');
            });
          } else {
            // 理论上不可能发生
            chrome.tabs.create({ url: url }, (tab) => {
              callback != undefined && callback(tab, 'tab');
            });
          }
        })
      }
    }
    window.$active = Vue.prototype.$active = function (tabId) {
      chrome.tabs.update(tabId, {
        active: true
      });
    }
    window._device = Vue.prototype._device = (function() {
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

    // 防止 xss 攻击
    String.prototype.escape = function() {
      var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&apos;',
        '"': '&quot;',
      };
      return this.replace(/[&<>'"]/g, function(tag) {
          return tagsToReplace[tag] || tag;
      });
    };

  }
}

Vue.use(tool)