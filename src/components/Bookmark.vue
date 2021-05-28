<template>
  <div>

  <el-alert
    type="info"
    :closable="false"
    show-icon
    v-if="isSearched && list.length == 0"
    style="margin: 0 10px;"
    :style="{ width: (config.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (config.width-70)+'px' }">
      <div style="flex:1;">
        <div>{{ lang('bookmarkNoResult') }}</div>
        <div>{{ lang('bookmarkCountTip')+tree.bookmarkCount[rootId]+lang('bookmarkCountTip2') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise')"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews')"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other')"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color,
          color: isSelected
                ? config.list_focus_font_color
                : config.list_font_color
        }"
        @click="$event.stopPropagation();currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px',
            marginLeft: (storageKeyword == ''
                      ? tree.marginLeft[item.id]
                      : ( list.length - index <= searchFolderBoundary
                        ? 0
                        : searchTree.marginLeft[index])
                      )+'px' }">
          <template v-if="isLoad">
            <img
              v-if="item.children && item.children.length > 0"
              src="../assets/folder.png"
              style="width:100%; height: 100%;" />
            <img
              v-else-if="item.children && item.children.length <= 0"
              src="../assets/folder-opened.png"
              style="width:100%; height: 100%;" />
            <el-image
              v-else
              :src="getIcon('', item.url, config.item_height-20)"
              style="width:100%; height: 100%;"
              fit="cover"
              :lazy="index >= config.item_show_count">
              <div slot="error" class="image-slot">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder" class="image-slot">
                <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
            </el-image>
          </template>
        </span>

        <div class="main">
          <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }">{{
                item.title
                + ( ! isSelected || tree.path[item.parentId]
                  ? ''
                  : ' (' +tree.bookmarkCount[item.id]+') ')
            }}</div>
          <div
            v-if="isSelected && tree.path[item.parentId]"
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color }">
            {{  (tree.path[item.parentId] ? tree.path[item.parentId] : '')
              + (item.children ? ' | '+tree.itemCount[item.id] + ' | ' + tree.bookmarkCount[item.id] : '') }}
          </div>
        </div>

        <div class="right">
          <span
            v-if="isSelected"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_focus_keymap_color,
            }">↩</span>
          <span
            v-else-if="_device.platform != ''
              && (index-$refs.list.scrollLines+1) <= config.item_show_count
              && (index-$refs.list.scrollLines+1) >= 1
              && (index-$refs.list.scrollLines+1) <= 9"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_keymap_color,
            }">{{
                _device.platform == 'Win'
              ?  'Alt+'+(index-$refs.list.scrollLines+1)
              : '⌘'+(index-$refs.list.scrollLines+1)
              }}</span>
        </div>

      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from './List.vue'
// import Sortable from 'sortablejs';

