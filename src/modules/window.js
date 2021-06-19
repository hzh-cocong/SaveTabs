let window = {
  storageList: [],
  cacheList: [],

  currentWindow: null,
  currentWindowId: -1,
  currentTab: null,
  activeWindows: {},

  isInit: false,

  init: function() {
    return Promise.all([
      new Promise((resolve) => {
        // 获取本地数据
        chrome.storage.local.get({'list': []}, items => {
          this.storageList = items.list;
          resolve();
        });
      }),
      // 获取当前窗口（不再 getAll 里拿是因为要加 populate 参数，会获取太多不必要的数据，当然实际测试好像速度没区别）
      new Promise((resolve) => {
        chrome.windows.getCurrent({populate: true}, (window) => {
          this.currentWindow = window;
          this.currentWindowId = window.id;
          this.currentTab = this.currentWindow.tabs.find((tab) => {
            return tab.active == true;
          })

          resolve();
        })
      }),
      // 获取全部窗口
      new Promise((resolve) => {
        // 判断窗口是否已打开
        chrome.windows.getAll({}, (windows) => {
          // 保存活跃的窗口
          for(let window of windows) {
            this.activeWindows[ window.id ] = true;
          }
          resolve();
        })
      }),
    ]).then((/* res */) => {
      console.log('all.window.finish', this.storageList);

      let a = new Date().getTime();

      // 加标签（速度很快）(存在污染问题)
      this.storageList.forEach(group => {
        group.isCurrent = group.windowId == this.currentWindowId;
        group.isOpened = this.activeWindows[group.windowId] == true;
        group.type = 'window';
        // group.type = 'WindowItem';
      });

      let b = new Date().getTime();

      console.log('window.js===h', (b-a)/1000);

      this.isInit = true;
    })
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      // 查找
      let filterList = keywords.length == 0 ? this.storageList : this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return name.indexOf(keyword) == -1;
        });
      })

      // 重新排序
      let currentList = filterList.filter(group => group.isCurrent);
      let openedList = filterList.filter(group => group.isOpened && ! group.isCurrent);
      let closeList = filterList.filter(group => ! group.isOpened);

      // 合并结果
      let cacheList = currentList; cacheList.push(...openedList, ...closeList);
      this.cacheList = cacheList.map((group, index) => {
        group.index = index;
        return group;
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

  refresh() {
    return new Promise((resolve) => {
      chrome.storage.local.get({'list': []}, items => {
        // 刷新数据
        this.storageList = items.list.map(group => {
          // 加标签（速度很快）(存在污染问题)
          group.isCurrent = group.windowId == this.currentWindowId;
          group.isOpened = this.activeWindows[group.windowId] == true;
          group.type = 'window';

          return group;
        })
        resolve();
      });
    })
  },

  openWindow(index, event) {
    let currentGroup = this.cacheList[index];
    let storageIndex = this.getStorageIndex(currentGroup);
    let urls = currentGroup.tabs.map(tab => tab['url']);
    let isInCurrentWindow = this.isInCurrentWindow();
console.log('99999999999999999999999', isInCurrentWindow)
    // 窗口已打开，直接切换
    if(this.activeWindows[currentGroup.windowId]) {
      return new Promise(resolve => {
        // 更新时间
        this.storageList[ storageIndex ].lastVisitTime = new Date().getTime();
        // 排序到最前面
        this.storageList.unshift(this.storageList.splice(storageIndex , 1)[0]);
        // 先存储
        chrome.storage.local.set({list: this.storageList.map(group => {
          // 过滤掉杂质
          return {
            id: group.id,
            name: group.name,
            windowId: group.windowId,
            lastVisitTime: group.lastVisitTime,
            tabs: group.tabs,
          }
        })}, () => {
          // 再切换
          chrome.windows.update(currentGroup.windowId, { focused: true}, () => {
            resolve();
          });
        });
      });
    }

    // 当前窗口打开，且不关闭，也不进行存储更新
    // 不自动关闭空白标签页，有隔离作用
    if((_device.platform == 'Mac' && event.metaKey == true)
    || (_device.platform != '' && event.ctrlKey == true)) {
      return Promise.all(urls.map((url) => {
        return new Promise((resolve) => {
          chrome.tabs.create({url: url, active: false}, (tab) => {
            resolve(tab.index);
          });
        });
      })).then((/*indexs*/) => {
        // chrome.tabs.highlight({tabs: indexs})
      })
    }

    // 当前窗口打开，且不关闭，也不进行存储更新
    // 会高亮标签
    if(_device.platform != '' && event.altKey == true) {
      return Promise.all(urls.map((url) => {
        return new Promise((resolve) => {
          chrome.tabs.create({url: url, active: false}, (tab) => {
            resolve(tab.index);
          });
        });
      })).then((indexs) => {
        chrome.tabs.highlight({tabs: indexs})
      })
    }

    // 直接回车 或 shift 方式打开（panel 只支持一个网页，没法玩）
    //let type = this._device.platform != '' && event.shiftKey ? 'panel' : 'normal';
    let type = 'normal';
    return new Promise(resolve => {
      // 新建新窗口（先不激活，否则无法存储数据）
      chrome.windows.create({ url: urls, focused: false, type: type }, window => {
        resolve(window)
      })
    }).then((window) => {
       // 存储数据
      return new Promise(resolve => {
        // 更新时间
        this.storageList[storageIndex].lastVisitTime = new Date().getTime();
        // 搬定新的窗口id
        this.storageList[storageIndex].windowId = window.id;
        // 排序到最前面
        this.storageList.unshift(this.storageList.splice(storageIndex , 1)[0]);
        chrome.storage.local.set({list: this.storageList.map(group => {
          // 过滤掉杂质
          return {
            id: group.id,
            name: group.name,
            windowId: group.windowId,
            lastVisitTime: group.lastVisitTime,
            tabs: group.tabs,
          }
        })}, () => {
          resolve(window);
        });
      })
    }).then((window) => {
      // 激活窗口
      chrome.windows.update(window.id, { focused: true});

      // 关闭空白标签页（是工作窗口则不关闭）
      if( ! isInCurrentWindow && this.currentTab.url == 'chrome://newtab/') {
        chrome.tabs.remove(this.currentTab.id);
      }
    })
  },

  getStorageIndex(group) {
    return this.storageList.findIndex(g => {
      return g.id == group.id;
    });
  },
  isInCurrentWindow() {
    if(this.currentWindowId == undefined) return false;

    return this.storageList.some((group) => {
      return group.windowId == this.currentWindowId;
    })
  },

  showTip({event, _device}) {
    if((_device.platform == 'Mac' && event.metaKey == true)
    || (_device.platform != '' && event.ctrlKey == true)) {
      return '当前窗口打开但不选中';
    } else if(_device.platform != '' && event.shiftKey == true) {
      return '默认新窗口打开';
    } else if(_device.platform != '' && event.altKey == true) {
      return '当前窗口打开并选中';
    }
  },
  finishTip() {
    return '';
  }
}

export default window;