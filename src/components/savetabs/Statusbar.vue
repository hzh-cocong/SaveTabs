<template>
  <div
    class="statusbar"
    :style="{ height: statusbarHeight+'px',
              backgroundColor: config.statusbar_background_color,
              color: config.statusbar_icon_color,

              '--statusbar-icon-color': config.statusbar_icon_color,
              '--statusbar-image-opacity': config.statusbar_image_opacity }">

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
        transition=""
        popper-class="product-box"
        :open-delay="450"
        @hide="focus">
        <div style="color: #303133;font-size: 16px;line-height: 1;margin-bottom: 12px;cursor: default;">
          <span>点击购买<span class="hover" style="cursor:pointer">（广告）</span></span>
          <i
            title="换一换"
            class="el-icon-refresh hover"
            style="float:right; margin-right: 10px;cursor: pointer"></i>
        </div>
        <div style="display: flex;align-items: center;height: 125px; overflow: hidden;cursor: pointer">
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
      @click.native="prev"
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
      @click.native="next"
    ></svg-icon>

    <span class="divider"></span>

    <el-popover
      placement="top-end"
      title="谢谢分享！"
      width="200"
      trigger="hover"
      @hide="focus">
      <img
        src="@/assets/images/logo/weibo_32x32.png"
        width="32"
        height="32"
        style="cursor: pointer"
        @click="$open('https://service.weibo.com/share/share.php?url=http%3A%2F%2Fwww.cocong.cn%2F&title=SaveTabs %E5%88%86%E4%BA%AB&pic=http%3A%2F%2Fwww.cocong.cn%2Fassets%2Fimages%2Fcocong-34.png&appkey=', $event)"/>
      <svg-icon
        slot="reference"
        name="share-alt-solid"
        class="hover2"
        style="margin: 0 10px;margin-top: 3px;"
        @click.native="$open('./options.html?type=workspace', $event)"
      ></svg-icon>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'statusbar',
  inject: ['focus', 'prev', 'next', 'changeThemeMode', 'toPin', 'popupChange', 'keymapLeftAndRightChange'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    localConfig: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    currentWorkspace: {
      type: Object,
      required: require,
    },
    statusbarHeight: {
      type: Number,
      require: true,
    },
  },
  data() {
    return {
      tip: '京东京造高端纯享 泰国乳胶枕礼盒93%乳胶含量 泰国原芯进口天然乳胶枕波浪乳胶枕头 橡胶枕颈椎枕',
      storageTip: '京东京造高端纯享 泰国乳胶枕礼盒93%乳胶含量 泰国原芯进口天然乳胶枕波浪乳胶枕头 橡胶枕颈椎枕',

      w: {
        tipTimer: null,
      }
    }
  },
  methods: {
    showTip(tip) {
      clearTimeout(this.w.tipTimer);

      // if(this.storageTip == '') {
      //   this.storageTip = this.tip;
      // }

      this.tip = tip;
    },
    finishTip(callback) {
      // 过一会再恢复，体验更好
      this.w.tipTimer = setTimeout(() => {
        this.tip = this.storageTip;
        // this.storageTip = '';
        callback();
      }, 1000);
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
</style>