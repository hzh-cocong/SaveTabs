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
        :is="item.type"

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
import List from './List.vue'

import Window from '../modules/window.js'
import Temporary from '../modules/temporary.js'

import WindowItem from './all/WindowItem.vue'
import TemporaryItem from './all/TemporaryItem.vue'

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
    }
  },
  components: {
    List,
    WindowItem,
    TemporaryItem,
  },
  methods: {
    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },

    search(keyword) {
      console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk2')
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;

      let isFirstSearch = this.storageKeyword == undefined;

      this.storageKeyword = keyword.trim();

      let keywords = this.storageKeyword == '' ? [] : this.storageKeyword.toUpperCase().split(/\s+/);

      Promise.all(this.config.all_include.map((workspace) => {
        let type = '';
        switch(workspace.type) {
          case 'temporary': type = Temporary; break;
          case 'window': type = Window; break;
        }

        return type.search({
          keywords: keywords,
          length: workspace.count,
        })
      })).then(lists => {
        console.log('lists', lists);

        this.list = lists.reduce(function (a, b) { return a.concat(b)} );

        this.currentIndex = 0;

        // this.scrollDisabled = this.list.length <= 0;
        // if(isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
        //   this.currentIndex = 1;
        // } else {
        //   this.currentIndex = this.list.length > 0 ? 0 : -1;
        // }

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      })

      // Temporary.search({
      //   keywords: keywords,
      //   length: this.config.list_page_count
      // }).then((list) => {
      //   this.list = list;
      //   console.log('all', list);

      //   this.scrollDisabled = this.list.length <= 0;
      //   if(isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
      //     this.currentIndex = 1;
      //   } else {
      //     this.currentIndex = this.list.length > 0 ? 0 : -1;
      //   }

      //   // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      //   this.isSearched = true;
      // })


      // Window.search({
      //   keywords: keywords,
      //   length: this.config.list_page_count
      // }).then((list) => {
      //   this.list = list;
      //   console.log('all', list);

      //   // this.list[0].isCurrent = true;

      //   this.scrollDisabled = this.list.length <= 0;
      //   if(isFirstSearch && this.list.length > 1 && this.list[0].isCurrent == true) {
      //     this.currentIndex = 1;
      //   } else {
      //     this.currentIndex = this.list.length > 0 ? 0 : -1;
      //   }

      //   // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      //   this.isSearched = true;
      // })
    },
    load() {
      // console.log('llllllllllllllllllllllllll')
      // Temporary.load({
      //   start: this.list.length,
      //   length: this.config.list_page_count
      // }).then((list) => {
      //   if(list.length <= 0) {
      //     this.scrollDisabled = true;
      //     return;
      //   }

      //   this.list.push(...list);
      // })

      // Window.load({
      //   start: this.list.length,
      //   length: this.config.list_page_count
      // }).then((list) => {
      //   if(list.length <= 0) {
      //     this.scrollDisabled = true;
      //     return;
      //   }

      //   this.list.push(...list);
      // })
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
      // this.$refs.list.children[this.currentIndex].openWindow(event);

      Temporary.openWindow(this.currentIndex, event).then((isDel) => {
        console.warn('all.finish', isDel);
        if(isDel) {
          this.list.splice(this.currentIndex, 1);
        }
      });

      // Window.openWindow(this.currentIndex, event).then(() => {
      //   console.warn('all.finish', arguments);
      // });
    }
  },
  mounted() {
    window.all = this;
    window.ww = Window;
    window.tt = Temporary

    this.$emit('finish');
  }
}
</script>

<style scoped>
</style>