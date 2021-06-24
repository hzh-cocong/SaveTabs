<template>
  <div
    class="bookmark-item"
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
        height: (config.item_height-20)+'px',
        marginLeft: item.marginLeft+'px' }">
      <template v-if="isLoad">
        <img
          v-if="item.children && item.children.length > 0"
          src="@/assets/folder.png"
          style="width:100%; height: 100%;" />
        <img
          v-else-if="item.children && item.children.length <= 0"
          src="@/assets/folder-opened.png"
          style="width:100%; height: 100%;" />
        <el-image
          v-else
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
          :name="project_config.allWorkspaces[ 'bookmark' ].svg"
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
      </template>
    </span>

    <div class="main">
      <template v-if="storageKeyword == ''">
        <div
          class="title"
          :style="{ fontSize: config.list_font_size+'px' }">{{
              index+' | '+item.realIndex+' | '+item.title
          }}</div>
      </template>
      <template v-else>
        <span
          class="title"
          :style="{ fontSize: config.list_font_size+'px' }"
          v-html="index+' | '+item.realIndex+' | '+highlight(item.title, storageKeyword, '<strong>', '</strong>')"></span>
      </template>

      <div
        class="sub-title"
        :style="{
          fontSize: config.list_explain_font_size+'px',
          color: isSelected
                ? config.list_explain_focus_font_color
                : config.list_explain_font_color }">
        {{ item.subTitle }}
      </div>
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
  name: 'BookmarkItem',
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
.bookmark-item {
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
.bookmark-item .left {
  padding: 10px;
  text-align: center;
}
.bookmark-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 2px;
  border-width: 2px 0px 0px 2px;
  border-style: solid;
  border-radius: 2px 0 0 0;
  margin-right: 2px
}
.bookmark-item .main {
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
.bookmark-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bookmark-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bookmark-item .right {
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
.all .bookmark-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>