<template>
  <div class="bookmark">

  <el-alert
    v-if="isSearched && list.length == 0"
    type="info"
    :closable="false"
    show-icon
    style="margin: 0 10px;"
    :style="{ width: (currentThemeConfig.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (currentThemeConfig.width-70)+'px' }">
      <div style="flex:1;">
        <div>{{ lang('bookmarkNoResult') }}</div>
        <div>{{ lang('bookmarkCountTip')+tree.bookmarkCount[rootId]+lang('bookmarkCountTip2') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise', $event)"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews', $event)"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other', $event)"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :listLength="list.length"
    :itemHeight="currentThemeConfig.item_height"
    :itemShowCount="itemShowCount || 1"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="currentThemeConfig.list_scrollbar_color"
    :scrollbarFocusColor="currentThemeConfig.list_scrollbar_focus_color"
    :itemStyle="itemStyle"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @itemClick="_openWindow(getKeyType($event))"
    @scrollEnd="scrollEnd">
    <template
      v-if=" ! workspaceSwitch"
      #default="{ index, item, isActive, isSelected }">
      <span
        class="left"
        :style="{
          width: currentThemeConfig.item_height+'px',
          padding: (currentThemeConfig.item_height*1/5)+'px',
          marginLeft: (storageKeyword == ''
                    ? tree.marginLeft[item.id]
                    : searchTree.marginLeft[index])+'px' }">
        <template v-if="isLoad">
          <img
            v-if="item.children && item.children.length > 0"
            src="@/assets/folder.png"
            style="width:100%; height: 100%;" />
          <img
            v-else-if="item.children && item.children.length <= 0"
            src="@/assets/folder-opened.png"
            style="width:100%; height: 100%;" />
          <el-image
            v-else
            :src="iconMap[index]"
            style="width:100%; height: 100%;"
            fit="cover"
            :scroll-container="$refs.list.$el"
            :lazy="index >= currentThemeConfig.item_show_count">
            <div slot="error" class="image-slot">
              <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot">
              <!-- <img src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
            </div>
          </el-image>
        </template>
      </span>

      <div class="main">
        <template v-if="storageKeyword == ''">
          <div
            class="title"
            :style="{ fontSize: currentThemeConfig.list_font_size+'px' }">{{
                item.title
                + ( ! isSelected || tree.path[item.parentId]
                  ? ''
                  : ' (' +tree.bookmarkCount[item.id]+') ')
            }}</div>
        </template>
        <template v-else>
          <span
            class="title"
            :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
            v-html="highlightMap[index].title"></span>
        </template>

          <!-- v-if="tree.path[item.parentId] && (isSelected || storageKeyword != '')" -->
        <div
          v-if="(isSelected && keyType != '')
              || (tree.path[item.parentId] && (isSelected || storageKeyword != ''))"
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: isSelected
                  ? currentThemeConfig.list_explain_focus_font_color
                  : currentThemeConfig.list_explain_font_color }"
          v-html="isSelected && keyType != ''
                  ? getTip()
                  : ( isSelected && storageKeyword != '' && ! item.children
                    ? highlightMap[index].url
                    : (tree.path[item.parentId] ? tree.path[item.parentId] : '')
                    + (item.children
                      ? ' | '+tree.itemCount[item.id] + ' | ' + tree.bookmarkCount[item.id]
                      : '')
                  )"></div>
      </div>

      <div class="right">
        <span
          v-if="isSelected"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.list_focus_keymap_color,
          }">↩</span>
        <span
          v-else-if="_device.platform != ''"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.item_show_count > 9 && index-$refs.list.scrollLines+1 > 9
                  ? 'transparent'
                  : currentThemeConfig.list_keymap_color }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }"
            >{{ index-$refs.list.scrollLines+1 < 1
              ? 1
              : Math.min(index-$refs.list.scrollLines+1, currentThemeConfig.item_show_count, 9) }}</font>
        </span>
      </div>
    </template>
    <template
      v-else
      #default="{ index, item, isActive, isSelected }">
      <span
        class="left"
        :style="{
          width: currentThemeConfig.item_height+'px',
          padding: (currentThemeConfig.item_height*1/5)+'px' }">
        <svg-icon
          :name="item.svg"
          style="width:100%; height: 100%;"
          :style="{ color: isSelected
                          ? currentThemeConfig.list_focus_icon_color
                          : currentThemeConfig.list_icon_color, }"></svg-icon>
      </span>

      <div class="main">
        <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="highlight(item.name, storageKeyword.substr(config.workspace_change_word.length).trim().split(/\s+/)[0], '<strong>', '</strong>')"></div>
        <div
          v-if="isSelected && item.tip != ''"
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: isSelected
                  ? currentThemeConfig.list_explain_focus_font_color
                  : currentThemeConfig.list_explain_font_color }"
            v-html="item.tip"></div>
      </div>

      <div class="right">
        <span
          v-if="isSelected"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.list_focus_keymap_color,
          }">↩</span>
        <span
          v-else-if="_device.platform != ''"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.item_show_count > 9 && index-$refs.list.scrollLines+1 > 9
                  ? 'transparent'
                  : currentThemeConfig.list_keymap_color }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }"
            >{{ index-$refs.list.scrollLines+1 < 1
              ? 1
              : Math.min(index-$refs.list.scrollLines+1, currentThemeConfig.item_show_count, 9) }}</font>
        </span>
      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from '../common/List.vue'

