let note = {
  storageList: [],
  cacheList: [],

  currentTab: {},
  activeTabs: {},

  isInit: false,

  w: {
    timer: null,
  },

  init: function() {
    // 自动保持窗口信息同步
    // openWindow 会第一时间更新，肯定比 onCreated 快，可以防止重复点击
    // onCreated 是为了能够及时其它工作区所导致的标签变化
    // onUpdated 是为了能完美显示便签信息
    chrome.tabs.onCreated.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs();
      }, 200);
    })
    // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    //   if(changeInfo.status != 'complete') return;
    //   clearTimeout(this.w.timer);
    //   this.w.timer = setTimeout(() => {
    //     this.refreshTabs();
    //   }, 200);
    // })
    chrome.tabs.onRemoved.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs();
      }, 200);
    })

    return Promise.all([
      new Promise((resolve) => {
        // 获取本地数据
        chrome.storage.local.get({tabs: []}, items => {
          this.storageList = items.tabs.map((note) => {
            // 兼容旧版（旧版没有自动去除末尾 /）
            note.url = note.url.replace(/(\/*$)/g,"");
            // 去除旧版一些没用的数据
            delete note.tabId;
            delete note.windowId;

            return note;
          });
          resolve()
        });
      }),
      // 获取当前标签
      new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 去除末尾 / （pendingUrl 有可能不存在）
          tabs[0].url = tabs[0].url == '' && tabs[0].pendingUrl
                      ? tabs[0].pendingUrl.replace(/(\/*$)/g,"")
                      : tabs[0].url.replace(/(\/*$)/g,"");
          this.currentTab = tabs[0];
          resolve()
        })
      }),
      // 获取全部标签
      new Promise((resolve) => {
        chrome.tabs.query({}, tabs => {
          for(let tab of tabs) {
            // 去除末尾 /
            tab.url = tab.url == '' && tab.pendingUrl
                    ? tab.pendingUrl.replace(/(\/*$)/g,"")
                    : tab.url.replace(/(\/*$)/g,"");
            if(this.activeTabs[ tab.url ] == undefined) {
              tab.count = 1;
              tab.other = [];
              this.activeTabs[ tab.url ] = tab;
            } else {
              this.activeTabs[ tab.url ].count++;
              this.activeTabs[ tab.url ].other.push(tab.id);
            }
          }
          resolve()
        })
      })
    ]).then(() => {
      // 加标签（速度很快）(存在污染问题)
      this.storageList.forEach(note => {
        note.isCurrent = note.url == this.currentTab.url;
        note.isOpened = this.activeTabs[note.url] != undefined;
        note.count = note.isOpened ? this.activeTabs[ note.url ].count : 1;
        note.type = 'note';
      });

      this.isInit = true;
    })
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      // 查找
      let filterList = keywords.length == 0 ? this.storageList : this.storageList.filter(note => {
        let title = note.title.toUpperCase();
        let url = note.url.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1 ;
        });
      })

      // 重新排序
      let currentList = filterList.filter(note => note.isCurrent);
      let openedList = filterList.filter(note => note.isOpened && ! note.isCurrent);
      let closeList = filterList.filter(note => ! note.isOpened);

      // 合并结果
      let cacheList = currentList; cacheList.push(...openedList, ...closeList);
      this.cacheList = cacheList.map((note, index) => {
        note.realIndex = index;
        return note;
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

  refreshTabs() {
    Promise.all([
      // 获取当前标签
      new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 去除末尾 / （pendingUrl 有可能不存在）
          tabs[0].url = tabs[0].url == '' && tabs[0].pendingUrl
                      ? tabs[0].pendingUrl.replace(/(\/*$)/g,"")
                      : tabs[0].url.replace(/(\/*$)/g,"");
          this.currentTab = tabs[0];
          resolve()
        })
      }),
      // 获取全部标签
      new Promise((resolve) => {
        chrome.tabs.query({}, tabs => {
          this.activeTabs = {};
          for(let tab of tabs) {
            // 去除末尾 /
            tab.url = tab.url == '' && tab.pendingUrl
                    ? tab.pendingUrl.replace(/(\/*$)/g,"")
                    : tab.url.replace(/(\/*$)/g,"");
            if(this.activeTabs[ tab.url ] == undefined) {
              tab.count = 1;
              tab.other = [];
              this.activeTabs[ tab.url ] = tab;
            } else {
              this.activeTabs[ tab.url ].count++;
              this.activeTabs[ tab.url ].other.push(tab.id);
            }
          }
          resolve()
        })
      })
    ]).then(() => {
      // 不能是 cacheList，因为这些状态在查询时并不会更新，这是唯一的更新机会
      this.storageList.forEach((note) => {
        // 加标签（速度很快）(存在污染问题)
        note.isCurrent = note.url == this.currentTab.url;
        note.isOpened = this.activeTabs[note.url] != undefined;
        note.count = note.isOpened ? this.activeTabs[ note.url ].count : 1;
        // note.type = 'note';
      });
    })
  },

  refreshData() {
    return new Promise((resolve) => {
      // 获取本地数据
      chrome.storage.local.get({tabs: []}, items => {
        this.storageList = items.tabs.map((note) => {
          // 兼容旧版（旧版没有自动去除末尾 /）
          note.url = note.url.replace(/(\/*$)/g,"");
          // 去除旧版一些没用的数据
          delete note.tabId;
          delete note.windowId;

          // 加标签（速度很快）(存在污染问题)
          note.isCurrent = note.url == this.currentTab.url;
          note.isOpened = this.activeTabs[note.url] != undefined;
          note.count = note.isOpened ? this.activeTabs[ note.url ].count : 1;
          note.type = 'note';

          return note;
        });
        resolve()
      });
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
    let currentNote = this.cacheList[index];

    let url = currentNote.url;
    if(url == '') return;

    chrome.runtime.sendMessage({
      type: 'copy',
      data: url,
      count: 1,
    })
  },

  openWindow(index, keyType) {
    let currentNote = this.cacheList[index];
    let storageIndex = this.getStorageIndex(currentNote);

    // 更新时间
    this.storageList[storageIndex].lastVisitTime = new Date().getTime();

    // 标签已打开，直接切换
    if(this.activeTabs[currentNote.url]) {
      // 存储新数据（排序发生变化）
      return new Promise(resolve => {
        this.storageList.unshift(this.storageList.splice(storageIndex , 1)[0]);
        // 先存储，再切换
        chrome.storage.local.set({tabs: this.storageList.map(note => {
          // 过滤掉杂质
          return {
            id: note.id,
            title: note.title,
            url: note.url,
            icon: note.icon,
            lastVisitTime: note.lastVisitTime,
          }
        })}, () => {
          if(currentNote.url == this.currentTab.url) {
            // 如果操作的是当前便签，则直接关闭插件
            chrome.runtime.sendMessage({ type: 'closeExtension' })
            return;
          }

          // 先激活标签，再切换窗口
          chrome.tabs.update(this.activeTabs[currentNote.url].id, { active: true }, () => {
            chrome.windows.update(this.activeTabs[currentNote.url].windowId, { focused: true}, () => {
              resolve();
            });
          });
        });
      })
    }

    // 存储
    this.storageList.unshift(this.storageList.splice(storageIndex , 1)[0]);
    return new Promise(resolve => {
      chrome.storage.local.set({tabs: this.storageList.map(note => {
        // 过滤掉杂质
        return {
          id: note.id,
          title: note.title,
          url: note.url,
          icon: note.icon,
          lastVisitTime: note.lastVisitTime,
        }
      })}, () => {
        window.$open(currentNote.url, keyType, (tab, type) => {
          // 去除末尾 /
          tab.url = tab.url == '' && tab.pendingUrl
                  ? tab.pendingUrl.replace(/(\/*$)/g,"")
                  : tab.url.replace(/(\/*$)/g,"");

          if(type == 'cover') {
            for(let i = 0; i < this.cacheList.length; i++) {
              if(this.cacheList[i].isCurrent == true) {
                this.cacheList[i].isCurrent = false;
                this.cacheList[i].isOpened = false;
                delete this.activeTabs[this.cacheList[i].url];
              }
            }

            currentNote.isCurrent = true;
            currentNote.isOpened = true;
            this.activeTabs[ currentNote.url ] = tab;
          } else {
            currentNote.isOpened = true;
            this.activeTabs[ currentNote.url ] = tab;
          }

          resolve();
        });
      });
    })
  },

  getStorageIndex(note) {
    return this.storageList.findIndex(n => {
      return n.id == note.id;
    });
  },
}

export default note;