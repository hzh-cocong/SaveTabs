let history = {
  storageList: [],
  cacheList: [],

  storageKeyword: '',
  list_page_count: 0,
  queryDisabled: false,

  parent: {},

  isInit: false,

  init: function() {
    this.isInit = true;
  },

  search({keywords, length, originKeyword, parent}) {
    this.parent = parent;

    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      return new Promise(resolve => {
        this.storageKeyword = originKeyword;
        this.list_page_count = length;
        let lastVisitTime = new Date().getTime();

        // 查找历史
        this.query((historys) => {
          if(historys.length == 0) {
            this.cacheList = [];

            this.queryDisabled = true;

            resolve([]);
            return;
          }

          this.cacheList = [];
          this.mergeHistory(this.cacheList, historys);
          this.cacheList = this.cacheList.map((history, index) => {
            history.type = 'history';
            history.title = history.count == undefined
                          ? history.title
                          : (
                              history.subFiles.length > 0
                            ? history.subFiles[0].title
                            : this.cacheList[index+1].title
                          );
            history.url = history.count == undefined
                        ? history.url
                        : (
                            history.subFiles.length > 0
                          ? history.subFiles[0].url
                          : this.cacheList[index+1].url
                        );
            history.lastVisitTime = history.subFiles.length > 0
                                  ? history.subFiles[0].lastVisitTime
                                  : this.cacheList[index+1].lastVisitTime;
            history.realIndex = index;
            return history;
          });

          this.queryDisabled = false;

          resolve(this.cacheList.slice(0, length));
        }, lastVisitTime, 27)
      })
    })
  },
  load({start, length}) {
    if(this.cacheList.length >= start+length) {
      return new Promise(resolve => {
        resolve(this.cacheList.slice(start, start+length));
      });
    }

    if(this.queryDisabled) {
      return new Promise(resolve => {
        resolve(this.cacheList.slice(start, start+length));
      });
    }

    return new Promise(resolve => {
      // 查找历史
      this.query((historys) => {
        if(historys.length == 0) {
          this.queryDisabled = true;

          resolve(this.cacheList.slice(start, start+length));

          return;
        }

        this.mergeHistory(this.cacheList, historys);
        resolve(this.cacheList.slice(start).map((history, index) => {
          history.type = 'history';
          history.title = history.count == undefined
                        ? history.title
                        : (
                            history.subFiles.length > 0
                          ? history.subFiles[0].title
                          : this.cacheList[index+1].title
                        );
          history.url = history.count == undefined
                      ? history.url
                      : (
                          history.subFiles.length > 0
                        ? history.subFiles[0].url
                        : this.cacheList[index+1].url
                      );
          history.lastVisitTime = history.count == undefined
                                ? history.lastVisitTime
                                : (
                                  history.subFiles.length > 0
                                  ? history.subFiles[0].lastVisitTime
                                  : this.cacheList[index+1].lastVisitTime
                                );
          history.realIndex = start+index;
          return history;
        }).slice(0, length));
      })
    })
  },
  query(callback, lastVisitTime, max) {
    max = max == undefined ? 55 : max;
    max = max < this.list_page_count ? this.list_page_count : max;

    // 防止并发问题
    lastVisitTime = lastVisitTime == undefined ? this.lastVisitTime : lastVisitTime;

    // 查找
    chrome.history.search({
      text: this.storageKeyword,
      startTime: 0,
      endTime: lastVisitTime,
      maxResults: max, // this.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
    }, (historys)=>{
      // 谷歌提供的接口返回的结果过有时候会是错误的，排序出问题容易被看出，所以我们要自己给它重新排一下
      historys = historys.sort((a, b)=>{
        return b.lastVisitTime-a.lastVisitTime;
      });

      // 这个比较特殊，这里处理结果会更准确
      // 其实当过滤完了没数据后，已经没得救了，所以还是交给别人处理吧
      // this.scrollDisabled = historys.length < max;

      if(historys.length == 0) {
        callback([]);
        return;
        // return [];
      }

      // 谷歌可能返回超出时间范围的结果，很容易被看出，这里我们给它过滤一下
      historys = historys.filter((history) => {
        // 去除末尾 /
        history.url = history.url.replace(/(\/*$)/g,"");

        return history.lastVisitTime < lastVisitTime;
      })

      // 过滤
      if(historys.length == 0) {
        // 糟糕，被过滤完了
        callback([]);
        return;
      }

      this.lastVisitTime = Math.floor(historys[historys.length-1].lastVisitTime)-1;

      callback(historys);
    })
  },
  mergeHistory(list, historys) {
    let k = list.length-1;
    for(let history of historys) {
      let domain = this.parent.getDomain(history.url);
      let lastDomain = k >= 0
                    ? ( list[k].count == undefined
                      ? this.parent.getDomain(list[k].url)
                      : this.parent.getDomain(list[k].subFiles[0].url))
                    : null;
      if(domain == lastDomain && list[k].count == undefined) {
        // 文件夹展开的情况（一般不会遇到）
        let l = k;
        while(list[ l ].count == undefined) l--;

        list[l].count++;
        list[++k] = history;
      } else if(domain == lastDomain && list[k].count != undefined) {
        // 文件夹未展开
        list[k].subFiles.push(history);
        list[k].count++;
      } else {
        // 新文件夹
        list[++k] = {
          count: 1,
          subFiles: [ history ],
        }
      }
    }
  },

  refreshData() {
    return Promise.resolve();
  },

  up(index, keyType) {
    if(keyType == 'meta/ctrl') {
      let currentIndex = this.getRealIndex(index);
      let currentHistory = this.cacheList[ currentIndex ];

      // 只收起文件夹
      if(currentHistory.count == 1) {
        // 根文件，无法收起
        return Promise.resolve();
      } else if(currentHistory.count == undefined) {
        // 找到父文件并收起
        for(let i = currentIndex-1; i >= 0; i--) {
          if(this.cacheList[i].count == undefined) continue;

          return this.openWindow(this.cacheList[i].realIndex, '').then((result) => {
            return { type: 'jump-up-and-collapse', count: currentIndex-i, length: result.length };
          })
        }
      } else if(currentHistory.subFiles.length <= 0) {
        return this.openWindow(index, '');
      } else {
        // 文件夹已收起
        return Promise.resolve();
      }
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
    let currentIndex = this.getRealIndex(index);
    let currentHistory = this.cacheList[ currentIndex ];

    let urls='';
    if(currentHistory.count == undefined) {
      urls = currentHistory.url;
    } else if(currentHistory.count == 1) {
      urls = currentHistory.subFiles[0].url;
    } else if(currentHistory.subFiles.length > 0) { // 未展开
      urls = currentHistory.subFiles.reduce((accumulator, history, index) => {
        if(index == 0) return history.url;
        else return accumulator+"\n"+history.url;
      }, '');
    } else { // 已展开
      for(let i = currentIndex+1; i <= currentIndex+currentHistory.count; i++) {
        if(i == currentIndex+1) {
          urls = this.cacheList[i].url;
        } else {
          urls += "\n"+this.cacheList[i].url;
        }
      }
    }

    if(urls == '') return;

    chrome.runtime.sendMessage({
      type: 'copy',
      data: urls,
      count: currentHistory.count == undefined ? 1 : currentHistory.count,
    })
  },

  openWindow(index, keyType) {
    index = this.getRealIndex(index);
    let currentHistory = this.cacheList[ index ];

    if(currentHistory.count == undefined || currentHistory.count == 1) {
      // 打开新标签
      return new Promise(resolve => {
        window.$open(currentHistory.url, keyType, () => {
          resolve();
        });
      })
    }

    // 展开或收起目录
    if(currentHistory.subFiles.length > 0) {
      return new Promise(resolve => {
        // 展开
        let historys = currentHistory.subFiles.map((history, index) => {
          history.type = 'history';
          history.realIndex = currentHistory.realIndex+'-'+index;
          return history;
        });

        this.cacheList.splice(index+1, 0, ...historys);
        currentHistory.subFiles = [];
        resolve({ type: 'spread', list: historys });
      });
    } else {
      return new Promise(resolve => {
        // 收起
        currentHistory.subFiles = this.cacheList.splice(index+1, currentHistory.count);
        resolve({ type: 'collapse', length: currentHistory.count })
      });
    }
  },

  getRealIndex(i) {
    return this.cacheList.findIndex((history, index) => {
      return history.realIndex == i;
    })
  },
}

export default history;