export default {
  name: 'Bookmark',
  inject: ['input', 'statusTip'],
  props: {
    config: {
      type: Object,
      required: true,
    },
    currentThemeConfig: {
      type: Object,
      required: true,
    },
    projectConfig: {
      type: Object,
      required: true,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    bookmark: {
      type: Object,
      required: false,
      default: function() {
        return {}
      },
    },
    keyType: {
      type: String,
      required: false,
      default: '',
    },
    activeWorkspace: {
      type: Object,
      required: true,
    },
    openWay: {
      type: String,
      required: false,
      default: '',
    },
    keymap: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
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
      isSearching: true,

      rootId: -1,
      state: {},
      position: {
        currentIndex: 0, // -1 就是会导致到顶反弹
        visiualIndex: 0,
      },

      w: {
        timer: null,
        times: 0,
      },
    }
  },
  components: {
    List,
  },
  watch: {
    currentIndex(newVal, oldVal) {
      if( ! this.isSearching) {
        // this.position.visiualIndex = this.$refs.list.visiualIndex; // 此时 visiualIndex 那边拿到的 currentIndex 还是老的
        this.positionRecord(newVal, newVal-this.$refs.list.scrollLines);
      }
    },
    "bookmark.visible": function(newVal, oldVal) {
      console.log('bookmark.visible', newVal, oldVal);
      this.search();
    },
    "bookmark.fold": function(newVal, oldVal) {
      console.log('bookmark.fold', newVal, oldVal);
      if( ! this.bookmark.fold) return;

      this.fold(0);
      this.bookmark.fold = false;
    },
    "bookmark.unfold": function(newVal, oldVal) {
      console.log('bookmark.unfold', newVal, oldVal);
      if( ! this.bookmark.unfold) return;

      this.unfold();
      this.bookmark.unfold = false;
    },

    // cacheList(newVal, oldVal) {
    //   console.log('watch:cacheList', newVal, oldVal)
    //   this.$emit('update:searchTotal', newVal.length)
    // },
    list(newVal, oldVal) {
      console.log('watch:list', newVal, oldVal)
      this.$emit('update:listCount', newVal.length)
    },

    workspaceSwitch(newVal, oldVal) {
      if(newVal) {
        let keymap = this.keymap['open_workspace_bookmark']
                    ? ' ('+this.keymap['open_workspace_bookmark']+')'
                    : ''
        this.statusTip('bookmark'+keymap, true, 3000);
      }
    },
  },
  computed: {
    isNoSearch() {
      return this.currentThemeConfig.height_auto
          && this.storageKeyword == ''
          && this.openWay == 'popup'
          && ! this.bookmark.visible;
    },
    listPageCount() {
      if(this.itemShowCount <= 0) return 0;
      console.log('bookmark.listPageCount')

      return  this.isNoSearch
            ? this.currentThemeConfig.no_search_list_page_count
            : this.currentThemeConfig.list_page_count
    },
    itemShowCount() {
      console.log('bookmark.watch.itemShowCount', this.isNoSearch)
      return  this.isNoSearch
            ? this.currentThemeConfig.no_search_item_show_count
            : this.currentThemeConfig.item_show_count
    },

    workspaceSwitch() {
      return ! ( this.storageKeyword == undefined
              || this.config.workspace_change_word == undefined
              || this.config.workspace_change_word.length == 0
              || this.storageKeyword.startsWith(this.config.workspace_change_word) == false);
    },
    workspaceList() {
      return this.config.workspaces.filter(
        workspace => workspace != 'bookmark'
      ).map(workspace => ({
        type: workspace,
        name: this.lang(workspace) + ( this.lang(workspace) == workspace ? '' : ` (${workspace}) `),
        svg: this.projectConfig.allWorkspaces[ workspace ].svg,
      }));
    },
    workspaceStorageKeyword() {
      return this.storageKeyword.substr(this.config.workspace_change_word.length).trim();
    },

    iconMap() {
      console.log('getIcon:iconMap');
      let a = new Date().getTime();

      let ss = this.list.map((item, index) => {
        return this.getIcon('', item.url, this.currentThemeConfig.item_height*3/5);
      })
      let b = new Date().getTime();
      console.log('getIcon:iconMap', (b-a)/1000);

      return ss;
    },
    highlightMap() {
      console.log('bookmark.highlightMap')

      let a = new Date().getTime();

      // 书签自带的搜索系统是按字搜索的，相邻的字存在顺序关系，空格隔开的则没有，这里暂时加空格处理
      // let storageKeyword = this.storageKeyword.split('').join(' ');
      // 上面说的不对，书签自带的搜索目前观察是英文连着但中文拆开
      let storageKeyword = this.storageKeyword.replace(/([^0-9A-Za-z\s])/g, ' $1 ')

      // 速度非常非常快，无需再缓存优化
      // 这种实现方式非常简单，而且改造方便，并且兼容所有可能情况，如修改标题
      let highlightMap = new Array(this.list.length);
      this.list.forEach((item, index) => {
        highlightMap[ index ] = {
          title: this.highlight(item.title, storageKeyword, '<strong>', '</strong>'),
          url: item.children ? '' : this.highlight(item.url, storageKeyword, '<strong>', '</strong>')
        }
      });

      let b = new Date().getTime();

      console.log('bookmark.highlightMap', (b-a)/1000);

      return highlightMap;
    },

    currentBookmark() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    tree() {
console.log('computed:tree')
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

        // marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+20 || 0);
        marginLeft[bookmark.id] = (marginLeft[bookmark.parentId]+this.currentThemeConfig.item_height*2/5 || 0);
        path[bookmark.id] = (path[bookmark.parentId] != undefined ? path[bookmark.parentId] : '')+'/'+bookmark.title.escape(); // 防注入
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

      let marginLeft = new Array(this.list.length);
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
          lastMarginLeft += this.currentThemeConfig.item_height*2/5; // 20;
          count = bookmark.count;
        }

        while(count <= 0 && stack.length > 0) {
          console.log('searchTree:pop', JSON.stringify(stack));
          [lastMarginLeft, count] = stack.pop();
        }
      }

      console.log('computed:searchTree', {marginLeft});
      return {
        marginLeft,
      };
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'temporary';
    }
  },
  methods: {
    itemStyle({ index, item, isActive, isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
      if(isSelected) {
        return {
          'background-color': this.currentThemeConfig.list_focus_background_color,
          'color': this.currentThemeConfig.list_focus_font_color,
          '--list-highlight-color': this.currentThemeConfig.list_focus_highlight_color,
          '--list-highlight-weight': this.currentThemeConfig.list_focus_highlight_weight,
          '--list-explain-highlight-color': this.currentThemeConfig.list_explain_focus_highlight_color,
          '--list-explain-highlight-weight': this.currentThemeConfig.list_explain_focus_highlight_weight,
        }
      } else {
        return {
          'background-color': this.currentThemeConfig.list_background_color,
          'color': this.currentThemeConfig.list_font_color,
          '--list-highlight-color': this.currentThemeConfig.list_highlight_color,
          '--list-highlight-weight': this.currentThemeConfig.list_highlight_weight,
          '--list-explain-highlight-color': this.currentThemeConfig.list_explain_highlight_color,
          '--list-explain-highlight-weight': this.currentThemeConfig.list_explain_highlight_weight,
        }
      }
    },

    up(keyType) {
      if(keyType == 'meta/ctrl') {
        if(this.workspaceSwitch) return;
        if(this.currentBookmark == null) return;

        // 只跳到父文件，不收起文件夹，体验更佳
        let i = this.currentIndex-1;
        while(i >= 0 && this.list[i].id != this.currentBookmark.parentId) i--;

        // 说明已经是到了最顶部，没法再收起了
        if(i < 0) return;

        this.currentIndex = i;

        // // 只收起文件夹
        // if(this.currentBookmark.children && this.currentBookmark.children.length <= 0) {
        //   this._openWindow('');
        // } else {
        //   let i = this.currentIndex-1;
        //   while(i >= 0 && this.list[i].id != this.currentBookmark.parentId) i--;

        //   // 说明已经是到了最顶部，没法再收起了
        //   if(i < 0) return;

        //   this.currentIndex = i;
        //   this._openWindow('');
        // }
      } else {
        this.currentIndex--;
      }
    },
    down(keyType) {
      if(keyType == 'meta/ctrl') {
        // 这个操作和鼠标点击或者直接回车是差不多的，区别是 keyType 会被强制为默认的
        this._openWindow('');
      } else {
        this.currentIndex++;
      }
    },
    copy() {
      console.log('copy', this.currentBookmark)

      if(this.currentBookmark == null) return;

      // 工作区切换
      if(this.workspaceSwitch) return

      let urls = '';
      let count = 0;
      if( ! this.currentBookmark.children) {
        urls = this.currentBookmark.url;
        count = 1;
      } else if(this.currentBookmark.children.length > 0) { // 未展开
        urls = this.currentBookmark.children.reduce((accumulator, bookmark) => {
          if(bookmark.parentId != this.currentBookmark.id) return accumulator;
          if(bookmark.children) return accumulator;

          count++;
          if(count == 1) return bookmark.url;
          else return accumulator+"\n"+bookmark.url;
        }, '');
      } else { // 已展开
        let stack = [];
        let parentId = this.currentBookmark.id;
        let index = this.currentIndex+1;
        let list = this.storageKeyword != '' ? this.cacheList : this.list;
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
            if(parentId == this.currentBookmark.id) {
              count++;
              if(count == 1) urls += bookmark.url;
              else urls += "\n"+bookmark.url;
            }
          }

          index++;
        }
        // while(true) {
        //   if(index >= list.length) break;

        //   let bookmark = list[index];console.log('copy2', bookmark, parentId, index, list.length);
        //   if(bookmark.children) {
        //     // 当前为文件夹
        //     if(bookmark.parentId == parentId) {
        //       // 子文件夹，需要记录一下 parentId
        //       console.log('copy21', bookmark, parentId);
        //       stack.push(parentId);
        //       parentId = bookmark.id;
        //       console.log('copy211', bookmark, parentId);
        //       index++;
        //     } else {
        //       // 不相等，说明是从文件夹中出来了
        //       if(stack.length == 0) {
        //         // 遍历结束
        //         console.log('copy99', bookmark, parentId);
        //         break;
        //       } else {
        //         // 取出上一个文件夹
        //         parentId = stack.pop();
        //         // index 不能增加
        //       }
        //     }
        //   } else {
        //     // 当前为网页
        //     if(bookmark.parentId == parentId) {
        //       if(parentId == this.currentBookmark.id) {
        //         count++;
        //         if(count == 1) urls += bookmark.url;
        //         else urls += "\n"+bookmark.url;
        //       }
        //       index++;
        //     } else {
        //       // 不相等，说明是从文件夹中出来了
        //       if(stack.length == 0) {
        //         // 遍历结束
        //         console.log('copy22', bookmark, parentId);
        //         break;
        //       } else {
        //         // 取出上一个文件夹
        //         parentId = stack.pop();
        //         // index 不能增加
        //       }
        //     }
        //   }
        // }
      }

      console.log('copy3', urls, count)
      if(urls == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: urls,
        count: count,
      })
    },

    search(keyword) {
console.log('bookmark.search', keyword, '|', this.storageKeyword);
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword == keyword.trim()) return;
        this.storageKeyword = keyword.trim();
      }
