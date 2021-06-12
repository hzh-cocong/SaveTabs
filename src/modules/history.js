let history = {
  storageList: [],
  cacheList: [],

  isInit: false,

  init: function() {
    this.isInit = true;
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword == keyword.trim()) return;
        this.storageKeyword = keyword.trim();
      }
console.warn('isSearched');
      console.log('search', this.storageKeyword, keyword,  this.endTime, new Date().getTime());

      if(keyword == undefined && this.lastEndTime == this.endTime) return;

      console.log('search2', this.storageKeyword, this.lastEndTime, this.endTime);

      this.lastEndTime = this.endTime;
      let lastVisitTime = this.endTime;

      // 默认只展示 24 小时内的数据（体验不好）
      // this.startTime = this.storageKeyword == '' ?  new Date().getTime()-86400000 : 0;

      // 反正历史记录就不太对，不如将错就错
      // this.startTime = 0;
console.warn('isSearched2');
      // 查找历史
      this.query((historys) => {console.warn('isSearched3');
        console.log('history.search', historys);
        if(historys.length == 0) {
          this.cacheList = [];
          this.list = [];

          this.currentIndex = -1;
          this.scrollDisabled = true;
          this.queryDisabled = true;

          // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
          this.isSearched = true;

          return;
        }

        this.cacheList = [];
        this.mergeHistory(this.cacheList, historys);

        // 搜索结果只有一条时自动展开
        // if(this.storageKeyword.length > 0 && this.cacheList.length == 1 && this.cacheList[0].count > 1) {
        //   let historys = this.cacheList[0].subFiles.splice(0, this.cacheList[0].count);

        //   this.cacheList.push(...historys);
        //   // this.cacheList.splice(1, 0, ...historys);

        //   this.currentIndex = 1;

        //   // 不加这个，目录可能会被隐藏，即自动向上滚动了一行
        //   this.$nextTick(() => {
        //     this.$refs.list.currentTo(1);
        //   });
        // } else {
        //   this.currentIndex = 0;
        // }

        this.list = this.cacheList.slice(0, this.config.list_page_count);

        this.currentIndex = 0;

        // query 并不精确，有可能这次只返回一条，下次却返回10条
        this.scrollDisabled = false;
        this.queryDisabled = false;

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      }, lastVisitTime, 27)
    })
  },
  load({start, length}) {
    if(this.cacheList.length >= this.list.length+this.config.list_page_count) {
      // 性能最高
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count));
      return;
    }

    if(this.queryDisabled) {
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
      this.scrollDisabled = true;
      return;
    }

    // 查找历史
    this.query((historys) => {
      if(historys.length == 0) {
        this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))

        this.scrollDisabled = true;
        this.queryDisabled = true;

        // 结果只有一条时自动展开
        if(this.cacheList.length == 1 && this.cacheList[0].count > 1) {
          let historys = this.cacheList[0].subFiles.splice(0, this.cacheList[0].count);

          this.cacheList.push(...historys);
          this.list.push(...historys);

          this.currentIndex = 1;

          // 不加这个，目录可能会被隐藏，即自动向上滚动了一行
          this.$nextTick(() => {
            this.$refs.list.currentTo(1);
          });
        }

        return;
      }

      this.mergeHistory(this.cacheList, historys);
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count));
    })

    // 不使用预加载，因为预加载过快，dom 反而会因此等待
  },
  query(callback, lastVisitTime, max) {
    max = max == undefined ? 55 : max;
    max = max < this.config.list_page_count ? this.config.list_page_count : max;

    // 防止并发问题
    lastVisitTime = lastVisitTime == undefined ? this.lastVisitTime : lastVisitTime;

    // 查找
    chrome.history.search({
        text: this.storageKeyword,
        startTime: this.startTime,
        endTime: lastVisitTime,
        maxResults: max, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
      }, (historys)=>{
      console.log('chrome.history.query', {
        text: this.storageKeyword,
        startTime: this.startTime,
        endTime: lastVisitTime,
        maxResults: 10, //100, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
      }, historys)

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
        console.warn('history.loading.result.warn', this.lastVisitTime, this.timeShow(this.lastVisitTime));
        // this.lastVisitTime = this.lastVisitTime-1000*1;
        console.warn('history.loading.result.warn', this.lastVisitTime, this.timeShow(this.lastVisitTime));
        callback([]);
        return;
      }

      this.lastVisitTime = Math.floor(historys[historys.length-1].lastVisitTime)-1;

      callback(historys);
    })
  },

  openWindow(index, event) {
    if(this.currentHistory == null) return;

    if(this.currentHistory.count == undefined || this.currentHistory.count == 1) {
      // 打开新标签
      let url = this.currentHistory.count == undefined
              ? this.currentHistory.url
              : this.currentHistory.subFiles[0].url
console.log('_openWindow', url)
      this.$open(url, event);
      return;
    }

    // 展开或收起目录
    if(this.currentHistory.subFiles.length > 0) {
      // 展开
      // let historys = this.currentHistory.subFiles.splice(0, this.currentHistory.count);
      let historys = this.currentHistory.subFiles;
      this.cacheList.splice(this.currentIndex+1, 0, ...historys);
      this.list.splice(this.currentIndex+1, 0, ...historys);
      this.currentHistory.subFiles = [];
      console.log('展开', this.list.length, this.cacheList.length)

      // 由于 currentIndex List 组件通过 $emit 调用触发的，虽然对于父组件 currentIndex 的更新是实时的，但是对于其依赖（即子组件的 currentIndex），则是被放到异步队列中执行的，因此此时子组件的 currentIndex 值依然是旧的
      this.$nextTick(() => {
        if(this.$refs.list.visiualIndex+this.currentHistory.count+1 > this.config.item_show_count) {
          let index = this.config.item_show_count-this.currentHistory.count-1;
          // index = index < 0 ? 0 : index;
          console.warn('kkkk2')
          this.$refs.list.currentTo(index);
        }
        // this.$refs.list.currentToTop();
      })
    } else {
      // 收起
      this.cacheList.splice(this.currentIndex+1, this.currentHistory.count);
      this.currentHistory.subFiles = this.list.splice(this.currentIndex+1, this.currentHistory.count);
    }
  }
}

export default history;