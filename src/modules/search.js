let search = {
    storageList: [],
    cacheList: [],

    isInit: false,

    init: function(localConfig) {
      this.storageList = localConfig.all_search_engine
      ? JSON.parse(JSON.stringify(localConfig.all_search_engine)) // 防止被污染导致存储脏数据
      : [];

      this.storageList.forEach((item, index) => {
        item.type = 'search';
        item.realIndex = index;
      })

      this.isInit = true;
    },

    search({keywords, length, config, localConfig, originKeyword}) {
      return new Promise((resolve) => {
        if(this.isInit) resolve();
        else resolve(this.init(localConfig))
      }).then(() => {
        this.cacheList = this.storageList.map((item, index) => {
          item.url = encodeURI(item.formate).replace(new RegExp(encodeURI('{query}'), 'g'), encodeURIComponent(originKeyword));
          // item.url = encodeURI(item.formate.replace(new RegExp('{query}', 'g'), encodeURIComponent(originKeyword)));
          // item.title = `Search ${item.name} for '<strong>${originKeyword.escape()}</strong>'`;
          // item.realIndex = index;
          return item;
        })
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
      let currentItem = this.cacheList[index];

      let url = currentItem.url;
      if(url == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: url,
        count: 1,
      })
    },

    openWindow(index, keyType) {
      let currentItem = this.cacheList[index];

      return new Promise(resolve => {
        window.$open(currentItem.url, keyType, (tab, type) => {
          resolve();
        })
      })
    },

  }

  export default search;