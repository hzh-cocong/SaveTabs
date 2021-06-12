let note = {
  storageList: [],
  cacheList: [],

  currentTab: {},
  activeTabs: {},

  isInit: false,

  init: function() {
    return Promise.all([
      new Promise((resolve) => {
        // 获取本地数据
        chrome.storage.local.get({tabs: []}, items => {
          this.storageList = items.tabs.map((tab) => {
            // 兼容旧版（旧版没有自动去除末尾 /）
            tab.url = tab.url.replace(/(\/*$)/g,"");
            // 去除旧版一些没用的数据
            delete tab.tabId;
            delete tab.windowId;

            return tab;
          });
          resolve()
        });
      }),
      // 获取当前标签
      new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 去除末尾 /
          tabs[0].url = tabs[0].url.replace(/(\/*$)/g,"");
          this.currentTab = tabs[0];
          resolve()
        })
      }),
      // 获取全部标签
      new Promise((resolve) => {
        chrome.tabs.query({}, tabs => {
          for(let tab of tabs) {
            // 去除末尾 /
            tab.url = tab.url.replace(/(\/*$)/g,"");
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
        note.index = index;
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

  openWindow(index, event) {
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
        $open(currentNote.url, event, (tab, type) => {
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