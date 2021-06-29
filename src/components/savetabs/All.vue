<template>
  <div class="all">
<!--
  <el-alert
    v-if="isSearched && list.length == 0" -->
  <el-alert
    v-if="false"
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
        <!-- <div>{{ storageList.length == 0 ? lang('windowNoResult') : lang('windowNoResult2') }}</div>
        <div v-if="storageList.length > 0">{{ lang('windowCountTip')+storageList.length+lang('windowCountTip2') }}</div> -->
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
    :itemShowCount="currentThemeConfig.item_show_count"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="currentThemeConfig.list_scrollbar_color"
    :scrollbarFocusColor="currentThemeConfig.list_scrollbar_focus_color"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @itemClick="_openWindow(getKeyType($event))">
    <template #default="{ index, item, isActive, isSelected }">
      <component
        :is="item.type+'Item'"

        :item="item"
        :index="index"
        :isActive="isActive"
        :isSelected="isSelected"

        :config="config"
        :currentThemeConfig="currentThemeConfig"
        :projectConfig="projectConfig"
        :isLoad="isLoad"

        :storageKeyword="storageKeyword"

        :showIndex="(index-$refs.list.scrollLines+1) <= 9
                  ? ( 1 > index-$refs.list.scrollLines+1
                    ? 1
                    : (index-$refs.list.scrollLines+1 > currentThemeConfig.item_show_count
                      ? currentThemeConfig.item_show_count
                      : index-$refs.list.scrollLines+1)
                    )
                  : -1"
        :keyType="keyType"></component>
    </template>
  </list>

  </div>
</template>

<script>
import List from '../common/List.vue'

import WindowItem from './all/WindowItem.vue'
import TemporaryItem from './all/TemporaryItem.vue'
import NoteItem from './all/NoteItem.vue'
import TabItem from './all/TabItem.vue'
import HistoryItem from './all/HistoryItem.vue'
import BookmarkItem from './all/BookmarkItem.vue'
import SearchItem from './all/SearchItem.vue'
import ToggleItem from './all/ToggleItem.vue'

import Window from '../../modules/window.js'
import Temporary from '../../modules/temporary.js'
import Note from '../../modules/note.js'
import Tab from '../../modules/tab.js'
import History from '../../modules/history.js'
import Bookmark from '../../modules/bookmark.js'
import Search from '../../modules/search.js'
import Toggle from '../../modules/toggle.js'

