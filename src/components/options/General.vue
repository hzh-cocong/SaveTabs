<template>
  <div class="general">

    <div class="jumbotron">
      <div class="title">
        <img src="@/assets/icon-128.png" />
        <h1 style="font-weight: 500;">{{ lang('extension_name') }}</h1>
      </div>
      <div class="sub-title">
        {{ lang('extension_title') }}
      </div>
      <div class="explain" v-if="country == 'zh_CN'">
        {{ lang('extension_subtitle') }}
      </div>
    </div>

    <div class="divider"></div>

    <div style="display: flex;align-items: center;background: linear-gradient(to right, #5DC7B1, #50A2F4);">
      <div style="width: 40%;">
        <img src="@/assets/feature1.png" width="80%"/>
      </div>
      <div style="flex: 1;font-size:18px;color: #ffffffc9;">{{ lang('extension_feature1') }}</div>
    </div>

    <div class="divider"></div>

    <div style="display: flex;align-items: center;background: linear-gradient(to right, #CC66CC, #FFCCFF);">
      <div style="flex: 1;font-size:18px;color: #ffffffc9;">{{ lang('extension_feature2') }}</div>
      <div style="width: 40%;">
        <img src="@/assets/feature2.png" width="80%"/>
      </div>
    </div>

    <div class="divider"></div>

    <div style="display: flex;align-items: center;background: linear-gradient(to right, #5DC7B1, #538BD6);">
      <div style="width: 40%;">
        <img src="@/assets/feature3.png" width="80%"/>
      </div>
      <div style="flex: 1;font-size:18px;color: #ffffffc9;">{{ lang('extension_feature3') }}</div>
    </div>

    <!-- <div class="divider"></div> -->

  </div>
</template>

<script>

export default {
  name: 'General',
  data() {
    return {
      country: this.lang('@@ui_locale'), // 'zh_CN',
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.general {
  text-align: center;
  background-color: #FFCCFF;
  cursor: default;
}
.jumbotron {
  text-align: center;
  background-color: #FFCCFF;
  padding: 30px 15px;
}
.jumbotron .title {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgb(64, 141, 220);
}
.jumbotron .title img {
  width: 64px;
  height: 64px;
}
.jumbotron .title h1 {
  display: inline-block;
  margin-left: 10px;

  /* text-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04); */
}
.jumbotron .sub-title {
  color: #0099CC;
  /* margin-bottom: 15px; */
  font-size: 21px;
  font-weight: 200;
}
.jumbotron .explain {
  margin-top: 15px;
  font-size: 12px;
  color: #6699CC;
  font-style:oblique
}

.divider {
  padding:2px;
}
</style>