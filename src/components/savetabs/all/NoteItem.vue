<template>
  <div
    class="note-item"
    :style="{
      backgroundColor: index == 0 && item.isCurrent
                      ? ( isSelected
                          ? currentThemeConfig.list_current_focus_background_color
                          : currentThemeConfig.list_current_background_color)
                      : ( isSelected
                          ? currentThemeConfig.list_focus_background_color
                          : currentThemeConfig.list_background_color),
      color: index == 0 && item.isCurrent
          ? ( isSelected
              ? currentThemeConfig.list_current_focus_font_color
              : currentThemeConfig.list_current_font_color)
          : ( isSelected
              ? currentThemeConfig.list_focus_font_color
              : currentThemeConfig.list_font_color),

      '--list-highlight-color': index == 0 && item.isCurrent
                              ? ( isSelected
                                  ? currentThemeConfig.list_current_focus_highlight_color
                                  : currentThemeConfig.list_current_highlight_color)
                              : ( isSelected
                                  ? currentThemeConfig.list_focus_highlight_color
                                  : currentThemeConfig.list_highlight_color),
      '--list-highlight-weight': index == 0 && item.isCurrent
                              ? ( isSelected
                                  ? currentThemeConfig.list_current_focus_highlight_weight
                                  : currentThemeConfig.list_current_highlight_weight)
                              : ( isSelected
                                  ? currentThemeConfig.list_focus_highlight_weight
                                  : currentThemeConfig.list_highlight_weight),
    }">
    <span
      class="left"
      style="position: relative"
      :style="{
        width: currentThemeConfig.item_height+'px',
        padding: (currentThemeConfig.item_height*1/5)+'px' }">
      <el-image
        v-if="isLoad"
        :src="getIcon(item.icon, item.url, currentThemeConfig.item_height*3/5)"
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
        :name="projectConfig.allWorkspaces[ 'note' ].svg"
        :style="{ color: index == 0 && item.isCurrent
                        ? ( isSelected
                          ? currentThemeConfig.list_current_focus_icon_color
                          : currentThemeConfig.list_current_icon_color)
                        : ( isSelected
                          ? currentThemeConfig.list_focus_icon_color
                          : currentThemeConfig.list_icon_color),
                  width: currentThemeConfig.item_height/4+'px',
                  height: currentThemeConfig.item_height/4+'px', }"></svg-icon>
    </span>

    <div class="main">
      <!-- <div
        class="title"
        :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
        v-html="toHighlight(item.title, storageKeyword, '<strong>', '</strong>')
              || toHighlight(item.url, storageKeyword, '<strong>', '</strong>')"></div> -->
      <div
        class="title"
        :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
        v-html="isSelected || storageKeyword != ''
              ? (toHighlight(item.title, storageKeyword, '<strong>', '</strong>')
                || toHighlight(item.url, storageKeyword, '<strong>', '</strong>'))
              : (beautifyTitle(item.title) || getDomain(item.url))"></div>
      <div
        class="sub-title"
        :style="{
          fontSize: currentThemeConfig.list_explain_font_size+'px',
          color: index == 0 && item.isCurrent
              ? ( isSelected
                ? currentThemeConfig.list_current_explain_focus_font_color
                : currentThemeConfig.list_current_explain_font_color)
              : ( isSelected
                ? currentThemeConfig.list_explain_focus_font_color
                : currentThemeConfig.list_explain_font_color),
          direction: storageKeyword == ''
                    ? 'ltr'
                    : (isSelected ? 'rtl' : 'ltr') }"
        v-html="isSelected && keyType != ''
              ? getTip()
              : ( storageKeyword != ''
                ? this.toHighlight(item.url, storageKeyword, '<strong>', '</strong>')
                : (isSelected ? item.url : getDomain(item.url)) )"></div>
    </div>

    <div
      class="right"
      @click.stop>
      <template v-if="isActive
              || item.isOpened
              || item.lastVisitTime != undefined">
        <template v-if="isActive">
          <svg-icon
            class="hover"
            :name="projectConfig.allWorkspaces[ 'note' ].svg"
            @click.native.stop="switchTo(getKeyType($event))"></svg-icon>
        </template>
        <div
          v-else-if="index == 0 && item.isCurrent"
          :style="{
            fontSize: currentThemeConfig.list_state_size+'px',
            color: isSelected
                  ? currentThemeConfig.list_current_focus_state_color
                  : currentThemeConfig.list_current_state_color,
            borderColor: isSelected
                  ? currentThemeConfig.list_current_focus_state_color
                  : currentThemeConfig.list_current_state_color }">
            {{ lang('current') +( item.count > 1 ? ' ('+item.count+')' : '') }}
        </div>
        <div
          v-else-if="item.isOpened"
          :style="{
            fontSize: currentThemeConfig.list_state_size+'px',
            color: isSelected
                ? currentThemeConfig.list_focus_state_color
                : currentThemeConfig.list_state_color }">
          {{  (item.isCurrent ? lang('current') : lang('opened'))
            + (isSelected && item.count > 1 ? ' ('+item.count+')' : '') }}
        </div>
        <div
          v-else-if="item.lastVisitTime != undefined"
          :style="{
            fontSize: currentThemeConfig.list_state_size+'px',
            color: isSelected
                ? currentThemeConfig.list_focus_state_color
                : currentThemeConfig.list_state_color }">
          {{ timeShow(item.lastVisitTime) }}
        </div>
      </template>
      <template v-if=" ! isActive && ! (index == 0 && item.isCurrent)">
        <span
          v-if="isSelected"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.list_focus_keymap_color }">↩</span>
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
  name: 'NoteItem',
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
        this.input(null, 'note');
      } else if(keyType == '') {
        this.input(this.item.title || this.item.url, 'note');
      }
    },

    getTip() {
      if(this.item.isOpened) {
        return this.lang('switchTab');
      }

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
    },
  }
}
</script>

<style scoped>
.note-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
}
.note-item  .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.note-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 4px 2px 2px 4px;
  border-radius: 2px 0 0 0;
  margin-right: 2px;
  background-color: transparent;
}
.note-item .main {
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
.note-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.note-item .right {
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
.note-item .right >>> .svg-icon {
  width: 20px;
  height: 20px;
  margin-right: 2px;
  padding: 5px;
  cursor:pointer;
}
</style>
<style>
.all .note-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>