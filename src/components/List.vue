<template>
  <ul
    class="list"
    :style="{ height: (itemHeight*itemShowCount)+'px' }"
    :infinite-scroll-disabled="scrollDisabled"
    v-infinite-scroll="load"
    @mouseenter="ulEnter"
    @mouseleave="ulLeave"
    @mousedown="w.ulOn = true;"
    @mouseup="w.ulOn = false"
    @contextmenu="w.ulOn = false">
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
      // 鼠标移动事件
      if(this.mouseIndex != -1
        && this.mouseIndex != this.list.length
        && this.mouseIndex == newVal) return;

      // 键盘触发的事件

      if(newVal > oldVal) {
        // 向下移动
        if(this.currentIndex >= this.list.length) {
          this.scrollLines = 0;
          this.$el.scrollTop = 0;
          this.$emit('change', 0);
        } else if(newVal >= this.scrollLines+this.itemShowCount) {
          this.scrollLines++;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
        }
      } else {
        if(newVal < 0) {
          this.scrollLines = this.list.length-this.itemShowCount < 0
                            ? 0
                            : this.list.length-this.itemShowCount;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
          this.$emit('change', this.list.length-1);
        } else if(newVal < this.scrollLines) {
          this.scrollLines--;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
        }
      }

      this.mouseRealMoveRegister();
    },
    list: function (newVal, oldVal) {
      // 搜索时列表数量发生变化，可能不需要滚动条
      if(newVal.length <= this.itemShowCount
      && oldVal.length > this.itemShowCount) {
          this.$el.className = "list";
        }
    }
  },
  methods: {
    ulEnter() {
      this.w.ulEnter = true;

      // 由于鼠标移动一定会显示滚动条，这里会重复，就注释掉了
      // if(this.mouseStart == true && this.list.length > this.itemShowCount) {
      //   clearTimeout(this.w.scrollTimer)
      //   this.$el.className = "list scroll";
      // }
    },
    ulLeave() {
      this.w.ulEnter = false;

      // 这样切换工作区就不会触发鼠标事件
      this.mouseRealMoveRegister();

      // 使得鼠标离开时自动隐藏滚动条
      if(this.list.length > this.itemShowCount) {
        clearTimeout(this.w.scrollTimer);
        this.w.scrollTimer=setTimeout(() => {
          this.$el.className = "list";
        }, 700);
      }
    },

    mouseSelect(index) {
      // 防溢出
      // 无限滚动会出现浮点数的情况
      // 根据滚动方向判断是进位还是退位
      // let scrollLines = Math.ceil(this.$el.scrollTop/this.itemHeight);
      let scrollLines = 0;
      if(this.w.flag) { // 向上滚动
        scrollLines = Math.ceil(this.$el.scrollTop/this.itemHeight);
      } else {
        scrollLines = Math.floor(this.$el.scrollTop/this.itemHeight);
      }
      if(index < scrollLines)
        index = scrollLines;
      else if(index >= scrollLines+this.itemShowCount)
        index = scrollLines+this.itemShowCount-1;
      this.mouseIndex = index;

      // 列表滚动时就不选择了，这样体验更好
      if(this.w.isScrolling) {
        return;
      }

      if(this.mouseStart == true) {
        this.$emit('change', index);
      }
      if(this.w.index == 0) this.w.index = 2;
    },
    load() {
      this.$emit('load');
    },
    mouseRealMoveRegister() {
      if( ! this.mouseStart) return;

      // 关闭鼠标事件
      this.mouseStart = false;


      let self = this;

      // 未触发滚动的隐藏由 mousemove 来解决
      if(self.mouseIndex != -1) {
        clearTimeout(self.w.scrollTimer);
        self.w.scrollTimer=setTimeout(() => {
          self.$el.className = "list";
        }, 700);
      }

      this.$el.addEventListener('mousemove', function mousemoveWatch() {
        // mouseSelect 可能会先触发
        if(self.w.index == 2) {
          self.w.index = 1;
          return;
        }
        // 我先触发
        if(self.w.index == 0) {
          self.w.index = 1;
          return;
        }

        // 鼠标移动时显示滚动条
        if(self.list.length > self.itemShowCount) {
          clearTimeout(self.w.scrollTimer)
          self.$el.className = "list scroll";
        }

        if(self.mouseIndex == -1) return;
        if(self.mouseIndex >= self.list.length) return;

        // 激活鼠标事件
        self.mouseStart = true;
        this.removeEventListener('mousemove', mousemoveWatch);
        self.$emit('change', self.mouseIndex);
      })
    },
  },
  mounted() {
    // document.body.style.cursor = "none";
    this.mouseRealMoveRegister();

    // 滚动处理
    let self=this;
    self.w.index = 0;
    self.w.timer = null
    self.w.t2 = self.w.t1 = 0;
    self.w.flag = true;
    self.w.speed = 100;
    this.$el.addEventListener("scroll", function (e) {

      // 真是奇葩，这个scrollTop并不一定正确，向上滚动会增大，但是到后面有可能会变小，无语
      self.w.flag = self.w.t1 < e.target.scrollTop
      self.w.t1 = e.target.scrollTop;

      self.w.isScrolling = true;
      if(self.list.length > self.itemShowCount) {
        self.$el.className = "list scroll";
      }

      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function scrollWatch() {
        self.w.t2 = e.target.scrollTop;
        if(self.w.t2 == self.w.t1 && self.w.ulOn != true){
          if(e.target.scrollTop%self.itemHeight != 0) {
            self.w.speed = 1;
            if(self.w.flag) { // 向上滚动
              e.target.scrollTop += 1;
            } else {
              e.target.scrollTop -= 1;
            }
          } else {
            self.w.speed = 100;
            self.scrollLines = e.target.scrollTop/self.itemHeight;

            self.w.isScrolling = false;
            if(self.w.ulEnter != true
              || (self.mouseStart == false && self.mouseIndex != -1)) {
              clearTimeout(self.w.scrollTimer);
              self.w.scrollTimer = setTimeout(() => {
                self.$el.className = "list";
              }, 700);
            }

            // 当列表滚动时，如果鼠标出现在列表中，则不触发更新，这样鼠标事件本身
            // 就会让当前鼠标所指向的项目选中
            if( ! (self.mouseIndex == -1 || self.mouseStart == false)){
              self.mouseSelect(self.mouseIndex);
              return;
            }

            // 保持当前窗口有被选中
            if(self.currentIndex < self.scrollLines)
              self.$emit('change', self.scrollLines);
            else if(self.currentIndex >= self.scrollLines+self.itemShowCount)
              self.$emit('change', self.scrollLines+self.itemShowCount-1);
          }
        } else if(self.w.t2 == self.w.t1 && self.w.ulOn == true) {
          self.w.timer = setTimeout(scrollWatch, self.w.speed);
        }
      }, self.w.speed);
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list {
  padding: 0 10px;
  margin: 0;
  overflow: auto;
  /* scroll-snap-type: block mandatory; */
}
/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
.list::-webkit-scrollbar {
  width: 0;
  background: transparent;
}
/*定义滑块内阴影+圆角*/
.list::-webkit-scrollbar-thumb {
  border-radius: 5px;
  /* border-left: 1px solid yellow;
  border-right: 1px solid yellow; */
  /* -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3); */
  /* background-color: #555; */

  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  box-shadow: inset 0 0 0 5px #737373;
  background-color: transparent;
}
/*定义滚动条轨道内阴影+圆角*/
/* .list::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  background: transparent;
} */
.list.scroll {
  padding: 0 0 0 10px;
}
.list.scroll::-webkit-scrollbar {
  width: 10px;
}

.list-item {
  overflow: hidden;
  /* scroll-snap-align: end; */
}
</style>
