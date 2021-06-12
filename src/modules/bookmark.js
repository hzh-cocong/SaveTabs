let bookmark = {
  storageList: [],
  cacheList: [],

  isInit: false,

  init: function() {
    Promise.all([
      new Promise((resolve) => {
        this.getTree((bookmarks) => {
          this.originList = bookmarks;
          resolve();
        })
      }),
      new Promise((resolve) => {
        // 获取书签打开状态
        chrome.storage.local.get({'bookmark': {
          state: {},
          position: {
            currentIndex: 0, // -1 就是会导致到顶反弹
            visiualIndex: 0,
          }
        }}, items => {
          this.state = items.bookmark.state;
          this.position = items.bookmark.position;
          resolve();
        });
      }),
    ]).then(() => {
      this.isInit = true;
    })
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;

      this.storageKeyword = keyword.trim();

      if( ! this.isSearched) {
        // 避免第一次加载页面时重复 getTree
console.log('chrome.bookmarks.getTree.first')
          // 倒着打开
        for(let i = this.originList.length-1; i >= 0; i--)
          this.expand(this.originList, i, false);
        this.list = this.originList;

        // 回到记住滚动的位置
        if(this.storageKeyword.length == 0) {
          this.currentIndex = this.position.currentIndex;
          // vue 依赖更新是异步的，此时 对于 list 组件，所有值都为更新，currentTo 是无效的，所以要放到异步里去
          this.$nextTick(() => {
            this.$refs.list.currentTo(this.position.visiualIndex);

            // 等移动到指定位置再开启，否则会触发滚动事件
            this.isSearching = false;
          });
        }

        // this.currentIndex = 0;
        this.scrollDisabled = true;

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      } else if(this.storageKeyword.length == 0) {
        // 搜索是异步的，先用之前的填补，否则搜索列表数据会因为使用不同的 marginLeft 而错误，进而形成闪烁。
        this.list = this.originList;

        this.currentIndex = this.position.currentIndex;
        // this.$refs.list.currentTo(this.position.visiualIndex);

        // this.currentIndex = 0;
        this.scrollDisabled = true;

        this.getTree((bookmarks) => {
          console.log('getTree', bookmarks);

          this.originList = bookmarks;
          // 倒着打开
          for(let i = this.originList.length-1; i >= 0; i--)
            this.expand(this.originList, i, false);
          this.list = this.originList;

          // 回到记住滚动的位置
          this.currentIndex = this.position.currentIndex;
          // vue 依赖更新是异步的，此时 对于 list 组件，所有值都为更新，currentTo 是无效的，所以要放到异步里去
          this.$nextTick(() => {
            console.log('bookmark.currentTo', {position: this.position.currentIndex, visiualIndex: this.position.visiualIndex});
            this.$refs.list.currentTo(this.position.visiualIndex);
          });

          // this.currentIndex = 0;
          this.scrollDisabled = true;

          this.isSearching = false;
        })
      }

      if(this.storageKeyword.length > 0){
        // 加上这个会山所问题
        // this.isSearched = false;
        // this.list = [];

        this.isSearching = true;

        this.query(this.storageKeyword, (bookmarks) => {
console.log('chrome.bookmarks.getTree.second')
          this.cacheList = bookmarks;
          this.list = this.cacheList.slice(0, this.config.list_page_count);

          this.currentIndex = this.list.length > 0 ? 0 : -1;
          this.scrollDisabled = this.list.length >= this.cacheList.length;
        })
      }
    })
  },
  load({start, length}) {
    // 加载数据
    return new Promise(resolve => {
      resolve(this.cacheList.slice(start, start+length));
    })
  },

  openWindow(index, event) {
    // 列表为空
    if(this.currentBookmark == null) return;

    // 打开网页
    if( ! this.currentBookmark.children) {
      this.$open(this.currentBookmark.url, event);
      return;
    }

    // 搜索列表需要用别的方式展开或收起目录
    if(this.storageKeyword != '') {
      // 展开或收起目录
      if(this.currentBookmark.children.length > 0) {
        // 展开
        this.searchExpand(this.currentIndex);
      } else {
        // 收起
        this.searchCollapse(this.currentIndex);
      }
      return;
    }

    // 展开或收起目录
    if(this.currentBookmark.children.length > 0) {
      // 展开

      // 先存储再去操作，因为列表有可能会发生滚动
      this.state[ this.currentBookmark.id ] = true;
      chrome.storage.local.set({'bookmark': { state: this.state, position: this.position }}, () => {

      });

      this.expand(this.list, this.currentIndex, true);
    } else {
      // 收起

      // 先存储再去操作，因为列表有可能会发生滚动
      // this.state[ this.currentBookmark.id ] = false;
      delete this.state[ this.currentBookmark.id ]
      chrome.storage.local.set({'bookmark': { state: this.state, position: this.position  }}, () => {

      });

      this.collapse(this.list, this.currentIndex);
    }
  }
}

export default bookmark;