<template>
  <div
    class="bookmark-item"
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
        marginLeft: (item.marginLeft*(currentThemeConfig.item_height*2/5))+'px' }">
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
          :src="getIcon('', item.url, currentThemeConfig.item_height*3/5)"
          style="width:100%; height: 100%;"
          fit="cover"
          :scroll-container="$parent.$el"
          :lazy="index >= currentThemeConfig.item_show_count">
          <div slot="error">
            <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder"></div>
        </el-image>
        <svg-icon
          class="workspace-logo"
          :name="projectConfig.allWorkspaces[ 'bookmark' ].svg"
          :style="{ color: isSelected
                          ? currentThemeConfig.list_focus_icon_color
                          : currentThemeConfig.list_icon_color,
                    width: currentThemeConfig.item_height/4+'px',
                    height: currentThemeConfig.item_height/4+'px', }"></svg-icon>
      </template>
    </span>

    <div class="main">
      <template v-if="storageKeyword == ''">
        <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }">{{ item.title }}</div>
      </template>
      <template v-else>
        <span
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="toHighlight(item.title, storageKeyword.replace(/([^0-9A-Za-z\s])/g, ' $1 '), '<strong>', '</strong>')"></span>
      </template>

      <div
        v-if="(isSelected || storageKeyword != '')"
        class="sub-title"
        :style="{
          fontSize: currentThemeConfig.list_explain_font_size+'px',
          color: isSelected
                ? currentThemeConfig.list_explain_focus_font_color
                : currentThemeConfig.list_explain_font_color }"
        v-html="isSelected && keyType != ''
                ? getTip()
                : ( isSelected && storageKeyword != '' && ! item.children
                  ? toHighlight(item.url, storageKeyword.replace(/([^0-9A-Za-z\s])/g, ' $1 '), '<strong>', '</strong>')
                  : item.subTitle
                )">
      </div>
    </div>

    <div
      class="right"
      @click.stop>
      <template v-if="isActive">
        <svg-icon
          class="hover"
          :name="projectConfig.allWorkspaces[ 'bookmark' ].svg"
          @click.native.stop="switchTo(getKeyType($event))"></svg-icon>
      </template>
      <span
        v-else-if="isSelected"
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
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookmarkItem',
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
    index: {
      type: Number,
      required: true,
    },
    item: {
      type: Object,
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
        this.input(null, 'bookmark');
      } else if(keyType == '') {
        this.input(this.item.title, 'bookmark');
      }
    },

    getTip() {
      // 打开网页
      if( ! this.item.children) {
        if(this.keyType == 'meta/ctrl') {
          return this.lang('openTabWithoutSwitch');
        } else if(this.keyType == 'shift') {
          return this.lang('openNewWindow');
        } else if(this.keyType == 'alt') {
          return this.lang('overwriteCurrentTab');
        } else if(this.keyType != '') {
          return this.lang('openTabAndSwitch');
        } else {
          return '';
        }
      }

      return this.item.children.length ? this.lang('unfold') : this.lang('fold');
    }
  }
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
}
.bookmark-item  .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.bookmark-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 4px 2px 2px 4px;
  border-radius: 2px 0 0 0;
  margin-right: 2px;
  background-color: transparent;
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
.bookmark-item .right >>> .svg-icon {
  width: 20px;
  height: 20px;
  margin-right: 2px;
  padding: 5px;
  cursor:pointer;
}
</style>
<style>
.all .bookmark-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>