<template>
  <div class="general">

    <div class="jumbotron">
      <div class="title">
        <img src="@/assets/icon-128.png" />
        <h1>SaveTabs - Window & Tab Manager</h1>
      </div>
      <div class="sub-title">
        简单、高效、个性化
      </div>
      <div class="explain">
        简单的给你，复杂的交给我
      </div>
    </div>

    <div class="divider"></div>

    <div style="display: flex;align-items: center;background: linear-gradient(to right, #5DC7B1, #50A2F4);">
      <div style="width: 40%;">
        <img src="@/assets/iShot2021-07-19 23.04.20.png" width="80%"/>
      </div>
      <div style="flex: 1;font-size:18px;color: #ffffffc9;">支持一键保存和打开所有网页，提高工作和学习效率</div>
    </div>

    <div class="divider"></div>

    <div style="display: flex;align-items: center;background: linear-gradient(to right, #CC66CC, #FFCCFF);">
      <div style="flex: 1;font-size:18px;color: #ffffffc9;">支持书签、历史和标签页等的聚合搜索，避免多处查找</div>
      <div style="width: 40%;">
        <img src="@/assets/iShot2021-07-19 23.04.20.png" width="80%"/>
      </div>
    </div>

    <div class="divider"></div>

    <div style="display: flex;align-items: center;background: linear-gradient(to right, #5DC7B1, #538BD6);">
      <div style="width: 40%;">
        <img src="@/assets/iShot2021-07-19 23.04.20.png" width="80%"/>
      </div>
      <div style="flex: 1;font-size:18px;color: #ffffffc9;">可以根据自己的喜好调整插件的行为和样式，喜欢 DIY 的朋友可以尽情发挥</div>
    </div>

  </div>
</template>

<script>

export default {
  name: 'General'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.general {
  text-align: center;
  background-color: #FFCCFF;
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
  margin-bottom: 15px;
  font-size: 21px;
  font-weight: 200;
}
.jumbotron .explain {
  font-size: 12px;
  color: #6699CC;
  font-style:oblique
}

.divider {
  padding:5px;
}
</style>