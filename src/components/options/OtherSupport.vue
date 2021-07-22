<template>
  <div
    class="other-support">
    <el-card  class="box-card" style="max-width: 700px">
      <el-row>
        <el-col :span="24" style="text-align:center;margin-top: 20px;color:gray;">
          {{ lang('thankYou') }}
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
          <div>{{ lang('advice1')}} <a href="https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno" target="_blank">{{ lang('chromeWebStore') }}</a> {{ lang('advice2') }}</div>
          <div>你还可以通过 <a href="/options.html#/other-advertising" target="_self">点击这里</a> 购买商品，作者将获得一定的佣金，谢谢你的支持。</div>
        </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'OtherSupport',
  computed: {

    weiboUrl() {
      let format = 'http://service.weibo.com/share/share.php?url={url}&title={title}&pic={pic}&ralateUid={ralateUid}&searchPic=false';
      return format.strtr({
        '{url}': encodeURIComponent('http://www.cocong.cn/savetabs'),
        '{title}': encodeURIComponent("SaveTabs - 窗口标签管理器 浏览器插件分享\n\n1. 支持一键保存和打开所有网页，提高工作和学习效率\n2. 支持书签、历史和标签页等的聚合搜索，避免多处查找\n3. 可以根据自己的喜好调整插件的行为和样式，喜欢 DIY 的朋友可以尽情发挥\n\n"),
        '{pic}': encodeURIComponent('http://www.cocong.cn/assets/images/cocong-34.png||http://www.cocong.cn/assets/images/cocong-34.png?a||http://www.cocong.cn/assets/images/cocong-34.png?b'),
        '{ralateUid}': 5564314611,
      });
    },
    twitterUrl() {
      let format = 'https://twitter.com/intent/tweet?text={title}&url={url}&via={origin}';
      return format.strtr({
        '{url}': encodeURIComponent('http://www.cocong.cn/savetabs'),
        '{title}': encodeURIComponent("SaveTabs - 窗口标签管理器 浏览器插件分享\n\n1. 支持一键保存和打开所有网页，提高工作和学习效率\n2. 支持书签、历史和标签页等的聚合搜索，避免多处查找\n3. 可以根据自己的喜好调整插件的行为和样式，喜欢 DIY 的朋友可以尽情发挥\n\n"),
        '{origin}': encodeURIComponent("hzh_cocong"),
      });
    },
    facebookUrl() {
      let format = 'https://www.facebook.com/share.php?u={url}&t={title}&pic={pic}';
      return format.strtr({
        '{url}': encodeURIComponent('http://www.cocong.cn'),
        '{title}': encodeURIComponent("SaveTabs - 窗口标签管理器 浏览器插件分享\n\n1. 支持一键保存和打开所有网页，提高工作和学习效率\n2. 支持书签、历史和标签页等的聚合搜索，避免多处查找\n3. 可以根据自己的喜好调整软件的行为和样式，喜欢 DIY 的朋友可以尽情发挥\n\n"),
        '{pic}': encodeURIComponent('http://www.cocong.cn/assets/images/cocong-34.png'),
      });
    }
  }
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