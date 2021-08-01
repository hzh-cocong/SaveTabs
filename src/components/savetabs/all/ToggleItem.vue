<template>
  <div
    class="toggle-item"
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
        padding: (currentThemeConfig.item_height*1/5)+'px' }">
      <svg-icon
          :name="projectConfig.allWorkspaces[ item.workspace ].svg"
          style="width:100%; height: 100%;"
          :style="{ color: isSelected
                          ? currentThemeConfig.list_focus_icon_color
                          : currentThemeConfig.list_icon_color, }"></svg-icon>
    </span>

    <div class="main">
      <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="toHighlight(item.name, storageKeyword.substr(config.workspace_change_word.length).trim().split(/\s+/)[0], '<strong>', '</strong>')"></div>
      <div
        v-if="isSelected && item.tip != ''"
        class="sub-title"
        :style="{
          fontSize: currentThemeConfig.list_explain_font_size+'px',
          color: isSelected
                ? currentThemeConfig.list_explain_focus_font_color
                : currentThemeConfig.list_explain_font_color }"
          v-html="item.tip"></div>
    </div>

    <div class="right">
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
        <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt') }}</font>
        <font
          style="display:inline-block;text-align:left;"
          :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }">{{ showIndex }}</font>
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
      required: true,
    },
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
    openWay: {
      type: String,
      required: false,
      default: '',
    },
  }
}
</script>

<style scoped>
.toggle-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
}
.toggle-item  .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.toggle-item .main {
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
.toggle-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toggle-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.toggle-item .right {
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
.all .toggle-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>