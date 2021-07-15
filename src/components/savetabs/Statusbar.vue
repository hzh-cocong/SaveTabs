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
      @click.native="$open('./options.html?type=workspace', $event)"
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
      v-if="tip == storageTip"
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
          <span>商品推荐<span class="hover" style="cursor:pointer">（广告）</span></span>
          <i
            title="换一换"
            class="el-icon-refresh hover"
            style="float:right; margin-right: 10px;cursor: pointer"></i>
        </div>
        <div
          style="display: flex;align-items: center;height: 125px; overflow: hidden;cursor: pointer"
          @mousedown.prevent>
          <span><img src="@/assets/images/shops/product-1.png" style="width: 120px; height: 120px" /></span>
          <span style="flex: 1;padding: 10px;">
            <div>{{ storageTip }}</div>
            <div style="color:red;margin-top: 5px;">￥199</div>
          </span>
        </div>
        <img
          slot="reference"
          src="@/assets/images/shops/product-1.png"
          class="product-img" />
      </el-popover>
      <span style="display:inline-block;flex: 1;overflow:hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 1;">{{ storageTip }}</span>
      <svg-icon
        name="ad-solid"
        class="animate__animated hover2"
        style="margin-left: 5px;vertical-align: middle;"
        @click.native="$refs.carousel.prev()"
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
      title="感谢分享"
      width="210"
      trigger="hover"
      style="text-align: center;"
      @hide="focus">
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
          effect="light">
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
      <svg-icon
        slot="reference"
        name="share-alt-solid"
        class="hover2"
        style="margin: 0 10px;margin-top: 3px;"
        @click.native="$open('http://www.cocong.cn/savetabs', getKeyType($event))"
      ></svg-icon>
    </el-popover>
  </div>
</template>

<script>

import "@/config/advertising_config.json"

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
      tip: '泰国乳胶枕礼盒',
      storageTip: '泰国乳胶枕礼盒',

      w: {
        tipTimer: null,
      }
    }
  },
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
  },
  methods: {
    showTip(tip, lower = false) {
      // 在低优先级下，如果提示栏已经有人在用时，就不插进去了
      // 低优先级可以被低优先级的覆盖
      console.log('showTip', lower, ! this.lower, this.tip != this.storageTip, tip)
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
    }
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
  text-align: center;
  font-size: 12px;
  color: #666666;
  cursor: default;
  zoom: 0.5;
}
</style>