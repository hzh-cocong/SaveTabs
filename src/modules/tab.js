let tab = {
  cacheList: [],
  focusList: [],

  activeTab: null,

  isInit: false,

  init: function() {
    return Promise.all([
      new Promise((resolve) => {
        // 获取标签顺序
        chrome.runtime.sendMessage({
            type: 'getActiveTabs'
        }, (tabIds) => {
          resolve(tabIds);
        })
      }),
      new Promise(resolve => {
        // 获取所有标签
        chrome.tabs.query({}, (tabs)=>{
          let t = tabs.map((tab) => {
            // 去除末尾 /
            tab.url = tab.url.replace(/(\/*$)/g,"");
            return tab;
          });
          resolve(t);
        })
      }),
      new Promise(resolve => {
        // 获取当前标签
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          this.activeTab = tabs[0];
          resolve()
        })
      })
    ]).then(([tabIds, tabs]) => {
      // 建立索引，方便快速获取 tab 位置
      let map = new Map();
      tabIds.forEach((tabId, index) => {
        map.set(tabId, index)
      })

      // 当前窗口排最前面
      map.set(this.activeTab.id, map.size);
      // 按标签顺序排序，没有记录的排最后
      this.originList = tabs.sort((tab1, tab2) => {
        let index1 = map.get(tab1.id);
        let index2 = map.get(tab2.id);

        if(index1 == undefined && index2 == undefined) return 0;
        if(index1 == undefined) return 1;
        if(index2 == undefined) return -1;

        return index2 - index1;
      })

      // 加标签（速度很快）(存在污染问题)
      this.originList.forEach(tab => {
        tab.isCurrent = tab.id == this.activeTab.id
        tab.type = 'tab';
      });

      this.focusList = this.originList;

      this.isInit = true;
    })
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      // 查找
      let filterList = keywords.length == 0 ? this.focusList : this.focusList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1 ;
        });
      })

      // 列表赋值
      this.cacheList = filterList.map((tab, index) => {
        tab.index = index;
        return tab;
      });

      return this.cacheList.slice(0, length);
    })
  },
  load({start, length}) {
    // 加载数据
    return new Promise(resolve => {
      resolve(this.cacheList.slice(start, start+length));
    })
  },

  openWindow(index, event) {
    let selectedTab = this.cacheList[ index ];

    if(event != undefined
    &&((_device.platform == 'Mac' && event.metaKey == true)
      || (_device.platform != '' && event.ctrlKey == true))) {
      return new Promise(resolve => {
        // 移动到当前标签的下一个位置，但不激活
        chrome.tabs.move(selectedTab.id, {windowId: this.activeTab.windowId, index: this.activeTab.index+1}, () => {
          resolve();
        });
      })
    } else if(event != undefined
            && _device.platform != ''
            && event.shiftKey == true) {
      return new Promise(resolve => {
        // 移动到新窗口（新建窗口）
        chrome.windows.create({tabId: selectedTab.id, focused: true}, () => {
          resolve();
        });
      })
    } else if(event != undefined
            && _device.platform != ''
            && event.altKey == true) {
      return new Promise(resolve => {
        // 交换两个标签的位置，激活被选中的标签

        // 让后台帮忙交换，因为这个极有可能导致弹框关闭，进而导致操作突然终止
        chrome.runtime.sendMessage({
            type: 'exchangeTab',
            target: this.activeTab,
            destination: selectedTab
        })
      })
    } else {
      return new Promise(resolve => {
        // 切换到对应的标签，不做任何移动（默认方式）
        chrome.tabs.update(selectedTab.id, { active: true }, () => {
          chrome.windows.update(selectedTab.windowId, { focused: true}, () => {
            chrome.runtime.sendMessage({
              type: 'closeExtension',
            })
          });
        })
      })
    }
  }
}

export default tab;