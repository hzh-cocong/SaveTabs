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
        <div>{{ lang('bookmarkCountTip')+originList.length+lang('bookmarkCountTip2') }}</div>
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
            marginLeft: originTree.marginLeft[item.id]+'px' }">
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
            }}</div>
          <div
            v-if="isSelected && originTree.path[item.parentId]"
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color }">{{ originTree.path[item.parentId] + (item.children ? ' | ' + originTree.count[item.id] : '') }}</div>
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

      state: {},
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
    // tree() {
    //   let marginLeft = {};
    //   let path = {};
    //   let count = {};
    //   this.list.forEach((bookmark) => {
    //     // marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+(this.config.item_height-10) || 0);
    //     marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+20 || 0);

    //     path[bookmark.id] = (path[bookmark.parentId] != undefined ? path[bookmark.parentId] : '')+'/'+bookmark.title;

    //     count[bookmark.id] = bookmark.children == undefined
    //                         ? 0
    //                         : bookmark.children.reduce((accumulator, b) => {
    //                           return accumulator+(b.parentId == bookmark.id ? 1 : 0);
    //                         }, 0);
    //     count[bookmark.parentId]++; // 展开后上层算出来肯定是0，就让子目录来计算吧
    //   })
    //   console.log({marginLeft, path, count});
    //   return {
    //     marginLeft,
    //     path,
    //     count
    //   };
    // },

    originTree() {
      let marginLeft = {};
      let path = {};
      let count = {};
      let total = 0;

      let map = [];
      let index = 0;
      let list = this.originList;
      while(true) {
        if(index >= list.length) {
          if(map.length == 0) break;

          [list, index] = map.pop();
          index++;
          continue;
        }

        let bookmark = list[index];

        marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+20 || 0); //
        path[bookmark.id] = (path[bookmark.parentId] != undefined ? path[bookmark.parentId] : '')+'/'+bookmark.title;
        count[bookmark.parentId] == undefined ? count[bookmark.parentId] = 1 : count[bookmark.parentId]++;
        if(bookmark.children == undefined) total++;

        if(bookmark.children == undefined || bookmark.children == 0) {
          // 非目录或目录已展开，则继续往下遍历

          index++;
        } else {
          // 存在子目录且未展开，则进入到子目录

          // 先保存当前状态
          map.push([list, index]);

          // 开始遍历子目录
          list = bookmark.children;
          index = 0;
        }
      }

      console.log('tttttttttttttt', { marginLeft, path, count, total })
      return {
        marginLeft, //
        path,
        count,
        total,
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
        // 过滤掉文件夹
        Promise.all(
          bookmarks.filter(bookmark => bookmark.url == undefined).map(bookmark => {
            console.log('ffffff', bookmark.id)
            return new Promise(resolve => {
              chrome.bookmarks.getSubTree(bookmark.id, tree => {
                console.log('fffffffff2', tree)
                bookmark.children = tree[0].children;
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

    expand(list, index, isClick) {
      // 展开（如果子目录需要展开也会自动展开）

      console.log('sssss', index);
      let parentId = list[index].parentId;
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
      let map = [];
      let lastIndex = index+1;
      let id = list[index].id;
      while(lastIndex < list.length) {
        if(list[lastIndex].parentId != id) {
          if(map.length == 0) break;

          id = map.pop();
          continue;
        }

        if(list[lastIndex].children != undefined
        && list[lastIndex].children.length == 0) {
          map.push(id);
          id = list[lastIndex].id;
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

          this.originList.push(...bookmarks[0].children);
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
