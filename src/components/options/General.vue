<template>
  <div class="general">

    <div class="jumbotron">
      <div class="title">
        <img
          src="@/assets/icon-128.png" />
        <h1>SaveTabs - Window & Tab Manager</h1>
      </div>
      <div class="sub-title">
        简单、高效、个性化
      </div>
      <div class="explain">
        简单的给你，复杂的交给我
      </div>
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

  text-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
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

</style>