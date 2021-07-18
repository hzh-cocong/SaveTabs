<template>
  <div
    class="other-advertising">
    <el-alert
      type="info"
      style="margin-bottom: 20px">
      <div slot="title">
        <p>这些是我自己从各大平台上精心挑选的商品，全部都是热销产品，质量有保证，价格和大家自己网上搜索的一样，不会说在这里买就会变贵，都是一样的，不一样的是我可以额外获得佣金，算是导购的报酬。</p>
        <p>本插件后面将会增加一些更高级的功能，不过这需要额外购买服务器，希望大家多多支持。</p>
        <p>因商家促销或其它原因，价格可能会有变化，请以实际购买价格为准。</p>
      </div>
    </el-alert>
    <el-card
      class="box-card"
      header="商品推荐">

    </el-card>
    <el-card
      class="box-card"
      header="更多商品">

    </el-card>
  </div>
</template>

<script>
export default {
  name: 'OtherAdvertising'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.other-advertising {
  padding:20px;
}

.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>