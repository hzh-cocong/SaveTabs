<template>
  <div
    class="search-item"
    :style="{
      backgroundColor: isSelected
                      ? config.list_focus_background_color
                      : config.list_background_color,
      color: isSelected
            ? config.list_focus_font_color
            : config.list_font_color,

      '--list-highlight-color': isSelected
                              ? config.list_focus_highlight_color
                              : config.list_highlight_color,
      '--list-highlight-weight': isSelected
                                ? config.list_focus_highlight_weight
                                : config.list_highlight_weight,
    }">
    <span
      class="left"
      style="position: relative"
      :style="{
        width: (config.item_height-20)+'px',
        height: (config.item_height-20)+'px' }">
      <el-image
        v-if="isLoad"
        :src="getIcon('', item.formate, config.item_height-20)"
        style="width:100%; height: 100%;"
        fit="cover"
        lazy>
        <div slot="error" class="image-slot">
          <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
        </div>
        <div slot="placeholder" class="image-slot"></div>
      </el-image>
      <svg-icon
        class="workspace-logo"
        name="search-solid"
        :style="{ backgroundColor: isSelected
                                  ? config.list_focus_background_color
                                  : config.list_background_color,
                  borderColor: isSelected
                              ? config.list_focus_background_color
                              : config.list_background_color,
                  color: isSelected
                        ? config.list_focus_icon_color
                        : config.list_icon_color,
                  width: config.item_height/4+'px',
                  height: config.item_height/4+'px', }"></svg-icon>
    </span>

    <div class="main">
      <!-- 由于列表长度未发生变化，无法及时更新 -->
      <!-- <div
        class="title"
        :style="{ fontSize: config.list_font_size+'px' }"
        v-html="storageKeyword != undefined && isSelected ? item.title : item.name"></div> -->
      <div
        class="title"
        :style="{ fontSize: config.list_font_size+'px' }"
        v-text="item.name"></div>
      <div
        v-if="isSelected && (storageKeyword != '' || keyType != '')"
        class="sub-title"
        :style="{
          fontSize: config.list_explain_font_size+'px',
          color: isSelected
                ? config.list_explain_focus_font_color
                : config.list_explain_font_color }"
          v-html="isSelected && keyType != ''
                  ? getTip()
                  : ('Search '+item.name+' for \'<strong>'+storageKeyword.escape()+'</strong>\'')"></div>
    </div>

    <div class="right">
      <span
        v-if="isSelected"
        :style="{
          fontSize: config.list_keymap_size+'px',
          color: config.list_focus_keymap_color,
        }">↩</span>
      <span
        v-else-if="showIndex > 0"
        :style="{
          fontSize: config.list_keymap_size+'px',
          color: config.list_keymap_color }">
        <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
        <!-- <font style="font-family: Consolas, Monaco, monospace;">{{ -->
        <font
          style="display:inline-block;text-align:left;"
          :style="{ width: (config.list_keymap_size/2)+'px' }">{{ showIndex }}</font>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchItem',
  props: {
    config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    item: {
      type: Object,
      required: require,
    },
    index: {
      type: Number,
      required: require,
    },
    showIndex: {
      type: Number,
      required: require,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    storageKeyword: {
      type: String,
      required: false,
      default: '',
    },
    keyType: {
      type: String,
      required: false,
      default: '',
    },
  },
  methods: {
    getTip() {
      console.log('showTip');

      if(this.keyType == 'meta/ctrl') {
        return '打开新标签但不切换';
      } else if(this.keyType == 'shift') {
        return '新窗口打开';
      } else if(this.keyType == 'alt') {
        return '覆盖当前标签';
      } else if(this.keyType != '') {
        return '打开新标签并切换';
      } else {
        return '';
      }
    },
  }
}
</script>

<style scoped>
.search-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;

  /* 禁止选择 */
  -moz-user-select:none; /*火狐*/
  -webkit-user-select:none; /*webkit浏览器*/
  -ms-user-select:none; /*IE10*/
  -khtml-user-select:none; /*早期浏览器*/
  user-select:none;
}
.search-item .left {
  padding: 10px;
  text-align: center;
}
.search-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 2px;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-radius: 2px 0 0 0;
  margin-right: 2px
}
.search-item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  /* justify-content: center; */
}
.search-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.search-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.search-item .right {
  /* border: 1px solid black; */
  /* border: 1px solid black; */
  /* margin-left: 10px;
  margin-right: 10px; */
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
  text-align: right;

  height: 100%;
  display:flex;
  flex-direction: column;
  justify-content: space-evenly;
}
</style>
<style>
.all .search-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>