console.log('bookmark.search2', keyword, '|',  this.storageKeyword);

      // 展示工作区
      if(this.workspaceSwitch) {
        this.showWorkspaceList();
        return;
      }

      if(this.listPageCount <= 0) {
        this.cacheList = [];
        this.list = [];
        this.scrollDisabled = true;
        this.$emit('update:searchTotal', this.tree.bookmarkCount[this.rootId]);
        return;
      }

console.log('bookmark.search3', keyword, '|',  this.storageKeyword);

      let times = ++this.w.times;

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

        this.$emit('update:searchTotal', this.tree.bookmarkCount[this.rootId]);
      } else if(this.storageKeyword.length == 0) {
        // 搜索是异步的，先用之前的填补，否则搜索列表数据会因为使用不同的 marginLeft 而错误，进而形成闪烁。
        this.list = this.originList;

        this.currentIndex = this.position.currentIndex;
        // this.$refs.list.currentTo(this.position.visiualIndex);

        // this.currentIndex = 0;
        this.scrollDisabled = true;

        this.getTree((bookmarks) => {
          console.log('getTree', bookmarks);

          // 防止并发错误
          if(times != this.w.times) return;

          this.originList = bookmarks;
          // 倒着打开
          for(let i = this.originList.length-1; i >= 0; i--)
            this.expand(this.originList, i, false);
          this.list = this.listPageCount <= 0 ? [] : this.originList;

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

          this.$emit('update:searchTotal', this.tree.bookmarkCount[this.rootId]);
          console.log('bookmark.search.end')
        })
      }

      if(this.storageKeyword.length > 0){
        // 加上这个会有问题
        // this.isSearched = false;
        // this.list = [];

        this.isSearching = true;

        this.query(this.storageKeyword, (bookmarks) => {

          // 防止并发错误
          if(times != this.w.times) return;

console.log('chrome.bookmarks.getTree.second')
          this.cacheList = bookmarks;
          this.list = this.cacheList.slice(0, this.listPageCount);

          this.currentIndex = this.list.length > 0 ? 0 : -1;
          this.scrollDisabled = this.list.length <= 0 || this.list.length >= this.cacheList.length;

          this.$emit('update:searchTotal', this.cacheList.length);
          console.log('bookmark.search.end')
        })
      }
    },
    showWorkspaceList() {
      let keyword = this.workspaceStorageKeyword.toUpperCase().split(/\s+/)[0];
      let filterList =  this.workspaceList.filter( workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 );

      // 搜不到则展示全部工作区
      let keywords = filterList.length > 0
                    ? this.workspaceStorageKeyword.split(/\s+/).slice(1).join(' ')
                    : this.workspaceStorageKeyword.split(/\s+/).join(' ');
      filterList = filterList.length > 0 ? filterList : this.workspaceList

      // 列表赋值
      this.list = filterList.map((workspace) => {
        workspace.tip = keywords == '' ? '' : `Search ${workspace.type} for '<strong>${keywords.escape()}</strong>'`;
        return workspace;
      })

      this.scrollDisabled = true;
      this.currentIndex = 0;
    },
    load() {
      console.log('bookmark.load')
      // 加载数据
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.listPageCount))
      this.scrollDisabled = this.list.length >= this.cacheList.length;
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
        console.log('chrome.bookmarks.getTree', bookmarks)
        if(bookmarks.length <= 0) {
          console.error('不太可能出现', bookmarks)
          callback(bookmarks);
          return;
        }

        let root = bookmarks[0];
        this.rootId = root.id;
        callback(root.children);
      })
    },

    openWindow(index, keyType) {
      if(index == undefined) {
        this._openWindow(keyType);
        return;
      }

      if( ! this.$refs.list.choice(index)) {
        return;
      }

      this._openWindow(keyType);
    },
    _openWindow(keyType) {
      // 列表为空
      if(this.currentBookmark == null) return;

      // 工作区切换
      if(this.workspaceSwitch) {
        this.changeWorkspace();
        return;
      }

      // 打开网页
      if( ! this.currentBookmark.children) {
        this.$open(this.currentBookmark.url, keyType);
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
          this.expand(this.list, this.currentIndex, true);
        });
        // this.expand(this.list, this.currentIndex, true);
      } else {
        // 收起

        // 先存储再去操作，因为列表有可能会发生滚动
        // this.state[ this.currentBookmark.id ] = false;
        delete this.state[ this.currentBookmark.id ]
        chrome.storage.local.set({'bookmark': { state: this.state, position: this.position  }}, () => {
          this.collapse(this.list, this.currentIndex);
        });
        // this.collapse(this.list, this.currentIndex);
      }
    },
    changeWorkspace() {
      let keywords;
      let keyword = this.workspaceStorageKeyword.toUpperCase().split(/\s+/)[0];
      if(this.workspaceList.some(workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 )) {
        keywords = this.workspaceStorageKeyword.split(/\s+/).slice(1).join(' ');
      } else {
        keywords =  this.workspaceStorageKeyword.split(/\s+/).join(' ');
      }
      this.input(keywords, this.currentBookmark.type, true);
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },

    searchExpand(index) {
      // 搜索列表需要用别的方式打开文件夹

      // 展开（如果子目录需要展开也会自动展开）
      let stack = [];
      for(let currentIndex = index, endIndex = index; currentIndex <= endIndex; currentIndex++) {
        let bookmark = this.list[currentIndex];

        // 不是目录，跳过
        if( ! bookmark.children) continue;

        // 目录已展开，跳过
        if(bookmark.children.length <= 0) continue;

        // 目录没有被标记展开，跳过（点击不用管状态，非点击需要）
        // if(currentIndex != index && ! this.state[ bookmark.id ]) continue;
        if(currentIndex != index) continue;

        // 展开目录
        this.cacheList.splice(currentIndex+1, 0, ...bookmark.children);
        this.list.splice(currentIndex+1, 0, ...bookmark.children);
        stack.push([currentIndex, bookmark.children.length]);
        endIndex += bookmark.children.length;
        bookmark.count = bookmark.children.length; // 加 count 标记，这个是临时的，会因为搜索而消失
        bookmark.children = [];
      }
    },
    searchCollapse(index) {
      // 搜索列表需要用别的方式收起文件夹

      // 收起（子目录必须收起来，否则再次展开时的count就不对了）
      let stack = [];
      let count = this.list[index].count;
      let lastIndex = index+1;
      let parentIndex = index;

      // 空文件夹是没有count的
      if(count == undefined) return;

      while(true) {
        if(count <= 0) {
          // 收起该层
          console.log('收起1', lastIndex, parentIndex+1, lastIndex-(parentIndex+1), this.list[parentIndex].title);
          let total = lastIndex-(parentIndex+1);
          this.list[parentIndex].children = this.list.splice(parentIndex+1, total);
          this.cacheList.splice(parentIndex+1, total);
          console.log('收起2', lastIndex, parentIndex+1, total);

          if(stack.length == 0) break;

          // 回到上层
          [parentIndex, count] = stack.pop();
          lastIndex = lastIndex-total; // parentIndex+1;

          continue;
        }

        let bookmark = this.list[lastIndex];
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

    fold() {
      // 全部收起（包括子目录）

      // todo 暂时用最简单的方法
      this.getTree((bookmarks) => {
        console.log('getTree', bookmarks);

        this.originList = bookmarks;
        this.list = this.originList;

        this.currentIndex = 0;

        this.state = {};
        this.position.currentIndex = 0;
        this.position.visiualIndex = 0;
        chrome.storage.local.set({'bookmark': { state: this.state, position: this.position }});
      })
    },
    unfold() {
      // 全部展开（包括子目录）

      console.log('unfold');
      this.state = {};
      let parentId = this.originList.length <= 0 ? -1 : this.originList[0].parentId;
      for(let currentIndex = 0; currentIndex < this.originList.length; currentIndex++) {
        console.log('unfold', currentIndex)
        let bookmark = this.originList[currentIndex];

        // 不是目录，跳过
        if( ! bookmark.children) continue;

        this.state[ bookmark.id ] = true;

        // 目录已展开，跳过
        if(bookmark.children.length <= 0) continue;

        // 展开目录
        this.originList.splice(currentIndex+1, 0, ...bookmark.children);
        bookmark.children = [];
      }
      this.list = this.originList;

      chrome.storage.local.set({'bookmark': { state: this.state, position: this.position }});

      console.log('unfold', this.state);
    },

    scrollEnd() {
      if( ! this.isSearching) {
        // this.position.visiualIndex = this.$refs.list.visiualIndex; // 此时 visiualIndex 那边拿到的 currentIndex 还是老的
        this.positionRecord(this.currentIndex, this.currentIndex-this.$refs.list.scrollLines);
      }
    },
    positionRecord(currentIndex, visiualIndex) {
      // if(this.isSearching) return;
      if(this.position.currentIndex == currentIndex
      && this.position.visiualIndex == visiualIndex) return;

      console.log('positionRecord'
      ,this.position.currentIndex,
      this.position.visiualIndex,
      currentIndex, visiualIndex);

      // 通过键盘快捷键操作可能会关闭窗口，应在最短的时间内保存
      if(this.position.currentIndex != currentIndex
      && this.position.visiualIndex != visiualIndex) {
        clearTimeout(this.w.timer);

        this.position.currentIndex = currentIndex;
        this.position.visiualIndex = visiualIndex;

        chrome.storage.local.set({'bookmark': { state: this.state, position: this.position  }}, () => {
          console.log('positionRecord20', currentIndex, visiualIndex);
        });
        return;
      }

      this.position.currentIndex = currentIndex;
      this.position.visiualIndex = visiualIndex;

      // 限流
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        chrome.storage.local.set({'bookmark': { state: this.state, position: this.position  }}, () => {
          console.log('positionRecord21', currentIndex, visiualIndex);
        });
      }, 200);
    },

    getTip() {
      console.log('showTip');

      // 打开网页
      if( ! this.currentBookmark.children) {
        if(this.keyType == 'meta/ctrl') {
          return '打开新标签但不切换';
        } else if(this.keyType == 'shift') {
          return '新窗口打开';
        } else if(this.keyType == 'alt') {
          return '覆盖当前标签';
        } else if(this.keyType != '') {
          return '打开新标签并切换';
        } else {
          return '';
        }
      }

      return this.currentBookmark.children.length ? '展开' : '收起';
    }
  },
  beforeUpdate() {
    console.warn('beforeUpdate');
  },
  updated() {
    console.warn('updated');
  },
  mounted() {
    // todo
    window.b = this;let a = new Date().getTime();
console.warn('mounted', a);
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
      console.log('state', this.state);

      let b = new Date().getTime();
console.warn('finish', b, (b-a)/1000)

      this.$emit('finish');
    })
      console.warn('mounted2');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list >>> .list-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
}
.list >>> .list-item  .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.list >>> .list-item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  /* justify-content: center; */
}
.list >>> .list-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list >>> .list-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list >>> .list-item .right {
  /* border: 1px solid black; */
  /* margin-left: 10px;
  margin-right: 10px; */
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
  text-align: right;

  height: 100%;
  display:flex;
  flex-direction: column;
  justify-content: space-evenly;
}
</style>
<style>
.bookmark .title strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
.bookmark .sub-title strong {
  color: var(--list-explain-highlight-color);
  font-weight: var(--list-explain-highlight-weight);
}
</style>