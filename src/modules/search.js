let search = {
    storageList: [],
    cacheList: [],

    isInit: false,

    init: function(config) {
      this.storageList = config.all_search_engine
                        ? config.all_search_engine
                        : [];

      this.storageList.forEach((item, index) => {
        item.type = 'search';
        item.index = index;
      })

      this.isInit = true;
    },

    search({keywords, length, config, originKeyword}) {
      return new Promise((resolve) => {
        if(this.isInit) resolve();
        else resolve(this.init(config))
      }).then(() => {
        this.cacheList = this.storageList.map((item, index) => {
          item.url = encodeURI(item.formate).replace(new RegExp(encodeURI('{query}'), 'g'), encodeURIComponent(originKeyword));
          // item.title = `Search ${item.name} for '<strong>${originKeyword.escape()}</strong>'`;
          // item.index = index;
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

    openWindow(index, event) {
      let currentItem = this.cacheList[index];
      console.log('search:openWindow', currentItem.url);

      return new Promise(resolve => {
        $open(currentItem.url, event, (tab, type) => {
          resolve();
        })
      })
    },

  }

  export default search;