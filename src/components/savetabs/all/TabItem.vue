<template>
  <div
    class="tab-item"
    :style="{
      backgroundColor: index == 0 && item.isCurrent
                      ? ( isSelected
                          ? config.list_current_focus_background_color
                          : config.list_current_background_color)
                      : ( isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color),
      color: index == 0 && item.isCurrent
          ? ( isSelected
              ? config.list_current_focus_font_color
              : config.list_current_font_color)
          : ( isSelected
              ? config.list_focus_font_color
              : config.list_font_color),

      '--list-highlight-color': index == 0 && item.isCurrent
                              ? ( isSelected
                                  ? config.list_current_focus_highlight_color
                                  : config.list_current_highlight_color)
                              : ( isSelected
                                  ? config.list_focus_highlight_color
                                  : config.list_highlight_color),
      '--list-highlight-weight': index == 0 && item.isCurrent
                              ? ( isSelected
                                  ? config.list_current_focus_highlight_weight
                                  : config.list_current_highlight_weight)
                              : ( isSelected
                                  ? config.list_focus_highlight_weight
                                  : config.list_highlight_weight),
    }">
    <span
      class="left"
      style="position: relative"
      :style="{
        width: (config.item_height-20)+'px',
        height: (config.item_height-20)+'px' }">
      <el-image
        v-if="isLoad"
        :src="getIcon('', item.url, config.item_height-20)"
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
        :name="project_config.allWorkspaces[ 'tab' ].svg"
        :style="{ backgroundColor: index == 0 && item.isCurrent
                        ? ( isSelected
                          ? config.list_current_focus_background_color
                          : config.list_current_background_color)
                        : ( isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color),
                  borderColor: index == 0 && item.isCurrent
                        ? ( isSelected
                          ? config.list_current_focus_background_color
                          : config.list_current_background_color)
                        : ( isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color),
                  color: index == 0 && item.isCurrent
                        ? ( isSelected
                          ? config.list_current_focus_icon_color
                          : config.list_current_icon_color)
                        : ( isSelected
                          ? config.list_focus_icon_color
                          : config.list_icon_color),
                  width: config.item_height/4+'px',
                  height: config.item_height/4+'px', }"></svg-icon>
    </span>

    <div class="main">
      <!-- <div
        class="title"
        :style="{ fontSize: config.list_font_size+'px' }"
        v-html="highlight(item.title, storageKeyword, '<strong>', '</strong>')
              || highlight(item.url, storageKeyword, '<strong>', '</strong>')"></div> -->
      <div
        class="title"
        :style="{ fontSize: config.list_font_size+'px' }"
        v-html="isSelected || storageKeyword != ''
              ? (highlight(item.title, storageKeyword, '<strong>', '</strong>')
                || highlight(item.url, storageKeyword, '<strong>', '</strong>'))
              : (beautifyTitle(item.title) || getDomain(item.url))"></div>
      <div
        class="sub-title"
        :style="{
          fontSize: config.list_explain_font_size+'px',
          color: index == 0 && item.isCurrent
              ? ( isSelected
                ? config.list_current_explain_focus_font_color
                : config.list_current_explain_font_color)
              : ( isSelected
                ? config.list_explain_focus_font_color
                : config.list_explain_font_color),
          direction: storageKeyword == ''
                    ? 'ltr'
                    : (isSelected ? 'rtl' : 'ltr') }"
        v-html="storageKeyword != ''
              ? highlight(item.url, storageKeyword, '<strong>', '</strong>')
              : (isSelected ? item.url : getDomain(item.url))"></div>
    </div>

    <div class="right">
      <div v-if="isActive">
      </div>
      <template v-else-if="index == 0 && item.isCurrent">
        <span
          :style="{
              fontSize: config.list_state_size+'px',
              color: isSelected
                    ? config.list_current_focus_state_color
                    : config.list_current_state_color,
              borderColor: isSelected
                    ? config.list_current_focus_state_color
                    : config.list_current_state_color }">Current</span>
      </template>
      <template v-else>
        <span
          :style="{
            fontSize: config.list_state_size+'px',
            color: isSelected
              ? config.list_focus_state_color
              : config.list_state_color }">{{
              item.isCurrent
            ? 'Current'
            : ( item.windowRank == undefined
              ? 'Opened'
              : 'Win'+item.windowRank )
          }}</span>
      </template>
      <template v-if=" ! isActive && ! (index == 0 && item.isCurrent)">
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
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabItem',
  props: {
    config: {
      type: Object,
      required: require,
    },
    project_config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    index: {
      type: Number,
      required: require,
    },
    item: {
      type: Object,
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
    }
  },
}
</script>

<style scoped>
.tab-item {
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
.tab-item .left {
  padding: 10px;
  text-align: center;
}
.tab-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 2px;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-radius: 2px 0 0 0;
  margin-right: 2px
}
.tab-item .main {
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
.tab-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tab-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.tab-item .right {
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
.tab-item .right .el-icon-more {
  margin-right: 11px;
  padding: 5px;
  font-size: 20px;
  cursor:pointer;
}
.tab-item .right .el-icon-close {
  margin-right: 2px;
  font-size: 20px;
  cursor:pointer;
}
</style>
<style>
.all .tab-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>