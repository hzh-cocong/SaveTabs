<template>
  <div
    class="other-support">
    <el-card  class="box-card" style="max-width: 700px">
      <el-row>
        <el-col :span="24" style="text-align:center;margin-top: 20px;color:gray;">
          {{ lang('support1') }}
        </el-col>
      </el-row>
      <el-row class="praise" :gutter="20" style="margin-top: 50px">
        <el-col :span="8">
          <el-card style="border: 0" :body-style="{ padding: '10px 10px 0 10px' }">
            <img src="@/assets/WeChatPay.gif" style="width:100%;" />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card style="border: 0" :body-style="{ padding: '10px 10px 0 10px' }">
            <a href="https://www.paypal.com/paypalme/hzhcocong" target="_blank">
              <img src="@/assets/PayPal.png" style="width:100%;cursor: pointer;" />
            </a>
            <!-- <img src="@/assets/PayPal.png" style="width:100%;cursor: pointer;" @click="$open('https://www.paypal.com/paypalme/hzhcocong')" /> -->
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card style="border: 0" :body-style="{ padding: '10px 10px 0 10px' }">
            <img src="@/assets/Alipay.gif" style="width:100%;" />
          </el-card>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
        <div class="describe">
          <div>{{ lang('support2')}} <a href="https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno" target="_blank">{{ lang('chromeWebStore') }}</a> {{ lang('support3') }}</div>
          <div>{{ lang('support4')}} <a href="/options.html#/other-advertising" target="_self">{{ lang('clickHere')}}</a> {{ lang('support5')}}</div>
        </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'OtherSupport',
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.other-support {
  padding:20px;
}

.box-card {
  margin-bottom: 20px;
}

.describe {
  margin-top: 80px;
  font-size: 14px;
  color: #636363;
}
</style>

<style>

</style>