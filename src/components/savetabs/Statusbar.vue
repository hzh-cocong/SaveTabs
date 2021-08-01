<template>
  <div
    class="statusbar"
    :style="{ height: statusbarHeight+'px',
              backgroundColor: currentThemeConfig.statusbar_background_color,
              color: currentThemeConfig.statusbar_icon_color,

              '--statusbar-icon-color': currentThemeConfig.statusbar_icon_color,
              '--statusbar-image-opacity': currentThemeConfig.statusbar_image_opacity }">

    <svg-icon
      :name="localConfig.popup ? 'fly-brands' : 'ship-solid'"
      class="hover2"
      style="margin: 0 10px;"
      @click.native="popupChange"
    ></svg-icon>

    <span class="divider"></span>

    <svg-icon
      name="cog-solid"
      class="hover2"
      style="margin: 0 10px;"
      @click.native="$open('./options.html?type=workspace#/theme-general?status', getKeyType($event))"
    ></svg-icon>

    <svg-icon
      :name="localConfig.theme_mode == 'light' ? 'sun-solid' : 'moon-solid'"
      class="hover2"
      style="margin-right: 10px;"
      @click.native="changeThemeMode"></svg-icon>

    <svg-icon
      name="thumbtack-solid"
      class="hover2"
      style="margin-right: 10px;"
      :style="{ transform: localConfig.pinned
                        && currentWorkspace != undefined
                        && localConfig.active_workspace_type == currentWorkspace.type
                        ? 'rotate(0)' : 'rotate(90deg)', }"
      @click.native="toPin"></svg-icon>

    <span class="divider"></span>

    <span
      v-if="tip == storageTip && goods"
      class="advertising animate__animated animate__flipInX">
      <el-popover
        placement="top"
        title=""
        width="300"
        style="height: 30px;"
        trigger="hover"
        transition
        popper-class="product-box"
        :open-delay="450"
        @hide="focus">
        <div
          style="color: #303133;font-size: 16px;line-height: 1;margin-bottom: 12px;cursor: default;"
          @mousedown.prevent>
          <span>
            <span>{{ lang('commodityPromotion') }}</span>
            <el-tooltip
              placement="bottom"
              effect="light">
              <span
                class="hover"
                @click="$open('./options.html?type=workspace#/other-advertising', getKeyType($event))"> ({{ lang('advertising') }}) </span>
              <div
                slot="content"
                style="width: 170px;">{{ lang('advertisingTip') }}</div>
            </el-tooltip>
          </span>
          <i
            v-if="allGoods.length > 1"
            :title="lang('change')"
            class="el-icon-refresh hover"
            style="float:right; margin-right: 10px;cursor: pointer"
            @click="changeGoods"></i>
        </div>
        <div
          style="display: flex;align-items: center;height: 125px; overflow: hidden;cursor: default"
          @mousedown.prevent>
          <span>
            <img
              :src="'./img/'+goods.pic"
              style="width: 120px; height: 120px;cursor: pointer;"
              :title="lang('advertisingTip2')"
              @click="$open(goods.url, getKeyType($event))" />
          </span>
          <span style="flex: 1;padding: 10px;height: 100%;display: flex;flex-direction: column;width: 160px;">
            <div
              id="goods-name"
              :title="lang('advertisingTip3')"
              @click="$open(goods.url, getKeyType($event))" >{{ storageTip }}</div>
            <div
              id="goods-description"
              v-html="goods.description"
              @mouseenter="$refs.goods_description.className='beautify-scrollbar'"
              @mouseleave="$refs.goods_description.className=''"
              ref="goods_description"></div>
            <div style="color:red;margin-top: 5px;margin-bottom: 5px;">
              <span :title="lang('advertisingTip4')">{{ goods.unit+goods.price }}</span>
              <el-tooltip
                placement="top"
                effect="light"
                transition="">
                <svg-icon
                  name="qrcode-solid"
                  class="hover2"
                  style="width:17px;height: 17px;color: #606266;float:right;cursor: default;"
                  @mouseenter.native="getQrcode"></svg-icon>
                <div
                  slot="content"
                  class="qrcode-box"
                  @mousedown.prevent>
                  <!-- <div
                    id="goods-qrcode"
                    style="width: 200px; height: 200px;margin-bottom: 10px;cursor: pointer"
                    @click="$open(goods.url, getKeyType($event))"></div> -->
                  <!-- <canvas
                    id="goods-qrcode"
                    @click="$open(goods.url, getKeyType($event))"></canvas> -->
                  <img
                    id="goods-qrcode"
                    :src="qrcodeImgUrl"
                    :title="goods.url"
                    @click="$open(goods.url, getKeyType($event))" />
                  <div>{{ lang('supportTip') }}</div>
                  <div>{{ lang('goodsScanTip').replace('[platform]', goods.platform.text) }}</div>
                </div>
              </el-tooltip>
              <span
                :title="lang('platform').replace('[platform]', goods.platform.text)"
                class="hover2"
                style="border-radius: 2px;font-size:12px;padding:1px 4px;float:right;margin-right: 10px;"
                :style="{ backgroundColor: goods.platform.background_color,
                          color: goods.platform.color }"
                @click="openPlatform(goods.platform.text, goods.name)">{{ goods.platform.text }}</span>
            </div>
          </span>
        </div>
        <img
          slot="reference"
          :src="'./img/'+goods.pic"
          class="product-img" />
      </el-popover>
      <span style="display:inline-block;flex: 1;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 1;">{{ storageTip }}</span>
      <svg-icon
        name="ad-solid"
        class="animate__animated hover2"
        style="margin-left: 5px;vertical-align: middle;"
        @click.native="$open('./options.html?type=workspace#/other-advertising', getKeyType($event))"
      ></svg-icon>
    </span>
    <span
      v-else
      class="tip"
      >{{ tip }} </span>

    <span class="divider"></span>

    <svg-icon
      name="arrow-left-solid"
      class="hover2"
      style="margin-left: 10px;"
      @click.native="toLeft(getKeyType($event))"
    ></svg-icon>

    <input
      type="checkbox"
      class="hover2"
      style="margin: 0 8px"
      v-model="localConfig.keymap_left_and_right"
      @change="keymapLeftAndRightChange" />

    <svg-icon
      name="arrow-right-solid"
      class="hover2"
      style="margin-right: 10px;"
      @click.native="toRight(getKeyType($event))"
    ></svg-icon>

    <span class="divider"></span>

    <el-popover
      placement="top-end"
      title=""
      :width="country == 'zh_CN' ? 110 : 210"
      trigger="hover"
      style="min-width: 0;text-align: center;"
      @hide="focus">
      <div
        style="color: #303133;font-size: 16px;line-height: 1;margin-bottom: 12px;cursor: default;"
        @mousedown.prevent>
        <span>{{ lang('thanksSharing') }}</span>
        <i
          :title="lang('giveGoodComment')"
          class="el-icon-chat-dot-square hover"
          style="line-height: 16px;font-size: 12px;float:right; margin-right: 10px;cursor: pointer"
          @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews', getKeyType($event))"></i>
        <i
          :title="lang('rewardAuthor')"
          class="el-icon-coffee-cup hover"
          style="line-height: 16px;font-size: 12px;float:right; margin-right: 10px;cursor: pointer"
          @click="$open('./options.html?type=workspace#/other-support', getKeyType($event))"></i>
      </div>
      <div
        style="display: flex;justify-content: center"
        @mousedown.prevent>
        <div class="share-box">
          <img
            src="@/assets/images/logo/weibo_48x48.png"
            :title="lang('shareToWeibo')"
            @click="$open(weiboUrl, getKeyType($event))"/>
        </div>
        <div class="share-box">
          <el-tooltip
            placement="top"
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
                style="margin-bottom: 5px; width:100%; cursor: pointer;"
                @click="$open('https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale'), getKeyType($event))"/>
              <div>{{ lang('wechatSharingTip1') }}</div>
              <div>{{ lang('wechatSharingTip2') }}</div>
            </div>
          </el-tooltip>
        </div>
        <div class="share-box" v-if="country != 'zh_CN'">
          <img
            src="@/assets/images/logo/twitter_48x48.png"
            :title="lang('shareToTwitter')"
            @click="$open(twitterUrl, getKeyType($event))"/>
        </div>
        <div class="share-box" v-if="country != 'zh_CN'">
          <img
            src="@/assets/images/logo/facebook_48x48.png"
            :title="lang('shareToFacebook')"
            @click="$open(facebookUrl, getKeyType($event))"/>
        </div>
      </div>
      <svg-icon
        slot="reference"
        name="share-alt-solid"
        class="hover2"
        style="margin: 0 10px;margin-top: 3px;"
        @click.native="$open('https://www.cocong.cn/savetabs/#/'+lang('@@ui_locale'), getKeyType($event))"
      ></svg-icon>
    </el-popover>
  </div>
