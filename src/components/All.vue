<template>
  <div class="all">
    <list
      :list="list"
      :itemHeight="config.item_height"
      :itemShowCount="config.item_show_count"
      :scrollDisabled="scrollDisabled"
      :scrollbarColor="config.list_scrollbar_color"
      :scrollbarFocusColor="config.list_scrollbar_focus_color"
      v-model="currentIndex"
      ref="list">
      <template #default="{ index, item, isActive, isSelected }">
        <component
          :is="item.type"

          :item="item"
          :index="index"
          :isActive="isActive"
          :isSelected="isSelected"

          :config="config"
          :isLoad="isLoad"

          :storageKeyword="storageKeyword"></component>
      </template>
    </list>
  </div>
</template>

<script>
import List from './List.vue'

import Window from '../modules/window.js'

import WindowItem from './all/WindowItem.vue'

export default {
  name: 'All',
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
    }
  },
  components: {
    List,
    WindowItem,
  },
  methods: {
    jj() {
      console.warn('jj');
      return 'jj';
    }
  },
  async mounted() {
    window.all = this;
    window.ww = Window;

    let list = await Window.search('s');
    this.list = list.map((item) => {
      item.type = 'WindowItem';
      return item;
    })
  }
}
</script>

<style scoped>
</style>