export default {
  name: 'Bookmark',
  inject: ['focus'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    platform: {
      type: String,
      required: false,
      default: '',
    }
  },
  data() {
    return {
      list: [],
      cacheList: [],
      originList: [],

      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,

      rootId: -1,
      state: {},

      searchFolderBoundary: -1,
    }
  },
  components: {
    List,
  },
  computed: {
    currentBookmark() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    tree() {
      let marginLeft = {};
      let path = {};
      let itemCount = {};
      // let total = 0;
      let bookmarkCount = {};
let a = new Date().getTime();
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
            console.log('88888888888', JSON.stringify(childrenStack))
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

      console.log('88888888888', JSON.stringify(childrenStack))
      if(childrenStack.length > 0) console.error('不可能出现', childrenStack);

let b = new Date().getTime();
      console.log('tttttttttttttt', (b-a)/1000, { marginLeft, path, itemCount, bookmarkCount })
      return {
        marginLeft, //
        path,
        itemCount,
        bookmarkCount,
        // total,
      };
    },

    searchTree() {
      console.log('searchTree')

      let marginLeft = {};
      let stack = [];
      let lastMarginLeft = 0;
      let count = 0;
      for(let index = 0; index < this.list.length; index++) {
        let bookmark = this.list[index];

        if(count > 0) count--;

        marginLeft[ index ] = lastMarginLeft;

        if(bookmark.count != undefined && bookmark.children.length <= 0) {
          console.log('searchTree:push', JSON.stringify(stack));
          stack.push([lastMarginLeft, count]);
          lastMarginLeft += 20;
          count = bookmark.count;
        }

        while(count <= 0 && stack.length > 0) {
          console.log('searchTree:pop', JSON.stringify(stack));
          [lastMarginLeft, count] = stack.pop();
        }
      }

      console.log({marginLeft});
      return {
        marginLeft,
      };
    },
  },
  methods: {
    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },
    search(keyword) {
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;

      this.storageKeyword = keyword.trim();

      if(this.storageKeyword.length == 0) {
        this.list = this.originList;

        this.currentIndex = 0;

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;

        return;
      }

      // 使用浏览器自带的查找功能
      chrome.bookmarks.search({query: this.storageKeyword}, (bookmarks)=>{
        console.log('chrome.bookmarks.search', bookmarks);
        Promise.all(
          // 给文件夹添加补充子树
          bookmarks.filter(bookmark => {
              return bookmark.url == undefined
            }).map(bookmark => {
            console.log('ffffff', bookmark.id)
            return new Promise(resolve => {
              chrome.bookmarks.getSubTree(bookmark.id, subTree => {
                console.log('fffffffff2', subTree)
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

          let searchFolderCount = bookmarks.findIndex(bookmark => {
            return bookmark.url != undefined;
          });
          this.searchFolderBoundary = bookmarks.length-searchFolderCount;
          console.log('searchFolderBoundary', this.searchFolderBoundary, bookmarks.length, searchFolderCount);

          this.list = bookmarks;
          this.currentIndex = 0;
        })
      })
    },
    load() {
      let data = this.cacheList.slice(this.page*this.config.list_page_count, (this.page+1)*this.config.list_page_count);
      if(data.length <= 0) {
        this.scrollDisabled = true;
        return;
      }

      this.list.push(...data);
      this.page++;
      this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    openWindow(index) {
      if(index == undefined) {
        this._openWindow();
        return;
      }

      let currentIndex = index+this.$refs.list.scrollLines-1;
      if(currentIndex >= this.list.length || index > this.config.item_show_count) {
        return;
      }

      this.currentIndex = currentIndex;
      this._openWindow();
    },
    _openWindow() {
      // 列表为空
      if(this.currentBookmark == null) return;

      // 打开网页
      if( ! this.currentBookmark.children) {
        this.$open(this.currentBookmark.url);
        return;
      }

      // 搜索列表需要用别的方式展开或收起目录
      if(this.storageKeyword != '') {
        // 展开或收起目录
        if(this.currentBookmark.children.length > 0) {
          // 展开
          this.searchExpand(this.list, this.currentIndex);
        } else {
          // 收起
          this.searchCollapse(this.list, this.currentIndex);
        }
        this.focus();
        return;
      }

      // 展开或收起目录
      if(this.currentBookmark.children.length > 0) {
        // 展开

        // 先存储再去操作，因为列表有可能会发生滚动
        this.state[ this.currentBookmark.id ] = true;
        chrome.storage.local.set({'bookmark': { state: this.state }}, () => {

        });

        this.expand(this.list, this.currentIndex, true);
      } else {
        // 收起

        // 先存储再去操作，因为列表有可能会发生滚动
        // this.state[ this.currentBookmark.id ] = false;
        delete this.state[ this.currentBookmark.id ]
        chrome.storage.local.set({'bookmark': { state: this.state }}, () => {

        });

        this.collapse(this.list, this.currentIndex);
      }

      this.focus();
    },

    searchExpand(list, index) {
      // 搜索列表需要用别的方式打开文件夹

      // 展开（如果子目录需要展开也会自动展开）
      let endIndex = index;
      let stack = [];
      for(let currentIndex = index, endIndex = index; currentIndex <= endIndex; currentIndex++) {
        let bookmark = list[currentIndex];

        // 不是目录，跳过
        if( ! bookmark.children) continue;

        // 目录已展开，跳过
        if(bookmark.children.length <= 0) continue;

        // 目录没有被标记展开，跳过（点击不用管状态，非点击需要）
        // if(currentIndex != index && ! this.state[ bookmark.id ]) continue;
        if(currentIndex != index) continue;

        // 展开目录
        list.splice(currentIndex+1, 0, ...bookmark.children);
        stack.push([currentIndex, bookmark.children.length]);
        endIndex += bookmark.children.length;
        bookmark.count = bookmark.children.length; // 加 count 标记，这个是临时的，会因为搜索而消失
        bookmark.children = [];
      }
    },
    searchCollapse(list, index) {
      // 搜索列表需要用别的方式收起文件夹

      // 收起（子目录必须收起来，否则再次展开时的count就不对了）
      let stack = [];
      let count = list[index].count;
      let lastIndex = index+1;
      let parentIndex = index;

      // 空文件夹是没有count的
      if(count == undefined) return;

      while(true) {
        if(count <= 0) {
          // 收起该层
          console.log('收起1', lastIndex, parentIndex+1, lastIndex-(parentIndex+1), list[parentIndex].title);
          let total = lastIndex-(parentIndex+1);
          list[parentIndex].children = list.splice(parentIndex+1, total);
          console.log('收起2', lastIndex, parentIndex+1, total);

          if(stack.length == 0) break;

          // 回到上层
          [parentIndex, count] = stack.pop();
          lastIndex = lastIndex-total; // parentIndex+1;

          continue;
        }

        let bookmark = list[lastIndex];
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
    },

    expand(list, index, isClick) {
      // 展开（如果子目录需要展开也会自动展开）

      console.log('sssss', index);
      let parentId = list.length <= 0 ? -1 : list[index].parentId;
      for(let currentIndex = index; currentIndex < list.length; currentIndex++) {
        console.log('expand')
        let bookmark = list[currentIndex];

        // 和一开始的目录同级，说明超出了，结束（被点对象除外）
        if(currentIndex != index && bookmark.parentId == parentId) break;

        // 不是目录，跳过
        if( ! bookmark.children) continue;

        // 目录已展开，跳过
        if(bookmark.children.length <= 0) continue;

        // 目录没有被标记展开，跳过（点击不用管状态，非点击需要）
        if((currentIndex == index && ! isClick && ! this.state[ bookmark.id ])
        || (currentIndex != index && ! this.state[ bookmark.id ])) continue;

        // 展开目录
        list.splice(currentIndex+1, 0, ...bookmark.children);
        bookmark.children = [];
      }
    },
    collapse(list, index) {
      // 收起（不自动收起子目录，可以提高效率）
      let stack = [];
      let parentId = list[index].id;
      let lastIndex = index+1;
      while(lastIndex < list.length) {
        let bookmark = list[lastIndex];

        if(bookmark.parentId != parentId) {
          if(stack.length == 0) break;

          parentId = stack.pop();
          continue;
        }

        if(bookmark.children != undefined
        && bookmark.children.length == 0) {
          stack.push(parentId);
          parentId = bookmark.id;
        }

        lastIndex++;
      }

      let count = lastIndex-(index+1);
      list[index].children = list.splice(index+1, count);
      console.log('收起', list.length, index+1, lastIndex, count)
    },
  },
  mounted() {
    // todo
    window.b = this;

    Promise.all([
      new Promise((resolve) => {
        chrome.bookmarks.getTree((bookmarks) => {
          console.log(bookmarks)

          if(bookmarks.length <= 0) {
            console.error('不太可能出现', bookmarks)
            resolve();
            return;
          }

          let root = bookmarks[0];
          this.rootId = root.id;
          this.originList.push(...root.children);
          console.log(this.originList);

          resolve();
        })
      }),
      new Promise((resolve) => {
        // 获取书签打开状态
        chrome.storage.local.get({'bookmark': { state: {}}}, items => {
          this.state = items.bookmark.state;
          resolve();
        });
      }),
    ]).then(() => {
      console.log('state', this.state);

      this.expand(this.originList, 0, false);

      this.$emit('finish');
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;

  /* 禁止选择 */
  -moz-user-select:none; /*火狐*/
  -webkit-user-select:none; /*webkit浏览器*/
  -ms-user-select:none; /*IE10*/
  -khtml-user-select:none; /*早期浏览器*/
  user-select:none;
}
.item .left {
  padding: 10px;
  text-align: center;
}
.item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  flex-direction: column;
  /* justify-content: space-evenly; */
  justify-content: center;
}
.item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item .right {
  /* border: 1px solid black; */
  margin-left: 10px;
  margin-right: 10px;
  font-size: 12px;
  text-align: right;

  height: 100%;
  display:flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.el-badge {
    /* margin-right: 5px; */
    border-color: inherit !important;
}
.el-badge.refresh {
    margin-left: 10px;
}


</style>
