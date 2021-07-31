<template>
  <div
    class="other-about">
    <div class="main" style="color: #303133;flex: 1;">
      <div style="text-align: left;">{{ lang('name') }}: {{ lang('extension_name') }}</div>
      <div style="text-align: left;">{{ lang('version') }}: 4.0.0</div>
    </div>
    <div class="copyright">
      <span>Copyright © 胡镇华 <a :href="'https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale')" target="_blank">cocong.cn</a></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OtherAbout'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.other-about {
  padding:20px 20px 0 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  position: relative;
}
.other-about .main:before {
  position: absolute;
  left: calc(50% - 50px);
  top: calc(50% - 70px);
  width: 100px;
  height: 100px;
  text-align: center;
  content: '';
  background: url('/icons/icon-128.png');
  background-size: cover;
  z-index: -1;
}

.copyright {
  padding: 20px;
  margin: 0 -20px;
  font-size: 14px;
  text-align: center;
  color: #777777;
  background-color: #f5f5f5;
}
.copyright a {
  color: inherit;
  text-decoration: none;
}
.copyright a:hover {
  text-decoration: underline;
}
</style>

<style>

</style>