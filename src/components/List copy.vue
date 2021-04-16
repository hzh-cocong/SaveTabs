<template>
  <ul
    class="list"
    :style="{ height: (itemHeight*itemShowCount)+'px' }"
    @mouseleave="mouseEnter=false">
    <li
      class="list-item"
      v-for="(item, index) in list"
      :key="index"
      @mouseenter="mouseEnter=true;$emit('change', index);">
      <slot
        name="item"
        :index="index"
        :item="item"
        :isSelected="index==currentIndex"
        :isActive="index==currentIndex && mouseEnter">{{ item }}</slot>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'List',
  model: {
      prop: 'currentIndex',
      event: 'change'
  },
  props: {
    list: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      required: true
    },
    itemShowCount: {
      type: Number,
      required: true
    },
    currentIndex: {
      type: Number,
      required: false
    }
  },
  data() {
    return {
      scrollLines: 0,
      mouseEnter: false,
      listNode: null,
      w: {},
    }
  },
  watch: {
    currentIndex: function (newVal, oldVal) {
      console.log('List:currentIndex', newVal, oldVal)
    },
    scrollLines: function (newVal, oldVal) {
      console.log('List:scrollLines', newVal, oldVal)
    }
  },
  methods: {
    tt() {
      alert('s')
    }
  },
  mounted() {
    this.listNode = document.querySelector('.list');

    // 滚动处理
    let self=this;
    self.w.timer = null
    self.w.t2 = self.w.t1 = 0;
    self.w.flag = true;
    self.w.speed = 100;
    this.listNode.addEventListener("scroll", function (e) {
      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function() {
        self.w.t2 = e.target.scrollTop;

        if(self.w.t2 == self.w.t1){
          if(e.target.scrollTop%self.itemHeight != 0) {
            self.w.speed = 1;
            console.log(self.w.speed);
            if(self.w.flag) { // 向下滚动
              e.target.scrollTop += 1;
            } else {
              e.target.scrollTop -= 1;
            }
          } else {
            self.w.speed = 100;
            self.scrollLines = e.target.scrollTop/self.itemHeight;
            if(self.currentIndex < self.scrollLines)
              self.$emit('change', self.scrollLines);
            else if(self.currentIndex >= self.scrollLines+self.itemShowCount)
              self.$emit('change', self.scrollLines+self.itemShowCount-1);
          }
        }
      }, self.w.speed);

      self.w.flag = self.w.t1 < e.target.scrollTop
      self.w.t1 = e.target.scrollTop;
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list {
  padding: 0;
  margin: 0;
  overflow: scroll;
}
</style>
