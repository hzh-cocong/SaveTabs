<template>
<!-- height: (itemHeight*itemShowCount)+'px', -->
  <ul
    class="list"
    :style="{ maxHeight: (itemHeight*itemShowCount)+'px',
              '--scrollbar_color': scrollbarColor,
              '--scrollbar_focus_color': scrollbarFocusColor }"
    :infinite-scroll-disabled="scrollDisabled"
    v-infinite-scroll="load"
    @mouseenter="ulEnter"
    @mouseleave="ulLeave"
    @mousedown="w.ulOn = true;"
    @mouseup="w.ulOn = false"
    @contextmenu="w.ulOn = false">

    <!-- 这里不要使用 list.length，不然会很卡，也知道为啥，猜测是 vue 会检查整个 list 是否发生变化导致，改成外部传入就圆满了 -->
    <template v-for="(item, index) in list">
      <li
        v-if="index >= (rangeUp)-scrollCache && index <= (rangeDown+itemShowCount-1)+scrollCache"
        class="list-item"
        :key="index"
        :class="[typeof itemClassName === 'function'
                  ? itemClassName({ index,
                                    item,
                                    isSelected: index==currentIndex,
                                    isActive: index==currentIndex
                                            && currentIndex==mouseIndex
                                            && mouseStart == true})
                  : itemClassName]"
        :style="[{ height: index > (rangeUp)-scrollCache && index < (rangeDown+itemShowCount-1)+scrollCache
                      ? itemHeight+'px'
                      : ( index == rangeUp-scrollCache
                        ? (index+1)*itemHeight+'px'
                        : (listLength-index)*itemHeight+'px'),
                  },

                  typeof itemStyle === 'function'
                  ? itemStyle({ index,
                                item,
                                isSelected: index==currentIndex,
                                isActive: index==currentIndex
                                        && currentIndex==mouseIndex
                                        && mouseStart == true})
                  : itemStyle]"
        @click="$emit('itemClick', $event, index, item)"
        @mouseenter="mouseSelect(index)"
        @mouseleave="mouseIndex=-1">
        <slot
          :index="index"
          :item="item"
          :isSelected="index==currentIndex"
          :isActive="index==currentIndex
                    && currentIndex==mouseIndex
                    && mouseStart == true">{{ item }}</slot>
      </li>
    </template>

    <!-- <li
      v-for="(item, index) in list"
      v-if="index >= (rangeUp)-scrollCache && index <= (rangeDown+itemShowCount-1)+scrollCache
          || index == list.length-1"
      class="list-item"
      :key="index"
      :style="{ height: index > (rangeUp)-scrollCache && index < (rangeDown+itemShowCount-1)+scrollCache
                      || index == list.length-1
                    ? itemHeight+'px'
                    : ( index == rangeUp-scrollCache
                      ? (index+1)*itemHeight+'px'
                      : ((list.length-index-itemShowCount)-1)*itemHeight+'px'),
                }"
      @mouseenter="mouseSelect(index)"
      @mouseleave="mouseIndex=-1">
      <slot
        :index="index"
        :item="item"
        :isSelected="index==currentIndex"
        :isActive="index==currentIndex
                  && currentIndex==mouseIndex
                  && mouseStart == true">{{ item }}</slot>
    </li> -->

<!--
    <li
      v-for="(item, index) in list"
      v-if="index >= scrollLines-1 && index < scrollLines+itemShowCount+1
          || index == listLength"
      class="list-item"
      :key="index"
      :style="{ height: index >= scrollLines && index < scrollLines+itemShowCount
                      ? itemHeight+'px'
                      : ( index == scrollLines-1
                        ? scrollLines*itemHeight+'px'
                        : (list.length-scrollLines-itemShowCount)*itemHeight+'px'),
                }"
      @mouseenter="mouseSelect(index)"
      @mouseleave="mouseIndex=-1">
      <slot
        :index="index"
        :item="item"
        :isSelected="index==currentIndex"
        :isActive="index==currentIndex
                  && currentIndex==mouseIndex
                  && mouseStart == true">{{ item }}</slot>
    </li>
 -->

