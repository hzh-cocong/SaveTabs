<template>
  <el-container>
    <el-aside
      width="250px"
      style="display: flex;flex-direction: column;height: 100vh;border-right:solid 1px #e6e6e6">
      <el-button style="border-radius: 0;height: 56px;border: 0;">创建主题</el-button>
      <div
        style="padding: 10px 0 0 0;text-align:center;border-top:solid 1px #e6e6e6">
        <svg-icon
          name="fly-brands"
          class="environment hover"
          :class="{ active: this.openWay == 'popup' }"
          @click.native="popupChange"
        ></svg-icon>
        <svg-icon
          name="ship-solid"
          class="environment hover"
          :class="{ active: this.openWay == 'inject' }"
          @click.native="popupChange"
        ></svg-icon>
      </div>
      <ul
        class="theme">
        <li
          class="theme-item"
          :class="{ selected: item.id == currentTheme.id }"
          v-for="(item, index) in currentThemeList"
          :key="index"
          @click="$emit('update:currentTheme', item)">
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
              }">.</span></span>
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
          :class="{ active: currentTheme.type & 1 }"
          @click.native="changeType(1)"
        ></svg-icon>
        <svg-icon
          name="ship-solid"
          class="type hover"
          :class="{ active: currentTheme.type & 2 }"
          @click.native="changeType(2)"
        ></svg-icon>
        <span
          v-if=" ! showNameInput"
          style="flex: 1;margin: 0 10px;color: #606266;width:100%;height:100%;display:flex;flex-direction: column;justify-content: center;"
          @click="showNameInput=true;
                  $nextTick(()=>$refs.themeNameInput.focus())">{{ currentTheme.name }}</span>
        <el-input
          v-if="showNameInput"
          :value="currentTheme.name"
          style="flex: 1;margin: 0 10px;"
          clearable
          @blur="showNameInput=false"
          @input="changeThemeName($event, false)"
          @change="changeThemeName($event, true)"
          ref="themeNameInput"></el-input>
        <el-link>删除</el-link>
        <el-link style="margin: 0 10px;">导出</el-link>
        <el-link>克隆</el-link>
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
                @change="editTheme('border_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.border_color != oldCurrentThemeConfig.border_color"
                placement="top"
                :content="oldCurrentThemeConfig.border_color+''">
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
                @change="editTheme('container_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.container_background_color != oldCurrentThemeConfig.container_background_color"
                placement="top"
                :content="oldCurrentThemeConfig.container_background_color+''">
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
                @change="editTheme('background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.background_color != oldCurrentThemeConfig.background_color"
                placement="top"
                :content="oldCurrentThemeConfig.background_color+''">
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
                @change="editTheme('carousel_indicators_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.carousel_indicators_color != oldCurrentThemeConfig.carousel_indicators_color"
                placement="top"
                :content="oldCurrentThemeConfig.carousel_indicators_color+''">
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

export default {
  name: 'ThemeGeneral',
  inject: [
    'popupChange',
    'changeType',
    'changeThemeName',
    'editTheme',
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
      return [
        this.currentThemeConfig.border_color,
        this.currentThemeConfig.background_color
      ]
    }
  },
  methods: {
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

.type {
  margin: 0 10px;
  color: lightgray;
  cursor: pointer;
}
.type.active {
  color: #009966;
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
  margin-right: 20px;
  font-size: 14px;
  color: #606266;
}
.box .el-icon-refresh-right {
  margin: 0 10px;
  cursor: pointer;
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