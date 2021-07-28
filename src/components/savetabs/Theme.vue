<template>
  <el-dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"

    :modal="false"
    :append-to-body="true"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    width="250px"
    class="theme"
    @mousedown.native.prevent
    @open="visible2=true"
    @closed="visible2=false">
    <div
      v-if="visible2"
      slot="title"
      style="font-size: 16px;position: relative;">
      <svg-icon
        :name="localConfig.popup ? 'fly-brands' : 'ship-solid'"
        class="hover"
        style="width: 16px;height: 16px;color: gray;position: relative;top: 2px;margin-right: 10px;"
        @click.native="popupChange"
      ></svg-icon>
      <span>{{ lang('chooseTheme') }}</span>
      <i
        class="el-icon-s-tools hover"
        style="color: #b8b8b9;position: absolute;top: 3px;right: -5px;"
        @click="$open('./options.html?type=workspace#/theme-general', getKeyType($event))"></i>
    </div>
    <SelectX
      v-if="visible2"
      v-model="currentThemeIndex"
      :list="currentThemeList"
      :itemHeight="65"
      :itemShowCount="3"
      style="width:250px">
      <template #default="{ index, item, isSelected }">
        <div
          class="theme-item"
          :class="{ selected: isSelected }">
          <div class="color-box">
            <span
              style="display:inline-block;border-width: 5px;border-style: solid; padding: 6px;"
              :style="{ borderColor: item.config.border_color,
                        backgroundColor: item.config.background_color }"><span
                style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
                :style="{
                  backgroundColor: item.config.list_background_color,
                  color: item.config.list_background_color,
                }">.</span><span
                style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
                :style="{
                  backgroundColor: item.config.list_font_color,
                  color: item.config.list_font_color,
                }">.</span><span
                style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
                :style="{
                  backgroundColor: item.config.list_focus_background_color,
                  color: item.config.list_focus_background_color,
                }">.</span><span
                style="display:inline-block;padding:0;margin:0;width: 8px;height:34px;"
                :style="{
                  backgroundColor: item.config.list_focus_font_color,
                  color: item.config.list_focus_font_color,
                }">.</span>
            </span>
          </div>
          <span
            class="title"
            :style="{ color: item.id == currentTheme.id ? item.config.list_focus_background_color : 'black' }">{{ item.name }}</span>
          <i
            v-show="isSelected"
            class="el-icon-check"
            style="font-weight: 700;margin: 0 5px;"
            :style="{ color:  item.id == currentTheme.id ? item.config.list_focus_background_color : 'black' }"></i>
        </div>
      </template>
    </SelectX>
  </el-dialog>
</template>

<script>
import SelectX from '../common/SelectX.vue'
import user_theme from '../../config/user_theme.json'

const THEME_TYPWE = {
  POPUP: 1,
  INJECT: 2,
}

export default {
  name: 'theme',
  inject: ['popupChange'],
  model: {
      prop: 'currentTheme',
      event: 'change'
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    autoOpen: {
      type: Boolean,
      required: false,
      default: false,
    },
    localConfig: {
      type: Object,
      required: true,
    },
    currentTheme: {
      type: Object,
      required: true,
    },
    openWay: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      theme: user_theme,
      visible2: false,
    }
  },
  computed: {
    currentThemeIndex: {
      set(index) {
        this.$emit('change', this.currentThemeList[index]);
      },
      get() {
        let index = -1;
        for(let theme of this.currentThemeList) {
          index++;
          if(this.currentTheme.id == theme.id) {
            return index;
          }
        }
        return -1;
      }
    },
    currentThemeList() {
      // let themeType = this.openWay == 'popup' ? THEME_TYPWE.POPUP : THEME_TYPWE.INJECT;
      // return this.themeList.filter(theme => themeType & theme.type );

      let themeType = this.openWay == 'popup' ? THEME_TYPWE.POPUP : THEME_TYPWE.INJECT;
      let themeList = this.themeList.filter(theme => themeType & theme.type );

      // 对主题排序（没有 rank 的排最后）
      let rank = this.openWay == 'popup' ? this.theme.rank.popup : this.theme.rank.inject;
      themeList.sort((theme1, theme2) => {
        if(rank[theme1.id] == undefined && rank[theme2.id] == undefined) return 0;
        if(rank[theme1.id] == undefined) return 1;
        if(rank[theme2.id] == undefined) return -1;

        return rank[theme2.id]-rank[theme1.id];
      });

      return themeList;
    },
    themeList() {
      // 合并系统主题和用户主题
      let themeList = this.theme.system_theme_list.concat(this.theme.user_theme_list);

      // // 对主题排序（没有 rank 的排最后）
      // themeList.sort((theme1, theme2) => {
      //   if(this.theme.rank[theme1.id] == undefined && this.theme.rank[theme2.id] == undefined) return 0;
      //   if(this.theme.rank[theme1.id] == undefined) return 1;
      //   if(this.theme.rank[theme2.id] == undefined) return -1;

      //   return this.theme.rank[theme2.id]-this.theme.rank[theme1.id];
      // });

      return themeList;
    },
  },
  components: {
    SelectX,
  },
  mounted() {
    chrome.storage.local.get({'theme': {}}, items => {
      Object.assign(this.theme, items.theme);
      if(this.autoOpen) {
        // 不要直接赋值，那是不符合规范的，而且会有很多问题，如开启后自动关闭，或者是手动关闭不了等
        this.$emit('update:visible', true);
      }
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<style>
.theme .el-dialog__header {
  padding: 10px 53px 0 11px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.theme .el-dialog__header .el-dialog__headerbtn {
  top: 12px !important;
}
.theme .el-dialog__body{
  padding: 8px 0 0 0 !important;
}

.theme-item {
  margin: 4px 4px 6px 4px;
  /* padding: 0px 9px 0px 0px; */

  border-radius: 2px;

  background-color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;

  /* 禁止选择 */
  /* 有了 @mousedown.prevent，不再需要这个了
  /* -moz-user-select:none; */ /*火狐*/
  /* -webkit-user-select:none; */ /*webkit浏览器*/
  /* -ms-user-select:none; */ /*IE10*/
  /* -khtml-user-select:none; */ /*早期浏览器*/
  /* user-select:none; */
}
.theme-item.selected {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  /* font-weight: 700; */
}
.theme-item .title {
  flex: 1;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.theme-item:hover:not(.selected) {
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.theme-item .color-box {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}
</style>