</template>

<script>

import '@/plugins/animate.js'
import QRCode from 'qrcode'
import advertising_config from "@/config/advertising_config.json"

const COUNTRY = {
  CHINA: 1,
  OTHER: 2,
}

export default {
  name: 'statusbar',
  inject: ['focus', 'prev', 'next', 'left', 'right', 'changeThemeMode', 'toPin', 'popupChange', 'keymapLeftAndRightChange'],
  props: {
    config: {
      type: Object,
      required: true,
    },
    localConfig: {
      type: Object,
      required: true,
    },
    currentThemeConfig: {
      type: Object,
      required: true,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    currentWorkspace: {
      type: Object,
      required: true,
    },
    statusbarHeight: {
      type: Number,
      require: true,
    },
  },
  data() {
    return {
      goodsIndex: -1,

      tip: '',

      qrcode: null,
      qrcodeImgUrl: '',

      weChatUrl: '',

      country: this.lang('@@ui_locale'), // 'zh_CN',

      w: {
        tipTimer: null,
      }
    }
  },
  computed: {
    allGoods() {
      let country = this.country == 'zh_CN' ? COUNTRY.CHINA : COUNTRY.OTHER;
      return advertising_config.filter(item => item.country == country);
    },
    goods() {
      return this.allGoods[this.goodsIndex];
    },
    storageTip() {
      return this.goods ? this.goods.name : '';
    },

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
      let format = 'https://www.facebook.com/share.php?u={url}';
      return format.strtr({
        '{url}': encodeURIComponent('https://www.cocong.cn/savetabs/#/'+this.lang('@@ui_locale')),
      });
      // let format = 'https://www.facebook.com/share.php?u={url}&t={title}&pic={pic}';
      // return format.strtr({
      //   '{url}': encodeURIComponent('https://www.cocong.cn/savetabs/#/'+this.lang('@@ui_locale')),
      //   '{title}': encodeURIComponent(this.lang('extension_name')+' '+this.lang('sharingTip')+"\n\n"
      //                               + '1. '+this.lang('extension_feature1')+"\n"
      //                               + '2. '+this.lang('extension_feature2')+"\n"
      //                               + '3. '+this.lang('extension_feature3')+"\n\n"),
      //   '{pic}': encodeURIComponent('http://www.cocong.cn/savetabs/img/feature1.png'),
      // });
    }
  },
  watch: {
    storageTip: {
      handler(newVal) {
        this.tip = newVal;
      },
      immediate: true
    }
  },
  methods: {
    getQrcode() {
      if(this.w.grcodeUrl == this.goods.url) return;
      this.w.grcodeUrl = this.goods.url;

      QRCode.toDataURL(this.goods.url, {
        errorCorrectionLevel: 'L',
        quality: 1,
        margin: 0,
        width: 200,
      },(error, url)=>{

        if(error) {
          this.qrcodeImgUrl = '';
          this.w.grcodeUrl = '';
          return;
        }

        this.qrcodeImgUrl = url;
      })
    },
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
    showTip(tip, lower = false) {
      // 在低优先级下，如果提示栏已经有人在用时，就不插进去了
      // 低优先级可以被低优先级的覆盖
      if(lower && ! this.lower && this.tip != this.storageTip) {
        // this.lower = lower; // 会导致高优先级的被低优先级的覆盖（超过1次后）
        return false;
      }
      this.lower = lower;

      clearTimeout(this.w.tipTimer);

      this.tip = tip;

      return true;
    },
    finishTip(callback, delay=1000) {
      // 过一会再恢复，体验更好
      this.w.tipTimer = setTimeout(() => {
        callback != undefined && callback();

        this.tip = this.storageTip;
        // this.storageTip = '';
      }, delay);
    },

    changeGoods() {
      if(this.allGoods.length == 0) return;
      if(this.allGoods.length == 1 && this.goodsIndex != -1) return;

      let allGoods = this.goodsIndex == -1
                    ? this.allGoods
                    : this.allGoods.slice(0, this.goodsIndex)
                      .concat(this.allGoods.slice(this.goodsIndex+1))
      let max = allGoods.length-1;
      let min = 0;
      let index = Math.floor(Math.random()*(max-min+1)+min);

      this.goodsIndex = this.goodsIndex != -1 && index >= this.goodsIndex ? index+1 : index;

      this.$nextTick(() => {
        document.querySelector('#goods-description').scrollLeft = 0;
      })
    },

    toLeft(keyType) {
      if(keyType == 'meta/ctrl') {
        this.left();
      } else if(keyType == '') {
        this.prev();
      }
    },
    toRight(keyType) {
      if(keyType == 'meta/ctrl') {
        this.right();
      } else if(keyType == '') {
        this.next();
      }
    },

    openPlatform(platform, name) {
      if(platform == 'Amazon') {
        this.amazonSearch(name);
      } else if(platform == '京东') {
        this.JDSearch(name);
      }
    },
    JDSearch(value) {
      let url = 'https://union-click.jd.com/jdc?type=union&p=JF8BAGoKGloXWwIKUlZeOE8nAl8JKx9KBVhdDxxtUQ5SQmQWBR1TGxlZAUEPVhcnV20AE14RDQZXBwtVDU1HVGYAGwwRWAYDBwkPCh5CAjg4RB9IADYBVV5ZCE0XBm4PK2sVXDYyZG5tOEonM184&t=W1dCFBBFC0RUQUpADgpQTFs=&e=&tu='+encodeURIComponent('http://search.jd.com/Search?keyword='+value+'&enc=utf-8');
      window.open(url);
    },
    amazonSearch(value) {
      let url = 'https://www.amazon.com/gp/search?ie=UTF8&tag=cocong-20&linkCode=ur2&linkId=17322288f8b3f551908623e03d8f3638&camp=1789&creative=9325&index=aps&keywords='+encodeURIComponent(value);
      window.open(url);
    },
  },
  mounted() {
    this.changeGoods();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.statusbar {
  display:flex;
  align-items: center;
}

.statusbar >>> .svg-icon {
  cursor:pointer;
  width: 20px;
  height: 20px;
}

.advertising {
  display: inline-block;
  flex: 1;
  margin: 0 10px;
  text-align: center;
  cursor: default;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display:flex;
  align-items:center;
  justify-content: center;
}
.tip {
  display: inline-block;
  flex: 1;
  margin: 0 10px;
  text-align: center;
  cursor: default;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

input[type=checkbox] {
  width: 9px;
  height: 9px;
  margin: 0;
  display: inline-block;
  position: relative;
  appearance: none;
  cursor: pointer;
}

input[type=checkbox]:after {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  content: " ";
  color: transparent;
  display: inline-block;
  padding: 1 3px 3px 1;
  border-radius: 50%;
  background:transparent;
  border:1px solid var(--statusbar-icon-color);
  box-sizing: border-box;
}

input[type=checkbox]:checked:after {
  content: "";
  font-size: 12px;
  font-weight:600;
  background-color: var(--statusbar-icon-color);
}

.product-img {
  width: 20px;
  height: 20px;
  margin-top: 5px;
  margin-right: 5px;
  border-radius: 4px;
  opacity: var(--statusbar-image-opacity);
  transition-property: width, height, opacity, margin-top;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
.product-img:hover {
  opacity: 1;
  width: 30px;
  height: 30px;
  margin-top: 0;
}
.divider {
  display:inline-block;
  border-right: 1px solid var(--statusbar-icon-color);
  height: 20px;
  opacity: 0.6;
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

.qrcode-box {
  width: 200px;
  text-align: center;
  font-size: 12px;
  color: #666666;
  cursor: default;
}
#goods-name {
  font-weight: 300;
  font-size: 14px;
  color: #333333;
  text-align: center;
  margin-bottom: 10px;
  cursor: pointer;
}
#goods-name:hover {
  color: #E1251B;
}
#goods-description {
  flex: 1;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
}
#goods-qrcode {
  width: 200px;
  height: 200px;
  margin-bottom: 5px;
  cursor: pointer;
}
</style>