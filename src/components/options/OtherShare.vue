<template>
  <div
    class="other-share">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :xl="6">
        <el-card
          class="box-card"
          :header="lang('thanksSharing2')"
          :body-style="{ textAlign: 'center' }">
          <div
            class="share-box">
            <img
              src="@/assets/images/logo/weibo_48x48.png"
              :title="lang('shareToWeibo')"
              @click="$open(weiboUrl, getKeyType($event))"/>
          </div>
          <div
            class="share-box">
            <el-tooltip
              placement="bottom"
              effect="light"
              transition="">
              <img
                src="@/assets/images/logo/wechat_48x48.png"
                style="cursor: default;"
                :title="lang('shareToWeChat')"
                @mouseenter="getWeChatUrl" />
              <div
                slot="content"
                class="qrcode-box"
                @mousedown.prevent>
                <img
                  :src="weChatUrl"
                  :title="'https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale')"
                  style="width:100%; cursor: pointer;"
                  @click="$open('https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale'), getKeyType($event))"/>
                <div>{{ lang('wechatSharingTip1') }}</div>
                <div>{{ lang('wechatSharingTip2') }}</div>
              </div>
            </el-tooltip>
          </div>
          <div
            v-if="country != 'zh_CN'"
            class="share-box">
            <img
              src="@/assets/images/logo/twitter_48x48.png"
              :title="lang('shareToTwitter')"
              @click="$open(twitterUrl, getKeyType($event))"/>
          </div>
          <div
            v-if="country != 'zh_CN'"
            class="share-box">
            <img
              src="@/assets/images/logo/facebook_48x48.png"
              :title="lang('shareToFacebook')"
              @click="$open(facebookUrl, getKeyType($event))"/>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'OtherShare',
  data() {
    return {
      country: this.lang('@@ui_locale'), // 'zh_CN',

      weChatUrl: '',
    }
  },
  computed: {
    weiboUrl() {
      let format = 'http://service.weibo.com/share/share.php?url={url}&title={title}&pic={pic}&ralateUid={ralateUid}&searchPic=false';
      return format.strtr({
        '{url}': encodeURIComponent('https://www.cocong.cn/savetabs/#/'+this.lang('@@ui_locale')),
        '{title}': encodeURIComponent(this.lang('extension_name')+' '+this.lang('sharingTip')+"\n\n"
                                    + '1. '+this.lang('extension_feature1')+"\n"
                                    + '2. '+this.lang('extension_feature2')+"\n"
                                    + '3. '+this.lang('extension_feature3')+"\n\n"),
        '{pic}': encodeURIComponent('http://www.cocong.cn/savetabs/img/feature1.png||http://www.cocong.cn/savetabs/img/feature2.png||http://www.cocong.cn/savetabs/img/feature3.png'),
        '{ralateUid}': 5564314611,
      });
    },
    twitterUrl() {
      let format = 'https://twitter.com/intent/tweet?text={title}&url={url}&via={origin}';
      return format.strtr({
        '{url}': encodeURIComponent('https://www.cocong.cn/savetabs/#/'+this.lang('@@ui_locale')),
        '{title}': encodeURIComponent(this.lang('extension_name')+' '+this.lang('sharingTip')+"\n\n"
                                    + '1. '+this.lang('extension_feature1')+"\n"
                                    + '2. '+this.lang('extension_feature2')+"\n"
                                    + '3. '+this.lang('extension_feature3')+"\n\n"),
        '{origin}': encodeURIComponent("hzh_cocong"),
      });
    },
    facebookUrl() {
      let format = 'https://www.facebook.com/share.php?u={url}&t={title}&pic={pic}';
      return format.strtr({
        '{url}': encodeURIComponent('https://www.cocong.cn/savetabs/#/'+this.lang('@@ui_locale')),
        '{title}': encodeURIComponent(this.lang('extension_name')+' '+this.lang('sharingTip')+"\n\n"
                                    + '1. '+this.lang('extension_feature1')+"\n"
                                    + '2. '+this.lang('extension_feature2')+"\n"
                                    + '3. '+this.lang('extension_feature3')+"\n\n"),
        '{pic}': encodeURIComponent('http://www.cocong.cn/savetabs/img/feature1.png'),
      });
    }
  },
  methods: {
    getWeChatUrl() {
      if(this.weChatUrl != '') return;

      QRCode.toDataURL('https://www.cocong.cn/savetabs/#/'+this.lang('@@ui_locale'), {
        errorCorrectionLevel: 'L',
        quality: 1,
        margin: 0,
        width: 200,
      },(error, url)=>{
        if(error) return;

        return this.weChatUrl = url;
      })
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.other-share {
  padding:20px;
}

.qrcode-box {
  width: 200px;
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