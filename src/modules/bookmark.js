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

      // marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+20 || 0);
      // marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+this.currentThemeConfig.item_height*2/5 || 0);
      marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+1 || 0); // 按比例来，具体交由 vue 去计算
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
          bookmark.realIndex = index;
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

  up(index, keyType) {
    if(keyType == 'meta/ctrl') {
      let currentIndex = this.getRealIndex(index);
      let currentBookmark = this.cacheList[ currentIndex ];

      // 只跳到父文件，不收起文件夹，体验更佳
      let i = currentIndex-1;
      while(i >= 0 && this.cacheList[i].id != currentBookmark.parentId) i--;

      // 说明已经是到了最顶部，没法再收起了
      if(i < 0) return Promise.resolve();

      return Promise.resolve({ type: 'jump-up', count: currentIndex-i });

//       let currentIndex = this.getRealIndex(index);
//       let currentBookmark = this.cacheList[ currentIndex ];
// console.log('uuuuuuuuuuuuuu', currentIndex, currentBookmark);
//       // 只收起文件夹
//       if(currentBookmark.children && currentBookmark.children.length <= 0) {
//         return this.openWindow(currentBookmark.realIndex, '');
//       } else {
//         let i = currentIndex-1;
//         while(i >= 0 && this.cacheList[i].id != currentBookmark.parentId) i--;

//         // 说明已经是到了最顶部，没法再收起了
//         if(i < 0) return Promise.resolve();
// console.log('uuuuuuuuuuuuuuuuu2', i, this.cacheList[i])

//         return this.openWindow(this.cacheList[i].realIndex, '').then((result) => {
//           return { type: 'jump-up-and-collapse', count: currentIndex-i, length: result.length };
//         })
//       }
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
    let currentBookmark = this.cacheList[ currentIndex ];

    let urls = '';
    let count = 0;
    if( ! currentBookmark.children) {
      urls = currentBookmark.url;
      count = 1;
    } else if(currentBookmark.children.length > 0) { // 未展开
      urls = currentBookmark.children.reduce((accumulator, bookmark) => {
        if(bookmark.parentId != currentBookmark.id) return accumulator;
        if(bookmark.children) return accumulator;

        count++;
        if(count == 1) return bookmark.url;
        else return accumulator+"\n"+bookmark.url;
      }, '');
    } else { // 已展开
      let stack = [];
      let parentId = currentBookmark.id;
      let index = currentIndex+1;
      let list = this.cacheList;
      while(true) {
        if(index >= list.length) break;

        let bookmark = list[index];console.log('copy2', bookmark, parentId, index, list.length);
        if(bookmark.parentId != parentId) {
          // 不相等，说明是从文件夹中出来了
          if(stack.length == 0) {
            // 遍历结束
            console.log('copy_finish', bookmark, parentId, index, list.length);
            break;
          }

          // 取出上一个文件夹
          parentId = stack.pop();
          // index 不能增加
          continue;
        }

        if(bookmark.children) {
          // 子文件夹，需要记录一下 parentId
          console.log('copy_dir', bookmark, parentId);
          stack.push(parentId);
          parentId = bookmark.id;
          console.log('copy_dir2', bookmark, parentId);
        } else {
          // 当前为网页
          if(parentId == currentBookmark.id) {
            count++;
            if(count == 1) urls += bookmark.url;
            else urls += "\n"+bookmark.url;
          }
        }

        index++;
      }
    }

    console.log('copy3', urls, count)
    if(urls == '') return;

    chrome.runtime.sendMessage({
      type: 'copy',
      data: urls,
      count: count,
    })
  },

  openWindow(index, keyType) {
    index = this.getRealIndex(index);
    let currentBookmark = this.cacheList[ index ];

    // 打开网页
    if( ! currentBookmark.children) {
      return new Promise(resolve => {
        $open(currentBookmark.url, keyType, () => {
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
          // bookmark.marginLeft = currentBookmark.marginLeft+20;
          // bookmark.marginLeft = currentBookmark.marginLeft+this.currentThemeConfig.item_height*2/5;
          bookmark.marginLeft = currentBookmark.marginLeft+1; // 按比例来，具体交由 vue 去计算
          bookmark.subTitle = (this.tree.path[bookmark.parentId] ? this.tree.path[bookmark.parentId] : '')
                                + ( bookmark.children ? ' | ' + this.tree.itemCount[ bookmark.id ]
                                  + ' | ' + this.tree.bookmarkCount[ bookmark.id ] : '')

          bookmark.realIndex = currentBookmark.realIndex+'-'+index;
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
      return bookmark.realIndex == i;
    })
  },
}

export default bookmark;