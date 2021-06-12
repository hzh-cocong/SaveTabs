<template>
  <div
    class="history-item"
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
      :style="{
        width: (config.item_height-20)+'px',
        height: (config.item_height-20)+'px',
        marginLeft: item.count == undefined
                  ? 10+'px'
                  : 0 }">
      <el-image
        v-if="isLoad"
        :src="iconMap[index]"
        style="width:100%; height: 100%;"
        fit="cover"
        lazy>
        <div slot="error" class="image-slot">
          <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
        </div>
        <div slot="placeholder" class="image-slot"></div>
      </el-image>
    </span>

    <div class="main">
      <div
        class="title"
        :style="{ fontSize: config.list_font_size+'px' }">
        <i
          v-if="item.count != undefined && item.count > 1"
          style="margin-right: 10px;"
          :class="{ 'el-icon-circle-plus-outline' : item.subFiles.length > 0,
                      'el-icon-remove-outline' : item.subFiles.length <= 0,  }"></i>
        <span v-html="highlightMap[index].title || highlightMap[index].url"></span>
      </div>
      <div
        class="sub-title"
        :style="{
          fontSize: config.list_explain_font_size+'px',
          color: isSelected
                ? config.list_explain_focus_font_color
                : config.list_explain_font_color,
          direction: isSelected ? 'rtl' : 'ltr' }"
          v-html="item.count == undefined || item.count == 1
                ? highlightMap[index].url
                : highlightMap[index].domain+' | '+item.count"></div>
    </div>

    <div class="right">
      <template v-if=" ! isActive">
        <span
          :style="{
            fontSize: config.list_state_size+'px',
            color: isSelected
              ? config.list_focus_state_color
              : config.list_state_color,
          }">{{
            timeShow(
              item.count == undefined
            ? item.lastVisitTime
            : (
                item.subFiles.length > 0
              ? item.subFiles[0].lastVisitTime
              : list[index+1].lastVisitTime
            ))
          }}</span>
      </template>
      <template v-if=" ! isActive">
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
            color: config.list_keymap_color }">{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') + showIndex}}</span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HistoryItem',
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

}
</script>

<style scoped>
.history-item{
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
.history-item.left {
  padding: 10px;
  text-align: center;
}
.history-item.main {
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
.history-item.title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item.sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 5px;
}
.history-item.right {
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

.history-item.right .el-icon-more {
  margin-right: 11px;
  padding: 5px;
  font-size: 20px;
  cursor:pointer;
}
.history-item.right .el-icon-close {
  margin-right: 2px;
  font-size: 20px;
  cursor:pointer;
}
</style>
<style>
.all .history-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>