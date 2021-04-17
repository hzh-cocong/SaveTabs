<template>
    <div class="list-item">
      <template v-if="type == 1">
ss
      </template>

      <!-- <span class="left"><slot name="icon"></slot></span>
      <span class="middle">
        <span class="top">
          <span class="main"><slot></slot></span>
          <span class="explain"><slot name="explain"></slot></span>
        </span>
        <span class="bottom"><slot name="bottom"></slot></span>
      </span>
      <span class="right">
        <span class="status"><slot name="status"></slot></span>
        <span class="keymap"><slot name="keymap"></slot></span>
      </span> -->
    </div>
</template>

<script>
export default {
  name: 'ListItem',

  props: {
    list: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  data() {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-item {
  border: 11px solid red;
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
  flex-wrap: wrap;
}


/* .middle {
  text-align: left;
  margin: 0 10px 0 10px;
  flex: 1;
}
.main {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.top {
  width: 100%;
}
.icon {
  margin: 10px 0 10px 10px;
}
.status {
  font-size: 12px;
  color: green;
} */
</style>
