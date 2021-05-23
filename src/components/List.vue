<template>
  <ul
    class="list"
    :style="{ height: (itemHeight*itemShowCount)+'px',
              '--scrollbar_color': scrollbarColor,
              '--scrollbar_focus_color': scrollbarFocusColor }"
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
    },
    scrollbarColor: {
      type: String,
      require: false,
      default: 'rgba(127, 127, 127, .6)',
    },
    scrollbarFocusColor: {
      type: String,
      require: false,
      default: 'rgba(127, 127, 127, .9)',
    },
  },
  data() {
    return {
      scrollLines: 0,
      mouseIndex: -1,
      mouseStart: true,

      w: {
        index: 0,
        timer: null,
        t2: 0,
        t1: 0,
        flag: true,
        speed: 100,

        // 无需提前定义
        // ulEnter: false,
        // scrollTimer: null,
        // ulOn: false,

        isScrolling: false,
      },
    }
  },
  watch: {
    currentIndex: function (newVal, oldVal) {
      console.log('currentIndex');

      // 鼠标移动事件
      if(this.mouseIndex != -1
        && this.mouseIndex != this.list.length
        && this.mouseIndex == newVal) return;

      // 键盘触发的事件
console.log('currentIndex', newVal, oldVal)
      if(newVal > oldVal) {
        // 向下移动
        if(newVal >= this.list.length) {
          // 到底反弹
          this.scrollLines = 0;
          this.$el.scrollTop = 0;
          this.$emit('change', 0);
        } else if(newVal >= this.scrollLines+this.itemShowCount) {
          // this.scrollLines++;

          // 可能多一次一行，也可能跳行
          this.scrollLines = newVal-this.itemShowCount+1;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
        }
      } else {
        // 向上移动
        if(newVal < 0) {
          // 到顶反弹
          this.scrollLines = this.list.length-this.itemShowCount < 0
                            ? 0
                            : this.list.length-this.itemShowCount;
          this.$el.scrollTop = this.scrollLines*this.itemHeight;
          this.$emit('change', this.list.length-1);
        } else if(newVal < this.scrollLines) {
          // this.scrollLines--;

          // 可能多一次一行，也可能跳行
          this.scrollLines = newVal;
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
  computed: {
    visiualIndex() {
      console.log('visiualIndex', this.currentIndex-this.scrollLines)
      return this.currentIndex-this.scrollLines;
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
        this.$el.className = "list";
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
        self.$el.className = "list";
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
    scrollDeal(e) {
      // console.log('scrollDeal', e)

      let self = this;

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
        console.log('ff', self.w.t2, self.w.t1, self.w.ulOn)
        if(self.w.t2 == self.w.t1 && self.w.ulOn != true){
          if(e.target.scrollTop%self.itemHeight != 0) {
            // 注意，由于 scrollTop 改变，会再次触发 scoll 事件，所以 speed = 0 是为了其立即执行，不过由于js的事件循环，其依然是在最后运行的
console.log('a')
            self.w.speed = 0;
            // self.w.moveStep = 2;
            self.w.moveStep = self.itemHeight*2/50 < 1 ? 1 : self.itemHeight*2/50;
            // console.log('8888888888')
            if(self.w.flag) { // 向上滚动
            //*
              e.target.scrollTop += self.itemHeight-e.target.scrollTop%self.itemHeight < self.w.moveStep
                                  ? self.itemHeight-e.target.scrollTop%self.itemHeight
                                  : self.w.moveStep;/*/
              e.target.scrollTop += 1;//*/
            } else {
              //*
              e.target.scrollTop -= e.target.scrollTop%self.itemHeight < self.w.moveStep
                                  ? e.target.scrollTop%self.itemHeight
                                  : self.w.moveStep;/*/
              e.target.scrollTop -= 1;//*/
            }
          } else {console.log(self.scrollLines,  e.target.scrollTop, e.target.scrollTop/self.itemHeight);
            self.w.speed = 100;
            self.scrollLines = e.target.scrollTop/self.itemHeight;

            self.w.isScrolling = false;
            if(self.w.ulEnter != true
              || (self.mouseStart == false && self.mouseIndex != -1)) {
              self.$el.className = "list";
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
    },

    choice(index) {
      let currentIndex = index+this.scrollLines-1;
      if(currentIndex >= this.list.length || index > this.itemShowCount) {
        return false;
      }

      // this.currentIndex = currentIndex;
      this.$emit('change', currentIndex);
      return true;
    },
    // adjust() {

    // },

    // 移动列表，使得当前被选中行处于窗口最顶部
    currentToTop() {
      this.currentTo(0);
      // console.log('currentToTop', this.currentIndex, this.list.length, this.list.length-this.itemShowCount);
      // this.scrollLines = this.currentIndex < this.list.length-this.itemShowCount
      //                   ? this.currentIndex
      //                   : this.list.length-this.itemShowCount;
      // // 列表长度可能发生变化，但此时 dom 还未更新，而 scrollTop 则是立刻更新 dom 的，使用定时器将会把任务放到最后面，即 list dom 更新后
      // setTimeout(() => {
      //   this.$el.scrollTop = this.scrollLines*this.itemHeight;
      //   console.log('currentToTop2', this.scrollLines, this.$el.scrollTop, this.scrollLines*this.itemHeight);
      // }, 0)
    },
    // 移动列表，使得当前被选中行处于窗口的 index 位置（index 从 0 算起）
    currentTo(index) {
      console.log('currentTo 00 ', index, this.visiualIndex, this.scrollLines, this.scrollLines*this.itemHeight, this.$el.scrollTop);

      if(index < 0) index = 0;
      else if(index >= this.itemShowCount) index = this.itemShowCount-1;

      console.log('currentTo 01 ', index, this.visiualIndex);

      if(index == this.visiualIndex) return;

      console.log('currentTo', index, this.visiualIndex, this.scrollLines);

      if(index < this.visiualIndex) {
        scrollLines = this.scrollLines+(this.visiualIndex-index);
      } else {
        scrollLines = this.scrollLines-(index-this.visiualIndex);
      }

      console.log('currentTo2', scrollLines, this.scrollLines);

      let scrollLines;
      if(scrollLines < 0) {
        scrollLines = 0;
      } else if(scrollLines > this.list.length-this.itemShowCount) {
        scrollLines = this.list.length-this.itemShowCount;
      }

      console.log('currentTo3', scrollLines, this.scrollLines);

      if(scrollLines == this.scrollLines) return;

      this.scrollLines = scrollLines;

      // 列表长度可能发生变化，但此时 dom 还未更新，而 scrollTop 则是立刻更新 dom 的，使用定时器将会把任务放到最后面，即 list dom 更新后
      setTimeout(() => {
        this.$el.scrollTop = this.scrollLines*this.itemHeight;
      }, 0)


      // let scrollLines = this.currentIndex-index < this.list.length-this.itemShowCount
      //                   ? this.currentIndex-index
      //                   : this.list.length-this.itemShowCount;
      // console.log('currentTo', index, scrollLines, this.scrollLines)
      // if(scrollLines < 0 || scrollLines == this.scrollLines) {
      //   return;
      // }

      // this.scrollLines = scrollLines;

      // setTimeout(() => {
      //   this.$el.scrollTop = this.scrollLines*this.itemHeight;
      // }, 0)
    }
  },
  mounted() {
    // todo
    window.list = this;

    // document.body.style.cursor = "none";
    this.mouseRealMoveRegister();

    // 滚动处理
    this.$el.addEventListener("scroll", this.scrollDeal);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list {
  /* padding: 0 10px; */ /* overlay */
  padding: 0 0 0 10px; /* 非 overlay 会占用空间 */
  /*padding: 0 10px; /* 火狐样式 */
  /* padding-right: calc(100% - 100vw); */
  /* padding-left: calc(100vw - 100%); */
  margin: 0;
  /* overflow: overlay; */ /* element-ui 无限滚动不支持 overlay，且官方不再升级 */
  /* overflow: auto */ /* auto 的话，数据没有超出时，由于没有滚动条占位，会影响宽度 */
  overflow-y: scroll; /* 火狐无 overlay 属性，并且 scroll 不占用空间 */
  overflow-x: auto; /* 注意不能为 hidden，否则图片懒加载会失效 */
  /* scroll-snap-type: block mandatory; */

  /* 设置滚动条动画 */
  color: transparent;
  transition-property: color;
  transition-duration: .4s;
  transition-timing-function: ease;
  transition-delay: .5s;
}
/* 显示滚动条 */
.list.scroll {
  transition-duration: 0s;
  transition-delay: 0s;
  color: var(--scrollbar_color);
}
/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
.list::-webkit-scrollbar {
  width: 10px;
  background: transparent;
}
/*定义滑块内阴影+圆角*/
.list::-webkit-scrollbar-thumb {
  border-radius: 5px;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  box-shadow: inset 0 0 0 5px;
  background-color: transparent;
}
/* 点击滚动条时颜色加深 */
.list::-webkit-scrollbar-thumb:hover {
  box-shadow: inset 0 0 0 5px var(--scrollbar_focus_color);
}

.list-item {
  overflow: hidden;
  /* scroll-snap-align: end; */
}
</style>
