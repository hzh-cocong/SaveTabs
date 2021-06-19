<template>
  <div class="all">

  <el-alert
    v-if="isSearched && list.length == 0"
    type="info"
    :closable="false"
    show-icon
    style="margin: 0 10px;"
    :style="{ width: (config.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (config.width-70)+'px' }">
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
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="config.list_scrollbar_color"
    :scrollbarFocusColor="config.list_scrollbar_focus_color"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus"
    @itemClick="_openWindow">
    <template #default="{ index, item, isActive, isSelected }">
      <component
        :is="item.type+'Item'"

        :item="item"
        :index="index"
        :isActive="isActive"
        :isSelected="isSelected"

        :config="config"
        :project_config="project_config"
        :isLoad="isLoad"

        :storageKeyword="storageKeyword"

        :showIndex="(index-$refs.list.scrollLines+1) <= 9
                  ? ( 1 > index-$refs.list.scrollLines+1
                    ? 1
                    : (index-$refs.list.scrollLines+1 > config.item_show_count
                      ? config.item_show_count
                      : index-$refs.list.scrollLines+1)
                    )
                  : -1"
        :tip="tip"></component>
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
  inject: ['focus', 'input'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    localConfig: {
      type: Object,
      required: require,
    },
    project_config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    }
  },
  data() {
    return {
      list: [],

      currentIndex: 0,

      storageKeyword: undefined,
      conditions: [],

      scrollDisabled: true, // 一定要为 true，否则会再一开始就触发 load，而此时 search 可能还未执行完，就会导致冲突

      isSearched: false,

      length: {},

      tip: '',
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

      let isFirstSearch = this.storageKeyword == undefined;

      this.storageKeyword = keyword.trim();

      // 展示工作区
      if(this.workspaceSwitch) {
        let module = this.getModule('toggle');
        module.search({
          keywords: this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/),
          length: 100,
          config: this.config,
          localConfig: this.localConfig,
          originKeyword: this.storageKeyword,
          parent: this,
        }).then((list) => {
          console.log(77777777777777777, list)
          this.list = list;

          this.scrollDisabled = true;
          this.currentIndex = 0;
        })

        return;
      }

      this.length = {};

      if(this.storageKeyword == '') {
        this.conditions = [
          {is_top: 1, only_search: false},
          {is_top: 0, only_search: false},
          {is_top: -1, only_search: false},
          {is_top: -2, only_search: false},
        ];
      } else {
        this.conditions = [
          {is_top: 1},
          {is_top: 0},
          {is_top: -1},
          {is_top: -2},
        ];
      }

      this.toSearch(0).then((list) => {
        console.log('search:lists', list);

        this.list = list;

        // 置顶只要有一个结果，就不会继续查，此时列表如果没有被填满也不用担心，load 会加载
        this.scrollDisabled = false;
        if(isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
          this.currentIndex = 1;
        } else {
          this.currentIndex = this.list.length > 0 ? 0 : -1;
        }

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      })
    },
    toSearch(index = 0) {
      if(index >= this.conditions.length) {
        return new Promise(resolve => resolve([]));
      }

      let condition = this.conditions[index];

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
          localConfig: this.localConfig,
          originKeyword: this.storageKeyword,
          parent: this,
        })
      })).then((lists) => {
        console.log('toSearch:lists', lists);

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
    load() {
      this.toLoad(0).then((list) => {
        console.log('load:lists', list);

        this.scrollDisabled = list.length <= 0;
        this.list.push(...list);
      })
    },
    toLoad(index = 0) {
      if(index >= this.conditions.length) {
        return new Promise(resolve => resolve([]));
      }

      let condition = this.conditions[index];

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
            localConfig: this.localConfig,
            originKeyword: this.storageKeyword,
            parent: this,
          })
        }
      })).then(lists => {
        console.log('toLoad:lists', lists);

        let list = [];
        lists.forEach((workspaceList) => {
          if(workspaceList.length <= 0) return;

          this.length[workspaceList[0].type] += workspaceList.length;
          list.push(...workspaceList);
        })

        if(list.length > 0) {
          return list;
        } else {
          return this.toLoad(index+1);
        }
      })
    },

    openWindow(index, event) {
      if(index == undefined) {
        this._openWindow(event);
        return;
      }

      if( ! this.$refs.list.choice(index)) {
        return;
      }

      this._openWindow(event);
    },
    _openWindow(event) {
      console.log('openWindow', event)

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      module.openWindow(item.index, event).then((result) => {
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
          this.input(result.keywords, result.workspace)
        }
      });
    },

    showTip(event) {
      console.log('showTip', event)

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      this.tip = module.showTip({event, index: item.index, _device: this._device});
    },
    finishTip(event) {
      console.log('finishTip', event)

      let item = this.list[ this.currentIndex ];
      let module = this.getModule(item.type);

      this.tip = module.finishTip({event, index: item.index, _device: this._device});
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
        // 列表为空，没啥好更新的
        if(this.list.length == 0) return;

        // 还没有在列表中展示，无需刷新
        if(this.localConfig.all_include.filter(workspace => {
          return this.storageKeyword != '' || workspace.only_search == false;
        }).every((workspace => {
          return workspace.type != request.workspace;
        }))) return;

        // 刷新数据
        let module = this.getModule(request.workspace);
        module.refresh().then(() => {
          // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
          let origin = this.storageKeyword;
          this.storageKeyword = ' ';
          this.search(origin);

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