<template>
  <div class="test">
    <list
      :list="list"
      :itemHeight="config.item_height"
      :itemShowCount="config.item_show_count"
      :scrollDisabled="scrollDisabled"
      :scrollbarColor="config.list_scrollbar_color"
      :scrollbarFocusColor="config.list_scrollbar_focus_color"
      v-model="currentIndex"
      ref="list">
      <template #default="{ index }">
        <div style="color: red">{{ jj() }}</div>
        <div style="color: red">{{ list[index] }}</div>
      </template>
    </list>
  </div>
</template>

<script>
import List from './List.vue'

export default {
  name: 'Test',
  props: {
    config: {
      type: Object,
      required: require,
    },
  },
  data() {
    return {
      list: [{
        "aa": "aaaaaaaaaa"
      },{
        "aa": "aaaaaaaaaa"
      }],

      currentIndex: 0,

      scrollDisabled: false,
    }
  },
  components: {
    List,
  },
  methods: {
    jj() {
      console.warn('jj');
      return 'jj';
    }
  },
  mounted() {
    window.t = this;
  }
}
</script>

<style scoped>
</style>