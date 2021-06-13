let bookmark = {
  originList: [],
  cacheList: [],

  tree: {},

  isInit: false,

  init: function() {
    return Promise.all([
      new Promise((resolve) => {
        this.getTree((bookmarks) => {
          this.originList = bookmarks;
          resolve();
        })
      }),
    ]).then(() => {
      this.tree = this.getTreeMap();

      this.isInit = true;
    })
  },
  getTreeMap() {
    let marginLeft = {};
    let path = {};
    let itemCount = {};
    // let total = 0;
    let bookmarkCount = {};

    let stack = [];
    let childrenStack = [];
    let list = this.originList;
    let index = 0;
    let currentBookmarkCount = 0;
    let bookmark;
    let parentId = list.length <= 0 ? -1 : list[index].parentId;
    while(true) {
      if(index >= list.length) {
        if(stack.length == 0) {
          // 汇总全部
          while(true) {
            let childBookmarkCount = currentBookmarkCount;
            bookmarkCount[ parentId ] = childBookmarkCount;

            if(childrenStack.length <= 0) break;

            [parentId, currentBookmarkCount] = childrenStack.pop();
            currentBookmarkCount += childBookmarkCount;
          }

          break;
        }

        [list, index] = stack.pop();
        index++;
        continue;
      }

      bookmark = list[index];

      // 如果子目录遍历完毕，其将回到上一层，此时我们要还原到上层状态（可能要切换多次）
      while(bookmark.parentId != parentId) {
        let childBookmarkCount = currentBookmarkCount;
        bookmarkCount[ parentId ] = childBookmarkCount;

        // 理论上不可能出现，除非出现脏数据
        if(childrenStack.length <= 0) { console.error('脏数据', bookmark); break; }

        [parentId, currentBookmarkCount] = childrenStack.pop();
        currentBookmarkCount += childBookmarkCount;
      }

      marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+20 || 0); //
      path[bookmark.id] = (path[bookmark.parentId] != undefined ? path[bookmark.parentId] : '')+'/'+bookmark.title;
      itemCount[bookmark.id] = 0;
      itemCount[bookmark.parentId]++;
      // itemCount[bookmark.parentId] == undefined ? itemCount[bookmark.parentId] = 1 : itemCount[bookmark.parentId]++;

      if(bookmark.children == undefined) {
        currentBookmarkCount++;
        // total++;
      }

      if(bookmark.children != undefined) {
        // 保存父目录的计算状态，接下来将遍历子目录，不管其有没有展开
        childrenStack.push([ parentId, currentBookmarkCount ]);
        currentBookmarkCount = 0;
        parentId = bookmark.id;
      }

      if(bookmark.children == undefined || bookmark.children == 0) {
        // 非目录或目录已展开，则继续往下遍历
        index++;
      } else {
        // 存在子目录且未展开，则进入到子目录

        // 先保存当前状态
        stack.push([list, index]);

        // 开始遍历子目录
        list = bookmark.children;
        index = 0;
      }
    }

    return {
      marginLeft, //
      path,
      itemCount,
      bookmarkCount,
      // total,
    };
  },

  search({keywords, length}) {
    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      return new Promise(resolve => {
        if(keywords.length == 0) {
          this.getTree((bookmarks) => {
            resolve(bookmarks);
          })
        } else {
          this.query(keywords.join(' '), (bookmarks) => {
            resolve(bookmarks);
          })
        }
      }).then((bookmarks) => {
        this.cacheList = bookmarks;

        this.cacheList.forEach((bookmark, index) => {
          bookmark.type = 'bookmark';
          bookmark.marginLeft = 0;
          bookmark.subTitle = (this.tree.path[bookmark.parentId] ? this.tree.path[bookmark.parentId] : '')
                              + ( bookmark.children ? ' | ' + this.tree.itemCount[ bookmark.id ]
                                + ' | ' + this.tree.bookmarkCount[ bookmark.id ] : '')
          bookmark.index = index;
        });

        return this.cacheList.slice(0, length);
      })
    })
  },
  load({start, length}) {
    // 加载数据
    return new Promise(resolve => {
      resolve(this.cacheList.slice(start, start+length));
    })
  },

  query(keyword, callback) {
    // 使用浏览器自带的查找功能
    chrome.bookmarks.search({query: keyword}, (bookmarks)=>{
      Promise.all(
        // 给文件夹添加补充子树
        bookmarks.filter(bookmark => {
            return bookmark.url == undefined
          }).map(bookmark => {
          return new Promise(resolve => {
            chrome.bookmarks.getSubTree(bookmark.id, subTree => {
              bookmark.children = subTree[0].children;
              resolve();
            })
          })
        })
      ).then(() => {
        // 文件夹排在前面
        bookmarks = bookmarks.sort((a, b)=>{
          return a.url == undefined && b.url == undefined // 两个都是文件夹
                ? 0
                : (
                  a.url != undefined && b.url != undefined // 两个都是书签
                  ? 0
                  : ( a.url == undefined ? -1 : 1 ) // 文件夹排前面（因为这个结果比较少）
                );
        });

        callback(bookmarks);
      })
    })
  },
  getTree(callback) {
    chrome.bookmarks.getTree((bookmarks) => {
      if(bookmarks.length <= 0) {
        callback(bookmarks);
        return;
      }

      let root = bookmarks[0];
      this.rootId = root.id;
      callback(root.children);
    })
  },

  openWindow(index, event) {
    index = this.getRealIndex(index);
    let currentBookmark = this.cacheList[ index ];

    // 打开网页
    if( ! currentBookmark.children) {
      return new Promise(resolve => {
        $open(currentBookmark.url, event, () => {
          resolve();
        });
      })
    }

    // 展开或收起目录
    if(currentBookmark.children.length > 0) {
      return new Promise(resolve => {
        // 展开
        let bookmarks = this.searchExpand(index).map((bookmark, index) => {
          bookmark.type = 'bookmark';
          bookmark.marginLeft = currentBookmark.marginLeft+20;
          bookmark.subTitle = (this.tree.path[bookmark.parentId] ? this.tree.path[bookmark.parentId] : '')
                                + ( bookmark.children ? ' | ' + this.tree.itemCount[ bookmark.id ]
                                  + ' | ' + this.tree.bookmarkCount[ bookmark.id ] : '')

          bookmark.index = currentBookmark.index+'-'+index;
          return bookmark;
        });

        resolve({ type: 'spread', list: bookmarks });
      })
    } else {
      return new Promise(resolve => {
        // 收起
        let collapseTotal = this.searchCollapse(index);
        resolve({ type: 'collapse', length: collapseTotal })
      })
    }
  },

  searchExpand(index) {
    // 搜索列表需要用别的方式打开文件夹

    let expandBookmarks = [];

    // 展开（如果子目录需要展开也会自动展开）
    let stack = [];
    for(let currentIndex = index, endIndex = index; currentIndex <= endIndex; currentIndex++) {
      let bookmark = this.cacheList[currentIndex];
console.log('jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj')
      // 不是目录，跳过
      if( ! bookmark.children) continue;

      // 目录已展开，跳过
      if(bookmark.children.length <= 0) continue;

      // 目录没有被标记展开，跳过（点击不用管状态，非点击需要）
      // if(currentIndex != index && ! this.state[ bookmark.id ]) continue;
      if(currentIndex != index) continue;

      // 展开目录
      expandBookmarks.push(...bookmark.children);
      this.cacheList.splice(currentIndex+1, 0, ...bookmark.children);
      stack.push([currentIndex, bookmark.children.length]);
      endIndex += bookmark.children.length;
      bookmark.count = bookmark.children.length; // 加 count 标记，这个是临时的，会因为搜索而消失
      bookmark.children = [];
    }

    return expandBookmarks;
  },
  searchCollapse(index) {
    // 搜索列表需要用别的方式收起文件夹

    let collapseTotal = 0;

    // 收起（子目录必须收起来，否则再次展开时的count就不对了）
    let stack = [];
    let count = this.cacheList[index].count;
    let lastIndex = index+1;
    let parentIndex = index;

    // 空文件夹是没有count的
    if(count == undefined) return collapseTotal;

    while(true) {
      if(count <= 0) {
        // 收起该层
        let total = lastIndex-(parentIndex+1);
        this.cacheList[parentIndex].children = this.cacheList.splice(parentIndex+1, total);
        collapseTotal += total;

        if(stack.length == 0) break;

        // 回到上层
        [parentIndex, count] = stack.pop();
        lastIndex = lastIndex-total; // parentIndex+1;

        continue;
      }

      let bookmark = this.cacheList[lastIndex];
      count--;

      if(bookmark.children != undefined
      && bookmark.children.length == 0
      && bookmark.count > 0) {
        stack.push([parentIndex, count]);
        count = bookmark.count;
        parentIndex = lastIndex;
      }

      lastIndex++;
    }

    return collapseTotal;
  },

  getRealIndex(i) {
    return this.cacheList.findIndex((bookmark, index) => {
      return bookmark.index == i;
    })
  },
}

export default bookmark;