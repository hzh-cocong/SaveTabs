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

    <div class="item">
      <div class="left">
        <img src="@/assets/feature1.png" />
      </div>
      <div class="right">{{ lang('extension_feature1') }}</div>
    </div>

    <div class="divider"></div>

    <div class="item2">
      <div class="left">{{ lang('extension_feature2') }}</div>
      <div class="right">
        <img src="@/assets/feature2.png" />
      </div>
    </div>

    <div class="divider"></div>

    <div class="item">
      <div class="left">
        <img src="@/assets/feature3.png" />
      </div>
      <div class="right">{{ lang('extension_feature3') }}</div>
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

.item,
.item2 {
  display: flex;
  align-items: center;
  /* box-sizing: border-box; */
}
.item {
  background: linear-gradient(to right, #5DC7B1, #50A2F4);
}
.item2 {
  background: linear-gradient(to right, #CC66CC, #FFCCFF);
}
.item .left,
.item2 .right {
  width: 40vw;
  height: 29.5vw;
}
.item .right,
.item2 .left {
  flex: 1;
  font-size:18px;
  padding: 10px;
  color: #ffffffc9;
}
.item img,
.item2 img {
  width: 80%;
}
</style>