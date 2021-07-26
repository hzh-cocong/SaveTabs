let tab = {
  originList: [],
  cacheList: [],
  focusList: [],

  storageKeyword: '',

  activeTab: null,
  windowRank: {},

  isInit: false,

  w: {
    timer: null,
  },

  init: function() {
    // 自动保持窗口信息同步
    // 不像 note 或 window，tab 不需要本地存储，其逻辑和一开始初始化完全相同
    // onCreated 和 onRemoved 会导致列表数量发生变化，必须重刷列表
    // onUpdated 只是信息发生变化，无需重刷
    // 窗口移动窗口的状态发生改变，也需要进行监听
    chrome.tabs.onCreated.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'tab', operation: 'add'});
      }, 200);
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if(changeInfo.status != 'complete') return;

      // 非搜索条件下可以直接更新，无需刷新列表，提升用户体验
      if(this.storageKeyword == '') {
        let t = this.originList.find(t => t.id == tab.id);
        if(t == undefined) return; // 有可能标签更新过快，此时列表还未完全刷新，这里直接忽略

        Object.assign(t, tab);
        return;
      }

      // 在搜索条件下，必须刷新列表
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'tab', operation: 'update'});
      }, 200);
    })
    chrome.tabs.onRemoved.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'tab', operation: 'delete'});
      }, 200);
    })
    chrome.tabs.onMoved.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'tab', operation: 'move'});
      }, 200);
    })
    chrome.tabs.onDetached.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'tab', operation: 'move'});
      }, 200);
    })

    return this.refreshData().then(() => {
      this.isInit = true;
    })
  },
  refreshData() {
    return Promise.all([
      new Promise((resolve) => {
        // 获取标签顺序
        chrome.runtime.sendMessage({
            type: 'getActiveTabIds'
        }, (tabIds) => {
          resolve(tabIds);
        })
      }),
      new Promise((resolve) => {
        // 获取窗口顺序
        chrome.runtime.sendMessage({
            type: 'getActiveWindowIds'
        }, (windowIds) => {
          resolve(windowIds);
        })
      }),
      new Promise(resolve => {
        // 获取所有标签
        chrome.tabs.query({}, (tabs)=>{
          let t = tabs.map((tab) => {
            // 去除末尾 /
            tab.url = tab.url == '' && tab.pendingUrl
                    ? tab.pendingUrl.replace(/(\/*$)/g,"")
                    : tab.url.replace(/(\/*$)/g,"");
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
    ]).then(([tabIds, windowIds, tabs]) => {
      // 记录窗口顺序
      this.windowRank = windowIds.reverse().reduce((accumulator, windowId, index) => {
        accumulator[windowId] = index+1;
        return accumulator;
      }, {})

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
        // tab.isCurrent = tab.id == this.activeTab.id;
        tab.isCurrent = tab.windowId == this.activeTab.windowId;
        tab.type = 'tab';
        tab.windowRank = this.windowRank[tab.windowId];
      });

      this.focusList = this.originList;
    })
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      this.storageKeyword = keywords;

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
        tab.realIndex = index;
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

  up(index, keyType) {
    if(keyType == 'meta/ctrl') {
      // 无操作
      return Promise.resolve();
    } else {
      return Promise.resolve({ type: 'up' });
    }
  },
  down(index, keyType) {
    if(keyType == 'meta/ctrl') {
      // 这个操作和鼠标点击或者直接回车是差不多的，区别是 keyType 会被强制为默认的
      return this.openWindow(index, '');
    } else {
      return Promise.resolve({ type: 'down' });
    }
  },
  copy(index) {
    let selectedTab = this.cacheList[ index ];

    let url = selectedTab.url;
    if(url == '') return;

    chrome.runtime.sendMessage({
      type: 'copy',
      data: url,
      count: 1,
    })
  },

  openWindow(index, keyType) {
    let selectedTab = this.cacheList[ index ];

    if(keyType == 'meta/ctrl') {
      return new Promise(resolve => {
        // 移动到当前标签的下一个位置，但不激活
        chrome.tabs.move(selectedTab.id, {windowId: this.activeTab.windowId, index: this.activeTab.index+1}, () => {
          // // 延迟一下，chrome.windows.onRemoved 执行会慢一点点
          // clearTimeout(this.w.timer);
          // this.w.timer = setTimeout(() => {
          //   chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'tab', operation: 'move'});
          // }, 200);

          resolve();
        });
      })
    } else if(keyType == 'shift') {
      return new Promise(resolve => {
        // 移动到新窗口（新建窗口）
        chrome.windows.create({tabId: selectedTab.id, focused: true}, () => {
          resolve();
        });
      })
    } else if(keyType == 'alt') {
      return new Promise(resolve => {
        // 交换两个标签的位置，激活被选中的标签

        // 让后台帮忙交换，因为这个极有可能导致弹框关闭，进而导致操作突然终止
        chrome.runtime.sendMessage({
            type: 'exchangeTab',
            target: this.activeTab,
            destination: selectedTab
        })

        resolve();
      })
    } else {
      return new Promise(resolve => {
        // 当前窗口则直接关闭，因为 inject 不会像 popup 那样自动关闭
        if(selectedTab.id == this.activeTab.id) {
          chrome.runtime.sendMessage({
            type: 'closeExtension',
          })
          return;
        }

        // 切换到对应的标签，不做任何移动（默认方式）
        chrome.tabs.update(selectedTab.id, { active: true }, () => {
          chrome.windows.update(selectedTab.windowId, { focused: true}, () => {
            // 会有专门的事件处理，这里返回回导致插件重启
            // chrome.runtime.sendMessage({
            //   type: 'closeExtension',
            // })

            resolve();
          });
        })
      })
    }
  }
}

export default tab;