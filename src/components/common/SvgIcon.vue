<template>
  <svg class="svg-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <use :xlink:href="id"/>
  </svg>
</template>

<script>

// 一次性加载全部
// https://webpack.js.org/guides/dependency-management/#context-module-api
// const requireAll = requireContext => requireContext.keys().map(requireContext)
// const req = require.context('@/assets/icons', false, /\.svg$/)
// requireAll(req)

export default {
  name: 'svg-icon',
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    id() {
      // 异步加载
      let icon = require(`@/assets/icons/${this.name}.svg`);
      icon = icon.default;
console.log('jjjjjjjjjjjjjjjjjjjjjj', icon)
      return `#${icon.id}`;

      // return `#icon-${this.name}`;
    }
  }
}
</script>

<style scoped>
  .svg-icon {
    fill: currentColor;
    height: 24px;
    width: 24px;
  }
</style>