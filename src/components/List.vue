<template>
  <ul
    class="list"
    :style="{ height: (itemHeight*itemShowCount)+'px' }"
    infinite-scroll-disabled="scrollDisabled"
    v-infinite-scroll="load">
    <li
      class="list-item"
      v-for="(item, index) in list"
      :key="index"
      @mouseenter="mouseSelect(index)"
      @mouseleave="mouseIndex=-1"
      :style="{ height: itemHeight+'px' }">
      <slot
        :index="index"
        :item="item"
        :isSelected="index==currentIndex"
        :isActive="index==currentIndex
                  && currentIndex==mouseIndex
                  && mouseStart == true">{{ item }}</slot>
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
      required: require,
    },
    scrollDisabled: {
      type: Boolean,
      require: false,
      default: true,
    }
  },
  data() {
    return {
      scrollLines: 0,
      mouseIndex: -1,
      mouseStart: true,
      w: {},
    }
  },
  watch: {
    currentIndex: function (newVal, oldVal) {
      console.log('List:currentIndex', newVal, oldVal)
      console.log('this.mouseIndex', this.mouseIndex)
      console.log('this.list.length', this.list.length)
      // 鼠标移动事件
      if(this.mouseIndex != -1
        && this.mouseIndex != this.list.length
        && this.mouseIndex == newVal) return;

      // 键盘触发的事件
      console.log('keychange')

      if(newVal > oldVal) {
        // 向下移动
        if(this.currentIndex >= this.list.length) {
          console.log('aaaa')
          this.scrollLines = 0;
          this.$el.scrollTop = 0;
          this.$emit('change', 0);
        } else if(newVal >= this.scrollLines+this.itemShowCount) {
          console.log('bbbb')
          this.scrollLines++;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
        }
      } else {
        if(newVal < 0) {
          console.log('cccc')
          this.scrollLines = this.list.length-this.itemShowCount;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
          this.$emit('change', this.list.length-1);
        } else if(newVal < this.scrollLines) {
          console.log('dddd')
          this.scrollLines--;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
        }
      }

      this.mouseRealMoveRegister();
    },
    scrollLines: function (newVal, oldVal) {
      console.log('List:scrollLines', newVal, oldVal)
    },
    mouseIndex: function (newVal, oldVal) {
      console.log('List:mouseIndex', newVal, oldVal)
    },
    mouseStart: function (newVal, oldVal) {
      console.log('List:mouseStart', newVal, oldVal)
    },
    list: function (newVal, oldVal) {
      console.log('List:List', newVal, oldVal)
    },
  },
  methods: {
    mouseSelect(index) {
      console.warn('mouseSelect:'+this.mouseStart);
      // 防溢出
      // 无限滚动会出现浮点数的情况
      let scrollLines = parseInt(this.$el.scrollTop/this.itemHeight);
      if(index < scrollLines)
        index = scrollLines;
      else if(index >= scrollLines+this.itemShowCount)
        index = scrollLines+this.itemShowCount-1;

      this.mouseIndex = index;
      if(this.mouseStart == true) {
        this.$emit('change', index);
      }
      if(this.w.index == 0) this.w.index = 2;
    },
    load() {
      console.log('load', arguments);
      this.$emit('load');
    },
    mouseRealMoveRegister() {
      if( ! this.mouseStart) return;

      // 关闭鼠标事件
      this.mouseStart = false;
      console.log('mouseRealMoveRegister');

      let self = this;
      this.$el.addEventListener('mousemove', function mousemovewatch() {
        console.log('mousemovewatch')

        // mouseSelect 可能会先触发
        if(self.w.index == 2) {
          self.w.index = 1;
          return;
        }
        if(self.w.index == 0) self.w.index = 1;

        if(self.mouseIndex == -1) return;
        if(self.mouseIndex >= self.list.length) return;
        console.log('mousemovewatch2222')

        // alert('move')
        // 激活鼠标事件
        self.mouseStart = true;
        this.removeEventListener('mousemove', mousemovewatch);
        self.$emit('change', self.mouseIndex);
        // document.body.style.cursor = "default";
      })
    },
  },
  mounted() {
    // todo
    window.list = this;

    // document.body.style.cursor = "none";
    this.w.index = 0;
    this.mouseRealMoveRegister();

    // 滚动处理
    let self=this;
    self.w.timer = null
    self.w.t2 = self.w.t1 = 0;
    self.w.flag = true;
    self.w.speed = 100;
    this.$el.addEventListener("scroll", function (e) {

      // 真实奇葩，这个scrollTop并不一定正确，向上滚动会增大，但是到后面有可能会变小，无语
      console.log('qq  flag', self.w.t1 , e.target.scrollTop)
      self.w.flag = self.w.t1 < e.target.scrollTop
      self.w.t1 = e.target.scrollTop;

      console.log("scroll")
      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function() {
        self.w.t2 = e.target.scrollTop;
        // console.log('scroll-timeout', self.w.t2, self.w.t1)
        if(self.w.t2 == self.w.t1){
          console.log('flag-------------', '结束');
          if(e.target.scrollTop%self.itemHeight != 0) {
            // console.log('scroll-update1', e.target.scrollTop)
            self.w.speed = 1;
            console.log('flag=======', self.w.flag, self.w.flag == true ? '向上' : '向下');
            if(self.w.flag) { // 向上滚动
              e.target.scrollTop += 1;
            } else {
              e.target.scrollTop -= 1;
            }
            // console.log('scroll-update2', e.target.scrollTop)
          } else {
            self.w.speed = 100;
            self.scrollLines = e.target.scrollTop/self.itemHeight;

            if( ! (self.mouseIndex == -1 || self.mouseStart == false)) return;

            console.log('scroll-finish2');
            // 保持当前窗口有被选中
            if(self.currentIndex < self.scrollLines)
              self.$emit('change', self.scrollLines);
            else if(self.currentIndex >= self.scrollLines+self.itemShowCount)
              self.$emit('change', self.scrollLines+self.itemShowCount-1);
          }
        }
      }, self.w.speed);
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
.list-item {
  overflow: hidden;
}
</style>
