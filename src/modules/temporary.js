let temporary = {
  storageList: [],
  cacheList: [],

  isInit: false,

  init: function() {
    return new Promise(resolve => {
      // 获取本地数据
      chrome.storage.local.get({temporary: []}, items => {
        this.storageList = items.temporary;

        // 加标签（速度很快）(存在污染问题)
        this.storageList.forEach(group => {
          group.type = 'temporary';
          // group.type = 'TemporaryItem';
        });

        resolve();
      });
    })
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      // 查找
      let filterList = this.storageList.filter(temporary => {
        for(let tab of temporary.tabs) {
          let isMatch = true;
          for(let keyword of keywords) {
            // 关键词需全部匹配
            let title = tab.title.toUpperCase();
            let url = tab.url.toUpperCase();
            if(title.indexOf(keyword) == -1
            && url.indexOf(keyword) == -1) {
              isMatch = false;
              break;
            }
          }
          // 只要有一个搜到就成功
          if(isMatch) {
            return true;
          }
        }
        return false;
      })

      this.cacheList = filterList.map((temporary, index) => {
        temporary.realIndex = index;
        return temporary;
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

  refreshData() {
    return new Promise(resolve => {
      // 获取本地数据
      chrome.storage.local.get({temporary: []}, items => {
        this.storageList = items.temporary;

        // 加标签（速度很快）(存在污染问题)
        this.storageList.forEach(group => {
          group.type = 'temporary';
          // group.type = 'TemporaryItem';
        });

        resolve();
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
    let currentTemporary = this.cacheList[ index ];

    let urls = currentTemporary.tabs.reduce((accumulator, temporary, index) => {
      if(index == 0) return temporary.url;
      else return accumulator+"\n"+temporary.url;
    }, '');
    console.log('copy2', urls, urls == '')
    if(urls == '') return;

    chrome.runtime.sendMessage({
      type: 'copy',
      data: urls,
      count: currentTemporary.tabs.length,
    })
  },

  openWindow(index, keyType) {
    let temporary = this.cacheList[ index ];
    let urls = temporary.tabs.map(tab => tab.url);
    let storageIndex = this.getStorageIndex(temporary);
    let blankTabId = -1;

    // 打开新窗口
    return new Promise(resolve => {
      // 获取当前标签信息
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        // 记录空白标签
        if(tabs[0].url == "chrome://newtab/") {
          blankTabId = tabs[0].id;
        }
        resolve();
      })
    }).then(() => {
      // 更新数据（移除该临时窗口）
      this.storageList.splice(storageIndex , 1);
      this.cacheList.splice(index, 1);
      return new Promise(resolve => {
        chrome.storage.local.set({temporary: this.storageList.map(temporary => {
          // 过滤掉杂质
          return {
            id: temporary.id,
            lastVisitTime: temporary.lastVisitTime,
            tabs: temporary.tabs,
          }
        })}, () => {
          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'temporary', operation: 'delete', exclude: 'all'});
          resolve();
        });
      })
    }).then(() => {
      if(keyType == 'meta/ctrl') {
        // 当前窗口打开，且不关闭
        // 不自动关闭空白标签页，有隔离作用
        blankTabId = -1;
        return Promise.all(urls.map((url) => {
          return new Promise((resolve) => {
            chrome.tabs.create({url: url, active: false}, (tab) => {
              resolve(tab.index);
            });
          });
        }))
      } else if(keyType == 'alt') {
        // 当前窗口打开，且不关闭，也不进行存储更新
        // 会高亮标签
        blankTabId = -1;
        return new Promise((resolve) => {
          Promise.all(urls.map((url) => {
            return new Promise((resolve2) => {
              chrome.tabs.create({url: url, active: false}, (tab) => {
                resolve2(tab.index);
              });
            });
          })).then((indexs) => {
            chrome.tabs.highlight({tabs: indexs})
            resolve(indexs);
          })
        })
      } else {
        // 直接回车 或 shift 方式打开（panel 只支持一个网页，没法玩）
        //let type = this._device.platform != '' && event.shiftKey ? 'panel' : 'normal';
        let type = 'normal';
        return new Promise(resolve => {
          // 新建新窗口（先不激活，否则无法存储数据）
          chrome.windows.create({ url: urls, focused: true, type: type }, window => {
            resolve(window)
          })
        })
      }
    }).then((window) => {
      // 关闭空白标签
      if(blankTabId != -1) {
        chrome.tabs.remove(blankTabId);
      }
      return { type: 'delete' };
    })
  },

  getStorageIndex(temporary) {
    return this.storageList.findIndex(t => {
      return t.id == temporary.id;
    });
  },
}

export default temporary;