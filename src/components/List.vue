<template>
  <ul
    class="list"
    :style="{ height: (itemHeight*itemShowCount)+'px' }"
    :infinite-scroll-disabled="scrollDisabled"
    v-infinite-scroll="load"
    @mouseenter="test"
    @mouseleave="test2"
    @mousedown="test3"
    @mouseup="test4"
    @dblclick="test5"
    @click="test6"
    @contextmenu="test7">
    <li
      class="list-item"
      v-for="(item, index) in list"
      :key="index"
      @mouseenter="mouseSelect(index)"
      @mouseleave="tt"
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
      console.log('currentIndex', newVal, oldVal);
      // 鼠标移动事件
      if(this.mouseIndex != -1
        && this.mouseIndex != this.list.length
        && this.mouseIndex == newVal) return;
      console.log('currentIndex2', newVal, oldVal);

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
  },
  methods: {
    test() {
      console.log('ul enter', this.mouseStart);
      if(this.mouseStart == true) {
        clearTimeout(this.w.ss)
        this.$el.className = "list scroll";
      }
      this.w.ulEnter = true;
    },
    test2() {
      this.w.ulEnter = false;
      this.mouseRealMoveRegister(); // 这样切换工作区就不会触发鼠标事件
      console.log('ul leave');
      clearTimeout(this.w.ss);
      this.w.ss=setTimeout(() => {
        console.log('ss test2')
        this.$el.className = "list";
      }, 700);
      // this.$el.className = "list";
    },
    test3() {
      this.w.on = true;
      console.log('mousedown')
    },
    test4() {
      this.w.on = false;
      console.log('mouseup')
    },
    test5() {
      console.log('dblclick')
    },
    test6() {
      console.log('click')
    },
    test7() {
      this.w.on = false;
      console.log('contextmenu')
    },
    tt() {
      console.log('mouseleave')
      this.mouseIndex=-1;
    },
    mouseSelect(index) {
      console.log('mouseSelect:'+index)

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

      if(this.w.isScrolling) {
        // this.w.ss3 = index;
        return;
      }
      console.log('mouseSelect2')


      if(this.mouseStart == true) {
        this.$emit('change', index);
      }
      if(this.w.index == 0) this.w.index = 2;
    },
    load() {
      this.$emit('load');
    },
    mouseRealMoveRegister() {
      console.log('mouseRealMoveRegister', this.mouseStart)
      if( ! this.mouseStart) return;

      // 关闭鼠标事件
      this.mouseStart = false;


      let self = this;

      // 未触发滚动的隐藏由 mousemove 来解决
      if(self.mouseIndex != -1) {
        clearTimeout(self.w.ss);
        self.w.ss=setTimeout(() => {
          console.log('ss mousemove=========', self.mouseStart, self.mouseIndex)
          self.$el.className = "list";
        }, 700);
      }

      this.$el.addEventListener('mousemove', function mousemovewatch() {
        console.log('mousemove', self.mouseIndex, self.mouseStart)

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
// if(self.w.ss3 != -1) { console.log('mm'); self.mouseIndex = self.w.ss3; self.w.ss3 = -1 }


        clearTimeout(self.w.ss)
        self.$el.className = "list scroll";
        console.log('mousemove list scroll')

        if(self.mouseIndex == -1) return;
        if(self.mouseIndex >= self.list.length) return;

        // 只有鼠标就在当前位置才需要 mousemove 触发，其它情况 mouseSelect 会被触发
        // 注释掉是因为虽然 mouseSelect 虽然会被触发，但是由于 mouseStart 为false，并没有实际作用
        // 还是要靠这里
        // if(self.mouseIndex != self.currentIndex) {
        //   // console.log('pppppppppp', self.mouseIndex, self.currentIndex)
        //   return;
        // }

        // 激活鼠标事件
        self.mouseStart = true;
        this.removeEventListener('mousemove', mousemovewatch);
        self.$emit('change', self.mouseIndex);
        // document.body.style.cursor = "default";


        console.log('mousemove2')
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

      // 真实奇葩，这个scrollTop并不一定正确，向上滚动会增大，但是到后面有可能会变小，无语
      self.w.flag = self.w.t1 < e.target.scrollTop
      self.w.t1 = e.target.scrollTop;

// e.target.style.overflow = "overlay";
// clearTimeout(self.w.ss)
self.w.isScrolling = true;
e.target.className = "list scroll";

      clearTimeout(self.w.timer);
      self.w.timer = setTimeout(function ee() {
        self.w.t2 = e.target.scrollTop;
        if(self.w.t2 == self.w.t1 && self.w.on != true){
          console.log('f')
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

// e.target.style.overflow = "hidden";
self.w.isScrolling = false;
  console.log('ggggggggggggg1', self.w.ulEnter, self.mouseStart, self.mouseIndex)
  // self.w.ulEnter === false;
  // self.mouseStart == false && self.mouseIndex != -1
// if(self.mouseStart == false && self.w.ulEnter == true) { //  && self.mouseIndex != -1
if(self.w.ulEnter != true
  || (self.mouseStart == false && self.mouseIndex != -1)) {
  console.log('ggg|||||||||||||2', self.w.ulEnter, self.mouseStart, self.mouseIndex)
  clearTimeout(self.w.ss);
  self.w.ss=setTimeout(() => {
    console.log('ss scroll', self.mouseStart, self.mouseIndex)
    e.target.className = "list";
  }, 700);
}

            // 当列表滚动时，如果鼠标出现在列表中，则不触发更新，这样鼠标事件本身
            // 就会让当前鼠标所指向的项目选中
            if( ! (self.mouseIndex == -1 || self.mouseStart == false)){

              console.log('endddddddddddddddd',self.mouseIndex, self.mouseStart, self.currentIndex)
              self.mouseSelect(self.mouseIndex);
              return;
            }
            // else if(self.mouseStart == true && self.w.isScrolling >= 0) {
              // alert('ss')
              // console.log('eeeeeeeee')
              // self.mouseSelect(self.mouseIndex);
              // console.log('end2', self.mouseIndex, self.mouseStart, self.currentIndex)
              // return
            // }
            console.log('end3', self.mouseIndex, self.mouseStart, self.currentIndex)


            // 保持当前窗口有被选中
            if(self.currentIndex < self.scrollLines)
              self.$emit('change', self.scrollLines);
            else if(self.currentIndex >= self.scrollLines+self.itemShowCount)
              self.$emit('change', self.scrollLines+self.itemShowCount-1);
          }
        } else if(self.w.t2 == self.w.t1 && self.w.on == true) {
          console.log('k')
          self.w.timer = setTimeout(ee, self.w.speed);
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
