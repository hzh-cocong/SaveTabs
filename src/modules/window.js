let window = {
  storageList: [],
  cacheList: [],

  currentWindow: null,

  activeWindows: {},

  isInit: false,

  init: function() {
    Promise.all([
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
      this.storageList.forEach(group => {
        // todo
        // console.log('77', group.windowId, this.currentWindowId)

        group.isCurrent = group.windowId != undefined && group.windowId == this.currentWindowId;
        group.isOpened = this.activeWindows[group.windowId] == true && group.windowId != this.currentWindowId;
      });

      this.isInit = true;
    })
  },

  async search(keyword) {
    if( ! this.isInit) {
      await this.init();
    }

    if(keyword == undefined) return;
    if(this.storageKeyword == keyword.trim()) return;

    this.storageKeyword = keyword.trim();

    // 查找
    let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
    // 注意这里关键词为空就不会去循环，所以优化效果可能不大
    let filterList = this.storageKeyword == '' ? this.storageList : this.storageList.filter(group => {
      let name = group.name.toUpperCase();
      // 找出不匹配的过滤掉
      return ! keywords.some((keyword) => {
        // 不匹配则为 -1
        return name.indexOf(keyword) == -1;
      });
    })

    // 重新排序
    let currentList = filterList.filter(group => {
      return group.windowId == this.currentWindowId;
    });
    let openedList = filterList.filter(group => {
      return this.activeWindows[group.windowId] && group.windowId != this.currentWindowId;
    });
    let closeList = filterList.filter(group => {
      return ! this.activeWindows[group.windowId];
    });

    // 列表赋值
    this.cacheList = currentList; this.cacheList.push(...openedList, ...closeList);
    // this.cacheList = currentList.concat(openedList).concat(closeList);
    // this.list = this.cacheList.slice(0, this.config.list_page_count);

    return this.cacheList;
  }
}

export default window;