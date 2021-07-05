<template>
  <el-container>
    <el-aside
      width="250px"
      style="border-right:solid 1px #e6e6e6;">
      <el-button
        style="border-radius: 0;height: 56px;width: 100%;border: 0;"
        @click="addTheme(currentThemeFocus)">创建主题</el-button>
      <div
        style="padding: 10px 0 0 0;text-align:center;border-top:solid 1px #e6e6e6">
        <svg-icon
          name="fly-brands"
          class="environment hover"
          :class="{ active: this.openWay == 'popup' }"
          @click.native="popupChange();currentThemeFocus();"
        ></svg-icon>
        <svg-icon
          name="ship-solid"
          class="environment hover"
          :class="{ active: this.openWay == 'inject' }"
          @click.native="popupChange();currentThemeFocus();"
        ></svg-icon>
      </div>
      <ul
        class="theme"
        ref="theme">
        <li
          class="theme-item"
          :class="{ selected: item.id == currentTheme.id }"
          v-for="(item, index) in currentThemeList"
          :key="item.id+'|'+index"
          @click="$emit('update:currentTheme', item)">
          <div class="color-box">
            <span
              style="display:inline-block;border-width: 5px;border-style: solid; padding: 6px;cursor:move;"
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
            v-show="item.id == currentTheme.id"
            class="el-icon-check"
            style="font-weight: 700;margin: 0 5px;"
            :style="{ color: item.config.list_focus_background_color }"></i>
        </li>
      </ul>
    </el-aside>
    <el-container
      style="height: 100vh;">
      <el-header
        style="padding: 0 20px;height: 56px;display:flex;flex-direction: row;align-items: center;text-align:center;">
        <svg-icon
          name="fly-brands"
          class="type hover"
          :class="{ active: currentTheme.type & 1, disabled: currentTheme.is_system }"
          @click.native="changeThemeType(1);currentThemeFocus();"
        ></svg-icon>
        <svg-icon
          name="ship-solid"
          class="type hover"
          :class="{ active: currentTheme.type & 2, disabled: currentTheme.is_system }"
          @click.native="changeThemeType(2);currentThemeFocus();"
        ></svg-icon>
        <div
          v-if="currentTheme.is_system"
          style="border-left: 1px solid lightgray;height: 24px;margin: 0 10px;">
          <img
            style="width: 24px; height: 24px;margin-left: 20px;"
            src="@/assets/icon-128.png" />
        </div>
        <span
          v-if=" ! showNameInput"
          style="flex: 1;margin: 0 10px;color: #606266;width:100%;height:100%;display:flex;flex-direction: column;justify-content: center;"
          @click="currentTheme.is_system
                || (showNameInput=true,
                    $nextTick(()=>$refs.themeNameInput.focus()))">{{ currentTheme.name }}</span>
        <el-input
          v-if="showNameInput"
          :value="currentTheme.name"
          style="flex: 1;margin: 0 10px;"
          clearable
          :disabled="currentTheme.is_system"
          @blur="showNameInput=false"
          @input="changeThemeName($event, false)"
          @change="changeThemeName($event, true)"
          ref="themeNameInput"></el-input>
        <el-button
          type="text"
          @click="cloneTheme();currentThemeFocus();">克隆</el-button>
        <el-button
          type="text">导出</el-button>
        <el-button
          type="text"
          :disabled="currentTheme.is_system"
          @click="deleteTheme(currentThemeFocus);">删除</el-button>
      </el-header>
      <el-main style="padding:0;">
        <el-tabs
          type="card"
          class="tabs"
          v-model="activeName"
          @tab-click="tabClick">
          <el-tab-pane label="整体" name="global">
            <el-divider>布局</el-divider>
            <div class="box">
              <span class="label">外边框</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.border_width"
                :min="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('border_width', $event)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.border_width != oldCurrentThemeConfig.border_width"
                placement="top"
                :content="oldCurrentThemeConfig.border_width+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('border_width', oldCurrentThemeConfig.border_width)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">边框颜色</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.border_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('border_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.border_color != oldCurrentThemeConfig.border_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.border_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('border_color', oldCurrentThemeConfig.border_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">蒙版颜色</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.container_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('container_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.container_background_color != oldCurrentThemeConfig.container_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.container_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('container_background_color', oldCurrentThemeConfig.container_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">内边距</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.padding_width"
                :min="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('padding_width', $event)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.padding_width != oldCurrentThemeConfig.padding_width"
                placement="top"
                :content="oldCurrentThemeConfig.padding_width+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('padding_width', oldCurrentThemeConfig.padding_width)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">页面背景</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.background_color != oldCurrentThemeConfig.background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('background_color', oldCurrentThemeConfig.background_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">指示器</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.carousel_indicators_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('carousel_indicators_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.carousel_indicators_color != oldCurrentThemeConfig.carousel_indicators_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.carousel_indicators_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('carousel_indicators_color', oldCurrentThemeConfig.carousel_indicators_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>位置</el-divider>
            <div class="box">
              <span class="label">水平对齐</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_horizontal_align"
                :disabled="currentTheme.is_system"
                @change="editTheme('position_horizontal_align', $event)">
                <el-option
                  v-for="align in positionHorizontalOptions"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.position_horizontal_align != oldCurrentThemeConfig.position_horizontal_align"
                placement="top"
                :content="positionHorizontalOptions.find(align => align.value == oldCurrentThemeConfig.position_horizontal_align).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('position_horizontal_align', oldCurrentThemeConfig.position_horizontal_align)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">水平偏移</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_horizontal_distance"
                :min="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('position_horizontal_distance', $event)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.position_horizontal_distance != oldCurrentThemeConfig.position_horizontal_distance"
                placement="top"
                :content="oldCurrentThemeConfig.position_horizontal_distance+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('position_horizontal_distance', oldCurrentThemeConfig.position_horizontal_distance)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">垂直对齐</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_vertical_align"
                :disabled="currentTheme.is_system"
                @change="editTheme('position_vertical_align', $event)">
                <el-option
                  v-for="align in positionVerticalOptions"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.position_vertical_align != oldCurrentThemeConfig.position_vertical_align"
                placement="top"
                :content="positionVerticalOptions.find(align => align.value == oldCurrentThemeConfig.position_vertical_align).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('position_vertical_align', oldCurrentThemeConfig.position_vertical_align)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">垂直偏移</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_vertical_distance"
                :min="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('position_vertical_distance', $event)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.position_vertical_distance != oldCurrentThemeConfig.position_vertical_distance"
                placement="top"
                :content="oldCurrentThemeConfig.position_vertical_distance+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('position_vertical_distance', oldCurrentThemeConfig.position_vertical_distance)"></i>
              </el-tooltip>
            </div>
            <el-divider>临时（工作区）</el-divider>
            <div class="box">
              <span class="label">标签数量</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.tag_line_count"
                :min="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('tag_line_count', $event)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.tag_line_count != oldCurrentThemeConfig.tag_line_count"
                placement="top"
                :content="oldCurrentThemeConfig.tag_line_count+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('tag_line_count', oldCurrentThemeConfig.tag_line_count)"></i>
              </el-tooltip>
            </div>
          </el-tab-pane>
          <el-tab-pane label="列表" name="list">
            列表
          </el-tab-pane>
          <el-tab-pane label="菜单栏" name="menu">
            菜单栏
          </el-tab-pane>
          <el-tab-pane label="状态栏" name="status">
            状态栏
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import { nanoid } from 'nanoid'
import Sortable from 'sortablejs';

export default {
  name: 'ThemeGeneral',
  inject: [
    'popupChange',
    'changeThemeType',
    'changeThemeName',
    'editTheme',
    'themeSort',
    'addTheme',
    'cloneTheme',
    'deleteTheme',
  ],
  props: {
    currentTheme: {
      type: Object,
      required: require,
    },
    currentThemeList: {
      type: Array,
      required: require,
    },
    openWay: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      activeName: 'global',

      showNameInput: false,

      positionHorizontalOptions: [
        { value: 'center', label: '居中'},
        { value: 'left', label: '向左对齐'},
        { value: 'right', label: '向右对齐'},
      ],
      positionVerticalOptions: [
        { value: 'center', label: '居中'},
        { value: 'top', label: '置顶'},
        { value: 'bottom', label: '置底'},
      ],

      w: {
        oldCurrentThemeConfig: {},
      },
    }
  },
  computed: {
    currentThemeIndex() {
      let index = -1;
      for(let theme of this.currentThemeList) {
        index++;
        if(this.currentTheme.id == theme.id) {
          return index;
        }
      }
      return -1;
    },
    currentThemeConfig() {
      return this.currentTheme.config;
    },
    oldCurrentThemeConfig() {
      if(this.w.oldCurrentThemeConfig[this.currentTheme.id] != undefined) {
        return this.w.oldCurrentThemeConfig[this.currentTheme.id]
      }

      this.w.oldCurrentThemeConfig[this.currentTheme.id] = Object.assign({}, this.currentThemeConfig);
      return this.w.oldCurrentThemeConfig[this.currentTheme.id];
    },
    predefine() {
      // 去重，否则会报错
      return Array.from(new Set([
        this.currentThemeConfig.border_color,
        this.currentThemeConfig.background_color
      ]))
    }
  },
  methods: {
    currentThemeFocus() {
      this.$nextTick(()=> this.$refs.theme.scrollTop = this.currentThemeIndex * (56+10));
    },

    tabClick() {
      console.log('tabClick', this.activeName);
      // this.$router.push('/theme-general?'+this.activeName);
      let query = {};
      query[this.activeName]=null;
      this.$router.replace({ name: 'theme-general', query}).catch(()=>{});
    }
  },
  mounted() {
    // todo
    window.tg = this;
    console.log('mounted:ThemeGeneral.vue', this.activeName)

    let res = window.location.href.match(/\?([^?]+)$/);
    if(res != null) {
      this.activeName = res[1];
    }

    // this.$refs.theme.scrollTop = this.currentThemeIndex * (56+10);
    // console.log('fff', this.currentThemeIndex)
    this.currentThemeFocus();

    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.theme'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      // draggable: '.enabled',
      // handle: ".handle",
      // chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: this.themeSort,
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.environment {
  margin: 0 10px;
  color: lightgray;
  cursor: pointer;
}
.environment.active {
  color: #409EFF;
}

.theme {
  height: calc(100vh - 96px);
  padding: 0;
  margin: 0;
  overflow: auto;

  list-style:none;
}
.theme-item {
  margin: 10px;
  border-radius: 2px;
  background-color: #fff;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
}
.theme-item.selected {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  /* font-weight: 700; */
}
.theme-item .color-box {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
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

.type {
  margin: 0 10px;
  color: lightgray;
  cursor: pointer;
}
.type.active {
  color: #009966;
}
.type.disabled {
  cursor: not-allowed;
}

.tabs {
  height: calc(100% - 56px);
}
.tabs >>> .el-tabs__content {
  height: 100%;
  padding: 0 20px;
  overflow: auto;
}
.box {
  display: inline-flex;
  width: 220px;
  height: 50px;
  /* flex-wrap: wrap; */
  flex-direction: row;
  align-items: center;
}
.box .label {
  width: 56px;
  margin-right: 20px;
  font-size: 14px;
  color: #606266;
}
.box .el-icon-refresh-right {
  margin: 0 10px;
  cursor: pointer;
}

.color-tip {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 1px solid #999;
  border-radius: 2px;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}
.color-tip div {
  width: 100%;
  height: 100%;
}
</style>

<style>
.el-tabs__nav-wrap:not(.is-scrollable) .el-tabs__nav {
  border-left: 0;
  border-radius: 0 4px 0 0;
}

/* 颜色不允许清空 */
.el-color-picker__panel button.el-button.el-color-dropdown__link-btn.el-button--text.el-button--mini {
  display: none !important;
}
</style>