export default {
  name: 'All',
  inject: ['input'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    localConfig: {
      type: Object,
      required: require,
    },
    currentThemeConfig: {
      type: Object,
      required: require,
    },
    projectConfig: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
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
  },
  data() {
    return {
      list: [],

      currentIndex: 0,

      storageKeyword: undefined,
      isFirstSearch: true,
      conditions: [],

      scrollDisabled: true, // 一定要为 true，否则会再一开始就触发 load，而此时 search 可能还未执行完，就会导致冲突

      isSearched: false,

      length: {},

      conditions: [
        [ // storageKeyword == ''
          [ // search
            {is_top: 1, only_search: false},
            {is_top: 0, only_search: false},
            {is_top: -1, only_search: false},
            // {is_top: -2, only_search: false},
          ],
          [ // load
            {is_top: 1, only_search: false},
            {is_top: 0, only_search: false},
            {is_top: -1, only_search: false},
            // {is_top: -2, only_search: false},
          ],
        ],
        [ // storageKeyword != ''
          [ // search
            {is_top: 1},
            {is_top: 0},
            {is_top: -1},
            {is_top: -2, only_search: true},
          ],
          [ // load
            {is_top: 1},
            {is_top: 0},
            {is_top: -1},
            // {is_top: -2, only_search: true},
          ],
        ]
      ]
    }
  },
  components: {
    List,
    WindowItem,
    TemporaryItem,
    NoteItem,
    TabItem,
    HistoryItem,
    BookmarkItem,
    SearchItem,
    ToggleItem,
  },
  computed: {
    workspaceSwitch() {
      return ! ( this.storageKeyword == undefined
              || this.config.workspace_change_word == undefined
              || this.config.workspace_change_word.length == 0
              || this.storageKeyword.startsWith(this.config.workspace_change_word) == false);
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'all';
    }
  },
  methods: {
    up(keyType) {
      if(this.list.length <= 0 || this.currentIndex >= this.list.length) return;

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      module.up(item.realIndex, keyType).then((result) => {
        console.warn('up.finish.uuuuuuuuuuuuuuuuu', result);
        if(result == undefined) return;

        if(result.type == 'up') {
          this.currentIndex--;
        } else if(result.type == 'jump-up') {
          this.currentIndex -= result.count;
        } else if(result.type == 'jump-up-and-collapse') {
          this.currentIndex -= result.count;
          this.list.splice(this.currentIndex+1, result.length);
          this.length[item.type] -= result.length;
        } else if(result.type == 'delete') {
          this.list.splice(this.currentIndex, 1);
          this.length[item.type]--;
        } else if(result.type == 'spread') {
          this.list.splice(this.currentIndex+1, 0, ...result.list);
          this.length[item.type] += result.list.length;
        } else if(result.type == 'collapse') {
          this.list.splice(this.currentIndex+1, result.length);
          this.length[item.type] -= result.length;
        } else if(result.type == 'input') {
          this.input(result.keywords, result.workspace, true)
        }
      });
    },
    down(keyType) {
      if(this.list.length <= 0 || this.currentIndex >= this.list.length) return;

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      if(keyType == 'meta/ctrl') {
        this.autoSort(item.type);
      }

      module.down(item.realIndex, keyType).then((result) => {
        console.warn('down.finish', result);
        if(result == undefined) return;

        if(result.type == 'down') {
          this.currentIndex++;
        } else if(result.type == 'delete') {
          this.list.splice(this.currentIndex, 1);
          this.length[item.type]--;
        } else if(result.type == 'spread') {
          this.list.splice(this.currentIndex+1, 0, ...result.list);
          this.length[item.type] += result.list.length;
        } else if(result.type == 'collapse') {
          this.list.splice(this.currentIndex+1, result.length);
          this.length[item.type] -= result.length;
        } else if(result.type == 'input') {
          this.input(result.keywords, result.workspace, true)
        }
      });
    },
    copy() {
      if(this.list.length <= 0 || this.currentIndex >= this.list.length) return;

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      module.copy(item.realIndex);
    },

    search(keyword) {
console.log('all.search', keyword, '|', this.storageKeyword, this.isFirstSearch);
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword != keyword.trim()) {
          this.storageKeyword = keyword.trim();
        } else if( ! this.isFirstSearch) {
          return;
        }
      }
console.log('all.search2', keyword, '|',  this.storageKeyword, this.isFirstSearch);

      // 展示工作区
      if(this.workspaceSwitch) {
        this.showWorkspaceList();
        return;
      }

      this.length = {};
console.log('all.search:lists');
      this.toSearch(0).then((list) => {
        console.log('all.search:lists2', list);

        this.list = list;

        // 置顶只要有一个结果，就不会继续查，此时列表如果没有被填满也不用担心，load 会加载
        this.scrollDisabled = false;
        if(this.isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
          this.currentIndex = 1;
          if(this.isSearched) this.$nextTick(() => this.$refs.list.currentTo(1));
        } else {
          this.currentIndex = this.list.length > 0 ? 0 : -1;
        }
        this.isFirstSearch = false;
        console.log('all.search:lists3', list, this.isFirstSearch);

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      })
    },
    toSearch(index = 0) {
      let conditions = this.storageKeyword == '' ? this.conditions[0][0] : this.conditions[1][0];

      if(index >= conditions.length) {
        return new Promise(resolve => resolve([]));
      }

      let condition = conditions[index];

      return Promise.all(this.localConfig.all_include.filter(workspace => {
        return Object.keys(condition).every((attr) => {
          return workspace[attr] == condition[attr];
        })
      }).map((workspace) => {
        let module = this.getModule(workspace.type);
        this.length[workspace.type] = 0;
        return module.search({
          keywords: this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/),
          length: workspace.count,
          config: this.config,
          currentThemeConfig: this.currentThemeConfig,
          localConfig: this.localConfig,
          originKeyword: this.storageKeyword,
          parent: this,
        })
      })).then((lists) => {
        console.log('all:toSearch:lists', lists);

        let list = [];
        lists.forEach((workspaceList) => {
          if(workspaceList.length <= 0) return;

          this.length[workspaceList[0].type] = workspaceList.length;
          list.push(...workspaceList);
        })

        if(list.length > 0) {
          return list;
        } else {
          return this.toSearch(index+1);
        }
      })
    },
    showWorkspaceList() {
      let module = this.getModule('toggle');
      module.search({
        keywords: this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/),
        length: 100,
        config: this.config,
        currentThemeConfig: this.currentThemeConfig,
        localConfig: this.localConfig,
        originKeyword: this.storageKeyword,
        parent: this,
      }).then((list) => {
        console.log(77777777777777777, list)
        this.list = list;

        this.scrollDisabled = true;
        this.currentIndex = 0;
        this.isFirstSearch = false;
      })
    },
    load() {
      console.log('all:load:lists');
      // 避免因为列表加载慢而重复 load，infinite-scroll-delay 默认节流时延为 200ms，但具体load要多久这个谁也说不准，所以干脆禁用，等有结果了再重新开启
      this.scrollDisabled = true;
      this.toLoad(0).then((list) => {
        console.log('load:lists2', list);

        this.scrollDisabled = list.length <= 0;
        this.list.push(...list);
      })
    },
    toLoad(index = 0) {
      let conditions = this.storageKeyword == '' ? this.conditions[0][1] : this.conditions[1][1];

      if(index >= conditions.length) {
        return new Promise(resolve => resolve([]));
      }

      let condition = conditions[index];

      return Promise.all(this.localConfig.all_include.filter(workspace => {
        return Object.keys(condition).every((attr) => {
          return workspace[attr] == condition[attr];
        })
      }).map((workspace) => {
        let module = this.getModule(workspace.type);
        if(this.length[workspace.type] == undefined) {
          this.length[workspace.type] = 0;
          return module.search({
            keywords: this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/),
            length: workspace.count,
            config: this.config,
            currentThemeConfig: this.currentThemeConfig,
            localConfig: this.localConfig,
            originKeyword: this.storageKeyword,
            parent: this,
          })
        } else {
          return module.load({
            keywords: this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/),
            start: this.length[workspace.type],
            length: workspace.count,
            config: this.config,
            currentThemeConfig: this.currentThemeConfig,
            localConfig: this.localConfig,
            originKeyword: this.storageKeyword,
            parent: this,
          })
        }
      })).then(lists => {
        console.log('all:toLoad:lists', lists);

        let list = [];
        lists.forEach((workspaceList) => {
          if(workspaceList.length <= 0) return;

          this.length[workspaceList[0].type] += workspaceList.length;
          list.push(...workspaceList);
        })

        if(list.length > 0) {
          console.log('all:toLoad:lists21', lists);
          return list;
        } else {
          console.log('all:toLoad:lists22', index+1);
          return this.toLoad(index+1);
        }
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
      console.log('openWindow', keyType)

      if(this.list.length <= 0 || this.currentIndex >= this.list.length) return;

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      // 先保存，在打开，因为列表有可能会自动刷新
      this.autoSort(item.type);

      module.openWindow(item.realIndex, keyType).then((result) => {
        console.warn('all.finish', result);
        if(result == undefined) return;

        if(result.type == 'delete') {
          this.list.splice(this.currentIndex, 1);
          this.length[item.type]--;
        } else if(result.type == 'spread') {
          this.list.splice(this.currentIndex+1, 0, ...result.list);
          this.length[item.type] += result.list.length;
        } else if(result.type == 'collapse') {
          this.list.splice(this.currentIndex+1, result.length);
          this.length[item.type] -= result.length;
        } else if(result.type == 'input') {
          this.input(result.keywords, result.workspace, true)
        }
      });
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },

    autoSort(type) {
      console.log('autoSort', type, this.localConfig.all_include, this.localConfig.all_sort_auto)

      if( ! this.localConfig.all_sort_auto) return;
      if(this.workspaceSwitch) return;

      let index = this.localConfig.all_include.findIndex((workspace) => {
        return workspace.type == type;
      });
      if(index <= 0) return; // 找不到或者排在第一的位置则无需重排

      let currentWorkspace = this.localConfig.all_include[index];

      // 找到同优先级的排在第一的 workspce
      let topIndex = this.localConfig.all_include.findIndex((workspace) => {
        return currentWorkspace.is_top == workspace.is_top;
      });
      if(topIndex == -1 || topIndex == index) return; // -1 不可能出现，写上去更具兼容性

      // 将当前的 workspace 插入到顶部的前面去
      this.localConfig.all_include.splice(topIndex, 0, this.localConfig.all_include.splice(index , 1)[0]);

      console.log('autoSort2', type, this.localConfig.all_include)

      // 重新保存
      chrome.storage.local.set({'config': this.localConfig});
    },

    getModule(type) {
      switch(type) {
        case 'temporary': return Temporary;
        case 'window': return Window;
        case 'note': return Note;
        case 'tab': return Tab;
        case 'history': return History;
        case 'bookmark': return Bookmark;
        case 'search': return Search;
        case 'toggle': return Toggle;
      }
    },
  },
  mounted() {
    // todo
    window.all = this;
    window.ww = Window;
    window.tte = Temporary;
    window.nn = Note;
    window.tta = Tab;
    window.hh = History;
    window.bb = Bookmark;
    window.ss = Search;
    window.tto = Toggle;

    // 保持数据同步
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if(request.type == 'data_change') {
        // 被排除了则不处理
        if(request.exclude != undefined && request.exclude.indexOf('all') != -1) return;

        // 列表为空，没啥好更新的
        // 列表为空也应该更新，可能更新后就有数据了
        // if(this.list.length == 0) return;

        // 还没有在列表中展示，无需刷新
        if(this.localConfig.all_include.filter(workspace => {
          return this.storageKeyword != '' || workspace.only_search == false;
        }).every((workspace => {
          return workspace.type != request.workspace;
        }))) return;

        console.log('all:data_change', request, sender);

        // 虽然可能会有并发，但是是不同类型的并发，同一类型的发送方已经做了缓冲，所以无碍
        // 刷新数据
        let module = this.getModule(request.workspace);
        module.refreshData().then(() => {
          // 这样才会自动选择第二项
          this.isFirstSearch = true;
          // 当前工作区是本工作区则刷新列表，否则记录一下
          if(this.isActiveWorkspace) this.search();

          // 增删查改，还有反向操作，仅 temporary
          console.log('all:reload', request);
        })
      }
    })

    this.$emit('finish');
  }
}
</script>

<style scoped>
</style>