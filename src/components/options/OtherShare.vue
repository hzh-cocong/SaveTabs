<template>
  <div
    class="other-share">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :xl="6">
        <el-card
          class="box-card"
          header="欢迎分享">
          <div
            class="share-box"
            @mousedown.prevent>
            <img
              src="@/assets/images/logo/weibo_48x48.png"
              title="分享到微博"
              @click="$open(weiboUrl, getKeyType($event))"/>
          </div>
          <div
            class="share-box"
            @mousedown.prevent>
            <el-tooltip
              placement="top"
              effect="light"
              transition="">
              <img
                src="@/assets/images/logo/wechat_48x48.png"
                style="cursor: default;"
                title="分享到微信" />
              <div
                slot="content"
                class="qrcode-box"
                @mousedown.prevent>
                <img
                  src="@/assets/web-qrcode-200x200.png"
                  title="http://www.cocong.cn/savetabs"
                  style="cursor: pointer"
                  @click="$open('http://www.cocong.cn/savetabs', getKeyType($event))"/>
                <div>使用微信“扫一扫”</div>
                <div>打开网页后点击右上角分享至朋友圈</div>
              </div>
            </el-tooltip>
          </div>
          <div
            class="share-box"
            @mousedown.prevent>
            <img
              src="@/assets/images/logo/twitter_48x48.png"
              title="分享到 twitter"
              @click="$open(twitterUrl, getKeyType($event))"/>
          </div>
          <div
            class="share-box"
            @mousedown.prevent>
            <img
              src="@/assets/images/logo/facebook_48x48.png"
              title="分享到 facebook"
              @click="$open(facebookUrl, getKeyType($event))"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'OtherShare'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.other-share {
  padding:20px;
}

.qrcode-box {
  text-align: center;
  font-size: 12px;
  color: #666666;
  cursor: default;
}

.share-box {
  display: inline-block;
  margin: 10px;
  width: 32px;
  height: 32px;
}
.share-box img {
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>

<style>

</style>