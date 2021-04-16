<template>
  <ul
    class="list"
    :style="{ height: (itemHeight*itemShowCount)+'px' }">
    <li
      class="list-item"
      v-for="(item, index) in list"
      :key="index"
      @mouseenter="mouseSelect(index)"
      @mouseleave="mouseIndex=-1;aa(index)">
      <slot
        name="item"
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
    }
  },
  data() {
    return {
      scrollLines: 0,
      mouseIndex: -1,
      mouseStart: true,
      listNode: null,
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
          this.listNode.scrollTop = 0;
          this.$emit('change', 0);
        } else if(newVal >= this.scrollLines+this.itemShowCount) {
          console.log('bbbb')
          this.scrollLines++;
          this.listNode.scrollTop = this.scrollLines*this.itemHeight;
        }
      } else {
        if(newVal < 0) {
          console.log('cccc')
          this.scrollLines = this.list.length-this.itemShowCount;
          this.listNode.scrollTop = this.scrollLines*this.itemHeight;
          this.$emit('change', this.list.length-1);
        } else if(newVal < this.scrollLines) {
          console.log('dddd')
          this.scrollLines--;
          this.listNode.scrollTop = this.scrollLines*this.itemHeight;
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
  },
  methods: {
    aa(index) {
      console.warn('leave', index)
    },
    mouseSelect(index) {
      console.warn('mouseSelect:'+this.mouseStart);
      let scrollLines = this.listNode.scrollTop/this.itemHeight;
      if(index < scrollLines)
        index = scrollLines;
      else if(index >= scrollLines+this.itemShowCount)
        index = scrollLines+this.itemShowCount-1;

      this.mouseIndex = index;
      if(this.mouseStart==true) {
        this.$emit('change', index);
      }
      if(this.w.index == 0) this.w.index = 2;
    },
    mouseRealMoveRegister() {
      if(this.mouseStart) {
        this.mouseStart = false;
        console.log('mouseRealMoveRegister');

        let self = this;
        this.listNode.addEventListener('mousemove', function mousemovewatch() {
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
          self.mouseStart = true;
          this.removeEventListener('mousemove', mousemovewatch);
          self.$emit('change', self.mouseIndex);
          document.body.style.cursor = "default";
        })
      }
    },
  },
  mounted() {
    // todo
    window.list = this;

    document.body.style.cursor = "none";
    this.listNode = document.querySelector('.list');
    this.w.index = 0;
    this.mouseRealMoveRegister();

    // 滚动处理
    let self=this;
    self.w.timer = null
    self.w.t2 = self.w.t1 = 0;
    self.w.flag = true;
    self.w.speed = 100;
    this.listNode.addEventListener("scroll", function (e) {
      console.log("scroll")
      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function() {
        self.w.t2 = e.target.scrollTop;
        // console.log('scroll-timeout', self.w.t2, self.w.t1)
        if(self.w.t2 == self.w.t1){
          if(e.target.scrollTop%self.itemHeight != 0) {
            // console.log('scroll-update1', e.target.scrollTop)
            self.w.speed = 1;
            if(self.w.flag) { // 向下滚动
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
