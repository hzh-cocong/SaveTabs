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
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
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
            <!-- <div slot="placeholder" class="image-slot">
              <img
                v-if="index >= config.item_show_count"
                src="../assets/fallback.png"
                style="width:100%; height: 100%;" />
            </div> -->
          </el-image>
        </span>

        <div class="main">
          <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }">{{
                item.title
            }}</div>
          <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color }">{{ item.url }}</div>
        </div>

        <div class="right">
          <span
            v-if="isSelected"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_focus_keymap_color,
            }">↩</span>
          <span
            v-else-if="platform != ''
              && (index-$refs.list.scrollLines+1) <= config.item_show_count
              && (index-$refs.list.scrollLines+1) >= 1
              && (index-$refs.list.scrollLines+1) <= 9"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_keymap_color,
            }">{{
                platform == 'Win'
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
import Sortable from 'sortablejs';

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

      // 查找
      let filterList = this.originList.filter(bookmark => {
        // if(bookmark.url == undefined) return false;

        let title = bookmark.title.toUpperCase();
        let url = bookmark.url.toUpperCase();
        for(let keyword of this.storageKeyword.toUpperCase().split(/\s+/)) {
          if(title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      // 列表赋值
      this.cacheList = filterList;
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.page = 1;

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      this.currentIndex = 0;

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
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
      let bookmark = this.list[ this.currentIndex ];
      this.$open(bookmark.url);
    }
  },
  mounted() {
    // 查找
    chrome.bookmarks.search({}, (bookmarks)=>{
      // 过滤掉文件夹
      bookmarks = bookmarks.filter(bookmark => {
        if(bookmark.url == undefined) {
          return false;
        } else {
          return true;
        }
      })

      // 最近添加的排在最前面
      bookmarks = bookmarks.sort((a, b)=>{
        return b.dateAdded-a.dateAdded;
      });

      this.originList = bookmarks;

      this.$emit('finish');

      // 更新列表
      // this.search();


      //创建拖拽对象
      // this.sortable =
      Sortable.create(document.querySelector('.list'), {
        // sort: this.isEditOrder, //是否可进行拖拽排序
        animation: 150,
        // 过滤器，不需要进行拖动的元素
        // filter: ".disabled",
        // ghostClass: 'ghost',
        // draggable: '.enabled',
        chosenClass: 'chosen',
        //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
        onEnd: ({ newIndex, oldIndex }) => {
          console.log(newIndex, oldIndex)
          // if(newIndex == oldIndex) {
          //   return;
          // }
          // if(newIndex >= this.workspacesConfig.workspaces.length) {
          //   newIndex = this.workspacesConfig.workspaces.length-1;
          // }
          // this.workspacesConfig.workspaces.splice(newIndex, 0, this.workspacesConfig.workspaces.splice(oldIndex , 1)[0]);

          // this.updateWorkspace();
        }
      })

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
