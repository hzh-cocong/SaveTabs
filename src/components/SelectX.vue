<template>
  <div class="box">
    <ul
      class="list"
      :style="{ height: (itemHeight*itemShowCount+9)+'px' }">
      <li
        v-for="(item, index) in list"
        class="list-item"
        :key="index">
        <slot
          :index="index"
          :item="item"
          :isSelected="index==currentIndex">{{ item }}</slot>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'SelectX',
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
  },
  data() {
    return {
      ulNode: null,
      scrollTool: null,
    }
  },
  watch: {
    list: function(newVal, oldVal) {
      alert('ss')
      console.log('list', newVal, oldVal)
    }
  },
  methods: {
    createScroll(h1, h2) {
      // 创造滚动条
      let scrollBox = document.createElement('div');
      scrollBox.classList.add('scroll-box');
      scrollBox.style.height = h1 + "px";

      scrollBox.style.top = 0+ "px";
      scrollBox.style.left = (this.$el.offsetWidth-7-2)+'px';

      // 创造滚动元素
      this.scrollTool = document.createElement('div');
      this.scrollTool.classList.add('scroll-tool');
      this.scrollTool.style.height = (h1 / h2 * h1) + "px";

      // 插入滚动条
      scrollBox.appendChild(this.scrollTool);
      this.$el.appendChild(scrollBox);

      // 给滚动条添加事件
      let startY = 0;
      let scrollToolY = 0;
      this.scrollTool.addEventListener('mousedown', (event) => {
        event.preventDefault();

        startY = event.clientY;
        scrollToolY = this.scrollTool.offsetTop;

        let self = this;
        function mousemoveWatch(event){
          console.log('ss')

          let top = event.clientY-startY+scrollToolY;
          if(top <= 0) top = 0;
          if(top >= h1-(h1 / h2 * h1)) top = h1-(h1 / h2 * h1);

          self.scrollTool.style.top = top+'px';

          let tt = top / (h1 / h2 * h1) * h1;

          self.ulNode.scrollTop = Math.ceil(tt/65)*65;
        }
        function mouseupWatch(){
          console.log('gg')
          document.removeEventListener('mousemove', mousemoveWatch);
          document.removeEventListener('mouseup', mouseupWatch);
        }
        document.addEventListener('mousemove', mousemoveWatch)
        document.addEventListener('mouseup', mouseupWatch)
      })
    },
    mouseSelect(event) {
      event.preventDefault();

      const eventDeltaY = -event.wheelDeltaY || event.deltaY * 3;
      if(Math.abs(eventDeltaY) <= 3)
        return;

      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      if(this.lock == true) return;
      this.lock = true;

      this.ulNode.scrollTop += eventDeltaY > 0 ?  65 : -65;

      this.scrollTool.style.top = (this.ulNode.clientHeight / this.ulNode.scrollHeight * this.ulNode.scrollTop)+'px';

      setTimeout(() => { this.lock = false; }, 100);
    },
  },
  mounted() {
    // 内容未超出，无需滚动条
    this.ulNode = this.$el.children[0];
    if(this.ulNode.clientHeight >= this.ulNode.scrollHeight) return;

    // 创建滚动条
    this.createScroll(this.ulNode.clientHeight, this.ulNode.scrollHeight);

    // 添加事件
    this.ulNode.addEventListener('mousewheel', this.mouseSelect);

    // 初始化位置（选中的选项居中）
    this.ulNode.scrollTop += (this.currentIndex-1)*65;
    this.scrollTool.style.top = (this.ulNode.clientHeight / this.ulNode.scrollHeight * this.ulNode.scrollTop)+'px';
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box {
  display: inline-block;
  padding: 0;
  height: 0;
  position: relative;
}
.box .list {
  padding: 0 13px;
  margin: 0;
  overflow: hidden;

  list-style:none;
}
.box .list-item {

}
</style>

<style>
.box .scroll-box {
  position: absolute;
  width: 7px;
  background-color: transparent;
}

.box .scroll-tool {
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, .4);
  border-radius: 5px;
}
</style>