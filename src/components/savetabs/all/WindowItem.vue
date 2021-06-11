<template>
  <div
    class="item"
    :style="{
      backgroundColor: item.isCurrent
                      ? ( isSelected
                          ? config.list_current_focus_background_color
                          : config.list_current_background_color)
                      : ( isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color),
      color: item.isCurrent
                      ? ( isSelected
                          ? config.list_current_focus_font_color
                          : config.list_current_font_color)
                      : ( isSelected
                          ? config.list_focus_font_color
                          : config.list_font_color),

      '--list-highlight-color': item.isCurrent
                              ? ( isSelected
                                  ? config.list_current_focus_highlight_color
                                  : config.list_current_highlight_color)
                              : ( isSelected
                                  ? config.list_focus_highlight_color
                                  : config.list_highlight_color),
      '--list-highlight-weight': item.isCurrent
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
        :src="getIcon(item.tabs[0].icon, item.tabs[0].url, config.item_height-20)"
        style="width:100%; height: 100%;"
        fit="cover"
        lazy>
        <div slot="error">
          <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
        </div>
        <div slot="placeholder"></div>
      </el-image>
      <svg-icon
        name="windows-brands"
        style=" position: absolute;
                right: 0;
                bottom: 0;
                padding: 2px;
                border-width: 2px 0px 0px 2px;
                border-style: solid;
                border-radius: 2px 0 0 0;
                margin-right: 2px;"
        :style="{ backgroundColor: item.isCurrent
                        ? ( isSelected
                          ? config.list_current_focus_background_color
                          : config.list_current_background_color)
                        : ( isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color),
                  borderColor: item.isCurrent
                        ? ( isSelected
                          ? config.list_current_focus_background_color
                          : config.list_current_background_color)
                        : ( isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color),
                  color: item.isCurrent
                        ? ( isSelected
                          ? config.list_current_focus_icon_color
                          : config.list_current_icon_color)
                        : ( isSelected
                          ? config.list_focus_icon_color
                          : config.list_icon_color),
                  width: config.item_height/4+'px',
                  height: config.item_height/4+'px', }"></svg-icon>
    </span>

    <span
      class="title"
      :style="{fontSize: config.list_font_size+'px'}"
      v-html="highlight(item.name, storageKeyword, '<strong>', '</strong>')"></span>

    <div class="right">
      <template v-if="isActive || item.isOpened || item.lastVisitTime != undefined">
        <div
          v-if="item.isCurrent"
          :style="{
            fontSize: config.list_state_size+'px',
            color: isSelected
                  ? config.list_current_focus_state_color
                  : config.list_current_state_color,
            borderColor: isSelected
                  ? config.list_current_focus_state_color
                  : config.list_current_state_color }">
          <span>{{ lang('currentWindow') }}</span>
        </div>
        <div
          v-else-if="item.isOpened"
          :style="{
            fontSize: config.list_state_size+'px',
            color: isSelected
                ? config.list_focus_state_color
                : config.list_state_color }">
          {{ lang('opened') }}
        </div>
        <div
          v-else-if="item.lastVisitTime != undefined"
          :style="{
            fontSize: config.list_state_size+'px',
            color: isSelected
                ? config.list_focus_state_color
                : config.list_state_color }">
          {{ timeShow(item.lastVisitTime) }}
        </div>
      </template>
      <template v-if=" ! isActive && ! item.isCurrent">
        <span
          v-if="isSelected"
          :style="{
            fontSize: config.list_keymap_size+'px',
            color: config.list_focus_keymap_color }">↩</span>
        <span
          v-else-if="showIndex > 0"
          :style="{
            fontSize: config.list_keymap_size+'px',
            color: config.list_keymap_color }">{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') + showIndex}}</span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WindowItem',
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
  data() {
    return {
    }
  }
}
</script>

<style scoped>
.item {
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
.item .left {
  padding: 10px;
  text-align: center;
}
.item .title {
  /* border: 1px solid blue; */
  text-align: left;
  cursor: default;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item .right {
  /* border: 1px solid black; */
  margin-left: 10px;
  margin-right: 10px;
  font-size: 12px;
  text-align: right;

  height: 100%;
  display:flex;
  flex-direction: column;
  justify-content: space-evenly;
}
</style>
<style>
.all .item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>