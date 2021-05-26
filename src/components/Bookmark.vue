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
            marginLeft: tree.marginLeft[item.id]+'px' }">
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
            v-if="isSelected && tree.path[item.parentId]"
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color }">{{ tree.path[item.parentId] + (item.children ? ' | ' + tree.count[item.id] : '') }}</div>
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

      page: 0,
      currentIndex: -1,

      isSearched: false,
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
      let count = {};
      this.list.forEach((bookmark) => {
        // marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+(this.config.item_height-10) || 0);
        marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+20 || 0);

        path[bookmark.id] = (path[bookmark.parentId] != undefined ? path[bookmark.parentId] : '')+'/'+bookmark.title;

        count[bookmark.id] = bookmark.children == undefined
                            ? 0
                            : bookmark.children.reduce((accumulator, b) => {
                              return accumulator+(b.parentId == bookmark.id ? 1 : 0);
                            }, 0);
        count[bookmark.parentId]++; // 展开后上层算出来肯定是0，就让子目录来计算吧
      })
      console.log({marginLeft, path, count});
      return {
        marginLeft,
        path,
        count
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

      this.list = this.originList;

      // // 查找
      // let filterList = this.originList.filter(bookmark => {
      //   // if(bookmark.url == undefined) return false;

      //   let title = bookmark.title.toUpperCase();
      //   let url = bookmark.url.toUpperCase();
      //   for(let keyword of this.storageKeyword.toUpperCase().split(/\s+/)) {
      //     if(title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1) {
      //       return false;
      //     }
      //   }
      //   return true;
      // })

      // // 列表赋值
      // this.cacheList = filterList;
      // this.list = this.cacheList.slice(0, this.config.list_page_count);
      // this.page = 1;

      // this.scrollDisabled = this.list.length >= this.cacheList.length;
      // this.currentIndex = 0;

      // // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      // this.isSearched = true;
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
        let bookmarks = this.currentBookmark.children.splice(0, this.currentBookmark.children.length);
        this.list.splice(this.currentIndex+1, 0, ...bookmarks);
        console.log('展开', this.list.length)
      } else {
        // 收起
        let map = [];
        let lastIndex = this.currentIndex+1;
        let id = this.currentBookmark.id;
        while(lastIndex < this.list.length) {
          if(this.list[lastIndex].parentId != id) {
            if(map.length == 0) break;

            id = map.pop();
            continue;
          }

          if(this.list[lastIndex].children != undefined
          && this.list[lastIndex].children.length == 0) {
            map.push(id);
            id = this.list[lastIndex].id;
          }

          lastIndex++;
        }

        let count = lastIndex-(this.currentIndex+1);
        this.currentBookmark.children = this.list.splice(this.currentIndex+1, count);
        console.log('收起', this.list.length, this.currentIndex+1, lastIndex, count)
      }

      this.focus();
    },

    // expand(folder) {
    //   let bookmark;
    //   let list = [];
    //   while(bookmark = folder.children.shift()) {
    //     if(bookmark.father == undefined) {
    //       bookmark.father = folder;
    //     }
    //     list.push(bookmark);
    //   }
    //   return list;
    // },

    // test(bookmark, list, marginLeft, path) {
    //   marginLeft = marginLeft == undefined ? 0 : marginLeft;
    //   path = path == undefined ? '' : path;

    //   list.push(bookmark);

    //   // list.push({
    //   //   // isFolder: bookmark.children ? true : false,

    //   //   id: bookmark.id,
    //   //   parentId: bookmark.parentId,
    //   //   title: bookmark.title,
    //   //   url: bookmark.url,
    //   //   marginLeft: marginLeft,
    //   //   path: path,

    //   //   children: bookmark.children,
    //   // });

    //   if( ! bookmark.children) return;

    //   // for(let b of bookmark.children) {
    //   //   this.test(b, list, marginLeft+10, path+'/'+bookmark.title);
    //   // }
    // }
  },
  mounted() {
    // todo
    window.b = this;


    chrome.bookmarks.getTree((bookmarks) => {
      console.log(bookmarks)
      // this.originList = bookmarks[0];

      // this.test(bookmarks[0].children[0], this.originList)
      // this.test(bookmarks[0].children[1], this.originList)

      // this.originList = this.expand(bookmarks[0]);
      this.originList.push(...bookmarks[0].children);
      console.log(this.originList);

      this.$emit('finish');
    })

    // 查找
    // chrome.bookmarks.search({}, (bookmarks)=>{
    //   // 过滤掉文件夹
    //   bookmarks = bookmarks.filter(bookmark => {
    //     if(bookmark.url == undefined) {
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   })

    //   // 最近添加的排在最前面
    //   bookmarks = bookmarks.sort((a, b)=>{
    //     return b.dateAdded-a.dateAdded;
    //   });

    //   this.originList = bookmarks;

    //   this.$emit('finish');

    //   // 更新列表
    //   // this.search();
    // })
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
