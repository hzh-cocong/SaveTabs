<template>
  <div
    class="history-item"
    :style="{
      backgroundColor: isSelected
                      ? currentThemeConfig.list_focus_background_color
                      : currentThemeConfig.list_background_color,
      color: isSelected
            ? currentThemeConfig.list_focus_font_color
            : currentThemeConfig.list_font_color,

      '--list-highlight-color': isSelected
                              ? currentThemeConfig.list_focus_highlight_color
                              : currentThemeConfig.list_highlight_color,
      '--list-highlight-weight': isSelected
                                ? currentThemeConfig.list_focus_highlight_weight
                                : currentThemeConfig.list_highlight_weight,
    }">
    <span
      class="left"
      style="position: relative"
      :style="{
        width: currentThemeConfig.item_height+'px',
        padding: (currentThemeConfig.item_height*1/5)+'px',
        marginLeft: item.count == undefined
                  ? (currentThemeConfig.item_height*1/5)+'px'
                  : 0 }">
      <el-image
        v-if="isLoad"
        :src="getIcon('', item.url, currentThemeConfig.item_height*3/5)"
        style="width:100%; height: 100%;"
        fit="cover"
        :scroll-container="$parent.$el"
        :lazy="index >= currentThemeConfig.item_show_count">
        <div slot="error" class="image-slot">
          <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
        </div>
        <div slot="placeholder" class="image-slot"></div>
      </el-image>
      <svg-icon
        class="workspace-logo"
        :name="projectConfig.allWorkspaces[ 'history' ].svg"
        :style="{ color: isSelected
                        ? currentThemeConfig.list_focus_icon_color
                        : currentThemeConfig.list_icon_color,
                  width: currentThemeConfig.item_height/4+'px',
                  height: currentThemeConfig.item_height/4+'px', }"></svg-icon>
    </span>

    <div class="main">
      <div
        class="title"
        :style="{ fontSize: currentThemeConfig.list_font_size+'px' }">
        <i
          v-if="item.count != undefined && item.count > 1"
          style="margin-right: 10px;"
          :class="{ 'el-icon-circle-plus-outline' : item.subFiles.length > 0,
                    'el-icon-remove-outline' : item.subFiles.length <= 0, }"></i>
        <!-- <span v-html="(highlight(item.title, storageKeyword, '<strong>', '</strong>')
                    || highlight(item.url, storageKeyword, '<strong>', '</strong>'))"></span> -->
        <span v-html="isSelected || storageKeyword != ''
                    ? (highlight(item.title, storageKeyword, '<strong>', '</strong>')
                      || highlight(item.url, storageKeyword, '<strong>', '</strong>'))
                    : (beautifyTitle(item.title) || beautifyTitle(item.url))"></span>
      </div>
      <div
        class="sub-title"
        :style="{
          fontSize: currentThemeConfig.list_explain_font_size+'px',
          color: isSelected
                ? currentThemeConfig.list_explain_focus_font_color
                : currentThemeConfig.list_explain_font_color,
          direction: isSelected ? 'rtl' : 'ltr' }"
          v-html="isSelected && keyType != ''
                ? getTip()
                : ( item.count == undefined || item.count == 1
                  ? (isSelected || storageKeyword != ''
                    ? highlight(item.url, storageKeyword, '<strong>', '</strong>')
                    : getDomain(item.count == undefined ? item.url : item.subFiles[0].url))
                  : (highlight(getDomain(item.url), storageKeyword, '<strong>', '</strong>')+' | '+item.count) )"></div>
    </div>

    <div
      class="right"
      @click.stop>
      <template v-if="isActive">
        <svg-icon
          class="hover"
          :name="projectConfig.allWorkspaces[ 'history' ].svg"
          @click.native.stop="switchTo(getKeyType($event))"></svg-icon>
        </template>
      <template v-if=" ! isActive">
        <span
          :style="{
            fontSize: currentThemeConfig.list_state_size+'px',
            color: isSelected
              ? currentThemeConfig.list_focus_state_color
              : currentThemeConfig.list_state_color,
          }">{{ timeShow(item.lastVisitTime) }}</span>
      </template>
      <template v-if=" ! isActive">
        <span
          v-if="isSelected"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.list_focus_keymap_color,
          }">↩</span>
        <span
          v-else
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: showIndex <= 0
                ? 'transparent'
                : currentThemeConfig.list_keymap_color }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }">{{ showIndex }}</font>
        </span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryItem',
  inject: ['input'],
  props: {
    currentThemeConfig: {
      type: Object,
      required: true,
    },
    projectConfig: {
      type: Object,
      required: true,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    showIndex: {
      type: Number,
      required: true,
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
    switchTo(keyType) {
      if(keyType == 'meta/ctrl') {
        this.input(null, 'history');
      } else if(keyType == '') {
        this.input(this.item.title || this.item.url, 'history');
      }
    },

    getTip() {
      console.log('showTip');

      if(this.item.count == undefined || this.item.count == 1) {
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
      }

      if(this.item.subFiles.length > 0) {
        return '展开';
      } else {
        return '收起';
      }
    },
  }
}
</script>

<style scoped>
.history-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
}
.history-item  .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.history-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 4px 2px 2px 4px;
  border-radius: 2px 0 0 0;
  margin-right: 2px;
  background-color: transparent;
}
.history-item .main {
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
.history-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.history-item .right {
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
.history-item .right >>> .svg-icon {
  width: 20px;
  height: 20px;
  margin-right: 2px;
  padding: 5px;
  cursor:pointer;
}
</style>
<style>
.all .history-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>