<!--
    <li
      v-for="(item, index) in list"
      v-if="index >= scrollLines-1 && index < scrollLines+itemShowCount+1"
      class="list-item"
      :key="index"
      :style="{ height: index >= scrollLines && index < scrollLines+itemShowCount
                      ? itemHeight+'px'
                      : ( index == scrollLines-1
                        ? scrollLines*itemHeight+'px'
                        : (list.length-scrollLines-itemShowCount)*itemHeight+'px'),
                }"
      @mouseenter="mouseSelect(index)"
      @mouseleave="mouseIndex=-1">
      <slot
        :index="index"
        :item="item"
        :isSelected="index==currentIndex"
        :isActive="index==currentIndex
                  && currentIndex==mouseIndex
                  && mouseStart == true">{{ item }}</slot>
    </li> -->

    <!-- <li
      v-for="(item, index) in list"
      class="list-item"
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
    </li> -->
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
      required: true,
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
    listLength: {
      type: Number,
      require: false,
      default: 0,
    },
    itemClassName: {
      type: [String, Function],
      require: false,
      default: '',
    },
    itemStyle: {
      type: [Object, Function],
      require: false,
      default: function() {
        return {};
      },
    }
  },
  data() {
    return {
      scrollLines: 0,
      mouseIndex: -1,
      mouseStart: true,

      // // 指 scrollLines 的上方活动访问，或者下方，即实际有两倍的 scrollRange
      // // 注意该值只绑定一次，以后 itemShowCount 变了 scrollRange 也不会变
      // scrollRange: this.itemShowCount,
      // // 缓冲地带，即当 scrollLines 超出 scrollRange 时，可能会出现空白，而缓冲就是为了填补这片空白的
      // // 同样分为上方或者下方，只单独作用于对应的方向
      // scrollCache: this.itemShowCount,

      rangeUp: 0,
      rangeDown: 0, // 2*this.itemShowCount,

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

        // isScrolling: false,
      },
    }
  },
  watch: {
    currentIndex: function (newVal, oldVal) {
      // 鼠标移动事件
      if(this.mouseIndex != -1
      && this.mouseIndex != this.list.length
      && this.mouseIndex == newVal) return;

      // 键盘触发的事件

      if(this.list.length == 0) {
        this.scrollLines = 0;
        this.$el.scrollTop = 0;
        this.$emit('change', -1);
        return;
      }

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
      // 提供兼容性，在并发下 scrollDisabled = false，且 newVal.length = 0 hisotry 会导致死循环（该问题已被解决，但还是要预防着）
      // list.push 所产生的事件也是这个，所以要再加个长度限制
      // splice 会触发变动，但是 newVal 和 oldVal 是一样的
      if(newVal.length == oldVal.length && newVal.length == 0) return;

      // 搜索时列表数量发生变化，可能不需要滚动条
      if(newVal.length <= this.itemShowCount
      && oldVal.length > this.itemShowCount) {
        this.$el.className = "list";
      }

      // 解决由于列表被删除时触底加载问题（v-infinite-scroll 需要靠滚动事件，但这个并不会触发，所以需要我们自己处理）
      if(this.scrollDisabled == false
      && newVal.length-this.scrollLines <= this.itemShowCount) {
        this.load();
      }

      if(newVal.length == 0) {
        if(this.currentIndex != -1) this.$emit('change', -1);
      } else if(this.currentIndex >= newVal.length) {
        this.$emit('change', newVal.length-1);
      }
    },
    scrollLines(newVal, oldVal) {
      if(newVal < this.rangeUp || newVal > this.rangeDown) {
        this.rangeUp = this.getRangeUp();
        this.rangeDown = this.getRangeDown();
      }
    },
    itemShowCount(newVal, oldVal) {
      this.rangeUp = this.getRangeUp();
      this.rangeDown = this.getRangeDown();
    },
  },
  computed: {
    visiualIndex() {
      return this.currentIndex-this.scrollLines;
    },
    scrollRange() {
      // 指 scrollLines 的上方活动访问，或者下方，即实际有两倍的 scrollRange
      return 2*this.itemShowCount;
      // return 1;
    },
    scrollCache() {
      // 缓冲地带，即当 scrollLines 超出 scrollRange 时，可能会出现空白，而缓冲就是为了填补这片空白的
      // 同样分为上方或者下方，只单独作用于对应的方向
      return Math.ceil(this.itemShowCount/2);
      // 弄再大还是会有闪烁问题
      // return this.itemShowCount;
      // return this.itemShowCount+1000;
      // return 1;
    }
  },
  methods: {
    getRangeUp() {
      // scrollLines < rangeUp 时，rangeUp 将更新

      let rangeUp = this.scrollLines - this.scrollRange;
      if(rangeUp < 0)
        rangeUp = 0;
      else if(rangeUp+2*this.scrollRange >= this.list.length)
        rangeUp = this.list.length-this.itemShowCount-2*this.scrollRange;
      return rangeUp;
    },
    getRangeDown() {
      // scrollLines > rangeDown rangeDown 将更新

      let rangeDown = this.rangeUp+2*this.scrollRange;
      // 由于 rangeUp 已经提前做了判断，所以到了这里这种事是不可能发生的
      if(this.rangeUp > 0 && rangeDown >= this.list.length) {
        rangeDown = this.list.length-this.itemShowCount;
      }
      return rangeDown;
    },

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
      // 鼠标在靠近边界时会触发下一个而非当前个，所以这里要限制一下
      if(index < this.scrollLines)
        index = this.scrollLines;
      else if(index >= this.scrollLines+this.itemShowCount)
        index = this.scrollLines+this.itemShowCount-1;

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
      // 滚动开始（滚动过程中一直会调用这个方法）
      let self = this;

      // 真是奇葩，这个scrollTop并不一定正确，向上滚动会增大，但是到后面有可能会变小，无语
      self.w.flag = self.w.t1 < e.target.scrollTop
      self.w.t1 = e.target.scrollTop;

      self.w.isScrolling = true;
      if(self.list.length > self.itemShowCount) {
        self.$el.className = "list scroll";
      }

      // if(e.target.scrollTop%self.itemHeight == 0) {
      //   self.scrollLines = e.target.scrollTop/self.itemHeight;
      // }
      if(self.w.flag) { // 向上滚动
        self.scrollLines = Math.ceil(e.target.scrollTop/self.itemHeight);
      } else {
        self.scrollLines = Math.floor(e.target.scrollTop/self.itemHeight);
      }

      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function scrollWatch() {
        self.w.t2 = e.target.scrollTop;

        if(self.w.t2 == self.w.t1 && self.w.ulOn != true){
          if(e.target.scrollTop%self.itemHeight != 0) {
            // 注意，由于 scrollTop 改变，会再次触发 scoll 事件，所以 speed = 0 是为了其立即执行，不过由于js的事件循环，其依然是在最后运行的
            self.w.speed = 0;
            self.w.moveStep = self.itemHeight*2/50 < 1 ? 1 : self.itemHeight*2/50;

            let oldScrollTop = e.target.scrollTop;

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
            // 只有在网页被放大或缩小时会出现
            if(oldScrollTop == e.target.scrollTop) {
              // 不使用 self.w.flag，并不准确
              let scrollTop = Math.round(e.target.scrollTop/self.itemHeight)*self.itemHeight;

              // 改赋值无效，否则也不会运行到这里
              // e.target.scrollTop = scrollTop;

              self.scrollEnd(scrollTop);
            }
          } else {
            self.scrollEnd(e.target.scrollTop);
          }
        } else if(self.w.t2 == self.w.t1 && self.w.ulOn == true) {
          self.w.speed = 100;
          // 手动拖动滚动条，释放滚动条后触发
          self.w.timer = setTimeout(scrollWatch, self.w.speed);
        }
      }, self.w.speed);
    },
    scrollEnd(scrollTop) {
      this.w.speed = 100;
      this.scrollLines = scrollTop/this.itemHeight;

      this.w.isScrolling = false;
      if(this.w.ulEnter != true
        || (this.mouseStart == false && this.mouseIndex != -1)) {
        // 鼠标离开了插件，或者出现在插件中，但是并未触发选择
        this.$el.className = "list";
      }

      // 当列表滚动时，如果鼠标出现在列表中，则不触发更新，这样鼠标事件本身
      // 就会让当前鼠标所指向的项目选中
      if( ! (this.mouseIndex == -1 || this.mouseStart == false)){
        this.mouseSelect(this.mouseIndex, scrollTop%this.itemHeight);
        this.$emit('scrollEnd');
        return;
      }

      // 保持当前窗口有被选中
      if(this.currentIndex < this.scrollLines)
        this.$emit('change', this.scrollLines);
      else if(this.currentIndex >= this.scrollLines+this.itemShowCount)
        this.$emit('change', this.scrollLines+this.itemShowCount-1);

      this.$emit('scrollEnd');
    },

    // index 为当前视图的行数而非整个列表
    choice(index) {
      let currentIndex = index+this.scrollLines-1;
      if(index > this.itemShowCount || currentIndex >= this.list.length) {
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
    },
    // 移动列表，使得当前被选中行处于窗口的 index 位置（index 从 0 算起）
    currentTo(index) {
      // 超出表面则拉回表面
      if(index < 0) index = 0;
      else if(index >= this.itemShowCount) index = this.itemShowCount-1;

      // 恰好，一开始 this.visiualIndex = -1，index 无论取何值都不会错过
      // 虽然如此，但一开始是不会调用这个的，因为很多依赖还未更新
      // 还是以最后的 $el.scrollTop 值为准
      // if(index == this.visiualIndex) return;

      let scrollLines;
      if(index < this.visiualIndex) {
        // 往上滚动（一开始会得出负值）
        scrollLines = this.scrollLines+(this.visiualIndex-index);
      } else {
        // 往下滚动
        scrollLines = this.scrollLines-(index-this.visiualIndex);
      }

      // 不得超出可视区域
      if(scrollLines < 0) {
        scrollLines = 0;
      } else if(this.list.length < this.itemShowCount) {
        scrollLines = 0;
      } else if(scrollLines > this.list.length-this.itemShowCount) {
        scrollLines = this.list.length-this.itemShowCount;
      }

      // 一开始 this.scrollLines 从负值被强制变为 0，所以相等，被跳过了。
      // 还是以最后的 $el.scrollTop 值为准备
      // if(scrollLines == this.scrollLines) return;

      this.scrollLines = scrollLines;

      // 列表长度可能发生变化，但此时 dom 还未更新，而 scrollTop 则是立刻更新 dom 的，使用定时器将会把任务放到最后面，即 list dom 更新后
      let scrollTop = this.scrollLines*this.itemHeight;
      if(this.$el.scrollTop != scrollTop) {
        this.$nextTick(() => {
          this.$el.scrollTop = scrollTop;
        });
      }
    },
  },
  beforeUpdate() {
    console.warn('list:beforeUpdate', this.$el.scrollTop);
  },
  updated() {
    console.warn('list:updated', this.$el.scrollTop);
  },
  mounted() {
    // 一开始尽量显示少一点，一半就行了，加快启动速度
    this.rangeDown = this.scrollRange;

    // this.rangeUp = this.getRangeUp();
    // this.rangeDown = this.getRangeDown();

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

  list-style: none;
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

  /* list-style-type: none;
  margin: 0;
  padding: 0; */
}
</style>
