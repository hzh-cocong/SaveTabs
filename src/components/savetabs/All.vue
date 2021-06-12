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
        :isLoad="isLoad"

        :storageKeyword="storageKeyword"

        :showIndex="(index-$refs.list.scrollLines+1) <= 9
                  ? ( 1 > index-$refs.list.scrollLines+1
                    ? 1
                    : (index-$refs.list.scrollLines+1 > config.item_show_count
                      ? config.item_show_count
                      : index-$refs.list.scrollLines+1)
                    )
                  : -1"></component>
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

import Window from '../../modules/window.js'
import Temporary from '../../modules/temporary.js'
import Note from '../../modules/note.js'
import Tab from '../../modules/tab.js'

export default {
  name: 'All',
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
    }
  },
  data() {
    return {
      list: [],

      currentIndex: 0,

      storageKeyword: undefined,

      scrollDisabled: false,

      isSearched: false,

      length: {}
    }
  },
  components: {
    List,
    WindowItem,
    TemporaryItem,
    NoteItem,
    TabItem,
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

      let keywords = this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/);

      this.length = {};

      Promise.all(this.config.all_include.filter(workspace => {
        return workspace.is_top;
      }).map((workspace) => {
        console.log('lists.isTop.workspace', workspace);
        let module = this.getModule(workspace.type);
        return module.search({
          keywords: keywords,
          length: workspace.count,
        })
      })).then(lists => {
        console.log('lists', lists);
        if(lists.length <= 0) return true;

        let list = [];
        lists.forEach((workspaceList) => {
          if(workspaceList.length <= 0) return;

          this.length[workspaceList[0].type] = workspaceList.length;
          list.push(...workspaceList);
        })
        if(list.length <= 0) return true;
        this.list = list;

        // test
        // this.list[0].isCurrent = true;
        // this.list[0].count = 3;

        this.scrollDisabled = false;
        if(isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
          this.currentIndex = 1;
        } else {
          this.currentIndex = this.list.length > 0 ? 0 : -1;
        }

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;

        return false;
      }).then((isContinue) => {
        console.log('isContinue', isContinue)
        if( ! isContinue) return;

        Promise.all(this.config.all_include.filter((workspace) => {
          return ! workspace.is_top;
        }).map((workspace) => {
          let module = this.getModule(workspace.type);
          return module.search({
            keywords: keywords,
            length: workspace.count,
          })
        })).then(lists => {
          console.log('lists', lists);

          let list = [];
          lists.forEach((workspaceList) => {
            if(workspaceList.length <= 0) return;

            this.length[workspaceList[0].type] = workspaceList.length;
            list.push(...workspaceList);
          })
          this.list = list;

          this.scrollDisabled = this.list.length <= 0;
          if(isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
            this.currentIndex = 1;
          } else {
            this.currentIndex = this.list.length > 0 ? 0 : -1;
          }

          // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
          this.isSearched = true;
        })
      })
    },
    load() {
      Promise.all(this.config.all_include.filter(workspace => {
        return workspace.is_top;
      }).map((workspace) => {
        let module = this.getModule(workspace.type);
        return module.load({
          start: this.length[workspace.type],
          length: workspace.count,
        })
      })).then(lists => {
        console.log('load:lists', lists);

        if(lists.length <= 0) return true;

        let count = 0;
        lists.forEach((list) => {
          if(list.length <= 0) return;

          this.length[list[0].type] += list.length;
          this.list.push(...list);

          count += list.length;
        })

        if(count <= 0) return true;

        return false;
      }).then((isContinue) => {
        console.log('load', isContinue);
        if( ! isContinue) return;

        Promise.all(this.config.all_include.filter(workspace => {
          return ! workspace.is_top;
        }).map((workspace) => {
          let module = this.getModule(workspace.type);

          if(this.length[workspace.type] == undefined) {
            let keywords = this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/);

            this.length[workspace.type] = 0;

            return module.search({
              keywords: keywords,
              length: workspace.count,
            })
          } else {
            return module.load({
              start: this.length[workspace.type],
              length: workspace.count,
            })
          }
        })).then(lists => {
          console.log('load2:lists', lists);

          let count = 0;
          lists.forEach((list) => {
            if(list.length <= 0) return;

            this.length[list[0].type] += list.length;
            this.list.push(...list);

            count += list.length;
          })

          this.scrollDisabled = count <= 0;

          return false;
        })
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

      module.openWindow(item.index, event).then((isDel) => {
        console.warn('all.finish', isDel);
        if(isDel) {
          this.list.splice(this.currentIndex, 1);
        }
      });
    },

    getModule(type) {
      switch(type) {
        case 'temporary': return Temporary;
        case 'window': return Window;
        case 'note': return Note;
        case 'tab': return Tab;
      }
    },
  },
  mounted() {
    window.all = this;
    window.ww = Window;
    window.tte = Temporary;
    window.nn = Note;
    window.tta = Tab;

    this.$emit('finish');
  }
}
</script>

<style scoped>
</style>