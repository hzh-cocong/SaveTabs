<template>
  <el-container>
    <el-aside
      width="250px"
      style="border-right:solid 1px #e6e6e6;">
      <el-button
        style="border-radius: 0;height: 56px;width: 100%;border: 0;"
        @click="addTheme(currentThemeFocus)">{{ lang('createTheme') }}</el-button>
      <div
        style="padding: 10px 0 0 0;text-align:center;border-top:solid 1px #e6e6e6">
        <svg-icon
          name="fly-brands"
          class="environment hover"
          :class="{ active: this.openWay == 'popup' }"
          @click.native="popupChange(false);currentThemeFocus();"
        ></svg-icon>
        <svg-icon
          name="ship-solid"
          class="environment hover"
          :class="{ active: this.openWay == 'inject' }"
          @click.native="popupChange(false);currentThemeFocus();"
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
            :style="{ color: item.id == currentTheme.id ? item.config.list_focus_background_color : 'black' }">{{ item.is_system ? lang(item.name) : item.name }}</span>
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
          style="border-left: 1px solid lightgray;height: 24px;margin: 0 10px;"
          :title="lang('themeUpdateTip')">
          <img
            style="width: 24px; height: 24px;margin-left: 20px;"
            src="@/assets/icon-128.png" />
        </div>
        <div
          v-else-if="JSON.stringify(currentTheme.config) != JSON.stringify(oldCurrentThemeConfig)"
          style="border-left: 1px solid lightgray;height: 24px;margin: 0 10px;">
          <el-tooltip
            placement="right"
            :content="lang('themeReset')">
            <i
            class="el-icon-refresh-right hover2"
            style="margin-left: 20px;line-height: 24px;"
            @click="editTheme('all', Object.assign({}, oldCurrentThemeConfig))"></i>
          </el-tooltip>
        </div>
        <span
          v-if=" ! showNameInput"
          style="flex: 1;margin: 0 10px;width:100%;height:100%;display:flex;flex-direction: column;justify-content: center;"
          :style="{ color: currentTheme.name == '' ? '#409EFF' : '#606266',
                    cursor: currentTheme.name == '' ? 'pointer' : 'inherit', }"
          :title="currentTheme.is_system || currentTheme.name == '' ? '' : lang('themeNameUpdate')"
          @click="currentTheme.is_system
                || (showNameInput=true,
                    $nextTick(()=>$refs.themeNameInput.focus()))">{{
              currentTheme.name == ''
            ? lang('themeNameUpdate')
            : ( currentTheme.is_system
              ? lang(currentTheme.name)
              : currentTheme.name)
          }}</span>
        <el-input
          v-if="showNameInput"
          :value="currentTheme.name"
          style="flex: 1;margin: 0 10px;"
          clearable
          :disabled="currentTheme.is_system"
          @blur="showNameInput=false"
          @input="changeThemeName($event, false)"
          @change="changeThemeName($event, true)"
          @keydown.native.enter="showNameInput=false"
          ref="themeNameInput"></el-input>
        <el-button
          type="text"
          @click="cloneTheme();
                  currentThemeFocus();
                  showNameInput=true;
                  $nextTick(()=>$refs.themeNameInput.focus());">{{ lang('clone') }}</el-button>
        <el-button
          type="text"
          @click="leadOut">{{ lang('export') }}</el-button>
        <el-button
          type="text"
          :disabled="currentTheme.is_system"
          @click="deleteTheme(currentThemeFocus);">{{ lang('delete') }}</el-button>
      </el-header>
      <el-main style="padding:0;">
        <el-tabs
          type="card"
          class="tabs"
          v-model="activeName"
          @tab-click="tabClick">
          <el-tab-pane :label="lang('overall')" name="global" lazy>
            <el-divider>{{ lang('layout') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('maskColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.container_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
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
            <div class="box">
              <span class="label">{{ lang('maskBlur') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.container_background_blur"
                :min="0"
                :max="1000"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                @change="editTheme('container_background_blur', $event || 0)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.container_background_blur != oldCurrentThemeConfig.container_background_blur"
                placement="top"
                :content="oldCurrentThemeConfig.container_background_blur+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('container_background_blur', oldCurrentThemeConfig.container_background_blur)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label" :title="lang('pageBlurTip')">{{ lang('pageBackground') }}</span>
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
              <span class="label" :title="lang('pageBlurTip')">{{ lang('pageBlur') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.background_blur"
                :min="0"
                :max="1000"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                @change="editTheme('background_blur', $event || 0)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.background_blur != oldCurrentThemeConfig.background_blur"
                placement="top"
                :content="oldCurrentThemeConfig.background_blur+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('background_blur', oldCurrentThemeConfig.background_blur)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('outerBorder') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.border_width"
                :min="0"
                :max="200"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('border_width', $event || 0)"></el-input-number>
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
              <span class="label">{{ lang('borderColor') }}</span>
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
            <br/>
            <div class="box">
              <span class="label">{{ lang('innerMargin') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.padding_width"
                :min="0"
                :max="200"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('padding_width', $event || 0)"></el-input-number>
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
              <span class="label">{{ lang('indicator') }}</span>
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
            <div class="box">
              <span class="label">{{ lang('loadingBackground') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.loading_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('loading_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.loading_background_color != oldCurrentThemeConfig.loading_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.loading_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('loading_background_color', oldCurrentThemeConfig.loading_background_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('location') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('horizontalAlignment') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_horizontal_align"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
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
              <span class="label">{{ lang('horizontalOffset') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_horizontal_distance"
                :min="currentThemeConfig.position_horizontal_align == 'center' ? -1000 : 0"
                :max="1000"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                @change="editTheme('position_horizontal_distance', $event || 0)"></el-input-number>
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
              <span class="label">{{ lang('verticalAlignment') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_vertical_align"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
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
              <span class="label">{{ lang('verticalOffset') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.position_vertical_distance"
                :min="currentThemeConfig.position_vertical_align == 'center' ? -1000 : 0"
                :max="1000"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                @change="editTheme('position_vertical_distance', $event || 0)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.position_vertical_distance != oldCurrentThemeConfig.position_vertical_distance"
                placement="top"
                :content="oldCurrentThemeConfig.position_vertical_distance+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('position_vertical_distance', oldCurrentThemeConfig.position_vertical_distance)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('temporary')+' ('+lang('workspace')+') ' }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('labelCount') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.tag_line_count"
                :min="1"
                :max="40"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('tag_line_count', $event || 1)"></el-input-number>
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
          <el-tab-pane :label="lang('list')" name="list" lazy>
            <el-divider>{{ lang('layout') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('width') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.width"
                :min="280"
                :max="2000"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ( currentThemeConfig.width_fill
                          && currentTheme.type == 2)"
                :title="( currentThemeConfig.width_fill
                        && currentTheme.type == 2)
                        ? lang('widthPercentageTip')
                        : '' "
                @change="editTheme('width', $event || 280)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.width != oldCurrentThemeConfig.width"
                placement="top"
                :content="oldCurrentThemeConfig.width+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('width', oldCurrentThemeConfig.width)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('widthPercentage') }}</span>
              <el-switch
                :value="currentThemeConfig.width_fill"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('width_fill', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.width_fill != oldCurrentThemeConfig.width_fill"
                placement="top"
                :content="oldCurrentThemeConfig.width_fill ? lang('enable') : lang('close')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('width_fill', oldCurrentThemeConfig.width_fill)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('widthPercentage') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.width_percentage"
                :min="1"
                :max="100"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)
                        || ! currentThemeConfig.width_fill"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                @change="editTheme('width_percentage', $event || 1)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.width_percentage != oldCurrentThemeConfig.width_percentage"
                placement="top"
                :content="oldCurrentThemeConfig.width_percentage+'%'">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('width_percentage', oldCurrentThemeConfig.width_percentage)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('totalHeightAutomatic') }}</span>
              <el-switch
                :value="currentThemeConfig.height_auto"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 1)"
                :title=" ! (currentTheme.type & 1) ? lang('onlyPopupValid') : '' "
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('height_auto', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.height_auto != oldCurrentThemeConfig.height_auto"
                placement="top"
                :content="oldCurrentThemeConfig.height_auto ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('height_auto', oldCurrentThemeConfig.height_auto)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('heightPercentage') }}</span>
              <el-switch
                :value="currentThemeConfig.height_fill"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('height_fill', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.height_fill != oldCurrentThemeConfig.height_fill"
                placement="top"
                :content="oldCurrentThemeConfig.height_fill ? lang('enable') : lang('close')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('height_fill', oldCurrentThemeConfig.height_fill)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('heightPercentage') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.height_percentage"
                :min="1"
                :max="100"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 2)
                        || ! currentThemeConfig.height_fill"
                :title=" ! (currentTheme.type & 2) ? lang('onlyInjectValid') : '' "
                @change="editTheme('height_percentage', $event || 1)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.height_percentage != oldCurrentThemeConfig.height_percentage"
                placement="top"
                :content="oldCurrentThemeConfig.height_percentage+'%'">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('height_percentage', oldCurrentThemeConfig.height_percentage)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('listItemHeight') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.item_height"
                :min="30"
                :max="600"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('item_height', $event || 30)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.item_height != oldCurrentThemeConfig.item_height"
                placement="top"
                :content="oldCurrentThemeConfig.item_height+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('item_height', oldCurrentThemeConfig.item_height)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('listItemCount') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.item_show_count"
                :min="1"
                :max="38"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('item_show_count', $event || 1)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.item_show_count != oldCurrentThemeConfig.item_show_count"
                placement="top"
                :content="oldCurrentThemeConfig.item_show_count+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('item_show_count', oldCurrentThemeConfig.item_show_count)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('pageCount') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_page_count"
                :min="2"
                :max="1000"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_page_count', $event || 2)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.list_page_count != oldCurrentThemeConfig.list_page_count"
                placement="top"
                :content="oldCurrentThemeConfig.list_page_count+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_page_count', oldCurrentThemeConfig.list_page_count)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label" :title="lang('noSearchTip')">{{ lang('noSearchDisplay') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.no_search_item_show_count"
                :min="0"
                :max="38"
                :precision="0"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 1)
                        || ! currentThemeConfig.height_auto"
                :title=" ! (currentTheme.type & 1) ? lang('onlyPopupValid') : '' "
                @change="editTheme('no_search_item_show_count', $event || 0)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.no_search_item_show_count != oldCurrentThemeConfig.no_search_item_show_count"
                placement="top"
                :content="oldCurrentThemeConfig.no_search_item_show_count+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('no_search_item_show_count', oldCurrentThemeConfig.no_search_item_show_count)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label" :title="lang('noSearchTip')">{{ lang('noSearchCache') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.no_search_list_page_count"
                :min="0"
                :max="1000"
                :precision="0"
                :step="currentThemeConfig.no_search_list_page_count == 0 ? 2 : 1"
                :disabled="currentTheme.is_system
                        || ! (currentTheme.type & 1)
                        || ! currentThemeConfig.height_auto"
                :title=" ! (currentTheme.type & 1) ? lang('onlyPopupValid') : '' "
                @change="editTheme('no_search_list_page_count', $event || 0)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.no_search_list_page_count != oldCurrentThemeConfig.no_search_list_page_count"
                placement="top"
                :content="oldCurrentThemeConfig.no_search_list_page_count+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('no_search_list_page_count', oldCurrentThemeConfig.no_search_list_page_count)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('fontSize') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('title') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_font_size"
                :min="12"
                :max="600"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_font_size', $event || 12)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.list_font_size != oldCurrentThemeConfig.list_font_size"
                placement="top"
                :content="oldCurrentThemeConfig.list_font_size+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_font_size', oldCurrentThemeConfig.list_font_size)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitle') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_explain_font_size"
                :min="12"
                :max="600"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_font_size', $event || 12)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_font_size != oldCurrentThemeConfig.list_explain_font_size"
                placement="top"
                :content="oldCurrentThemeConfig.list_explain_font_size+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_font_size', oldCurrentThemeConfig.list_explain_font_size)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('statusbar') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_state_size"
                :min="12"
                :max="600"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_state_size', $event || 12)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.list_state_size != oldCurrentThemeConfig.list_state_size"
                placement="top"
                :content="oldCurrentThemeConfig.list_state_size+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_state_size', oldCurrentThemeConfig.list_state_size)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('keymap') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_keymap_size"
                :min="12"
                :max="600"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_keymap_size', $event || 12)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.list_keymap_size != oldCurrentThemeConfig.list_keymap_size"
                placement="top"
                :content="oldCurrentThemeConfig.list_keymap_size+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_keymap_size', oldCurrentThemeConfig.list_keymap_size)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('listItem') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_font_color != oldCurrentThemeConfig.list_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_font_color', oldCurrentThemeConfig.list_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_background_color != oldCurrentThemeConfig.list_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_background_color', oldCurrentThemeConfig.list_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('highlightColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_highlight_color != oldCurrentThemeConfig.list_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_highlight_color', oldCurrentThemeConfig.list_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('highlightBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_highlight_weight != oldCurrentThemeConfig.list_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_highlight_weight', oldCurrentThemeConfig.list_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('subtitle') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_explain_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_font_color != oldCurrentThemeConfig.list_explain_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_explain_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_font_color', oldCurrentThemeConfig.list_explain_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlight') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_explain_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_highlight_color != oldCurrentThemeConfig.list_explain_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_explain_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_highlight_color', oldCurrentThemeConfig.list_explain_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlightedBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_explain_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_highlight_weight != oldCurrentThemeConfig.list_explain_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_explain_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_highlight_weight', oldCurrentThemeConfig.list_explain_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('icon') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_icon_color != oldCurrentThemeConfig.list_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_icon_color', oldCurrentThemeConfig.list_icon_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('statusbar') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_state_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_state_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_state_color != oldCurrentThemeConfig.list_state_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_state_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_state_color', oldCurrentThemeConfig.list_state_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('keymap') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_keymap_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_keymap_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_keymap_color != oldCurrentThemeConfig.list_keymap_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_keymap_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_keymap_color', oldCurrentThemeConfig.list_keymap_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('listItemSelected') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_focus_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_font_color != oldCurrentThemeConfig.list_focus_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_focus_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_font_color', oldCurrentThemeConfig.list_focus_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_focus_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_background_color != oldCurrentThemeConfig.list_focus_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_focus_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_background_color', oldCurrentThemeConfig.list_focus_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('highlightColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_focus_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_highlight_color != oldCurrentThemeConfig.list_focus_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_focus_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_highlight_color', oldCurrentThemeConfig.list_focus_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('highlightBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_focus_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_highlight_weight != oldCurrentThemeConfig.list_focus_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_focus_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_highlight_weight', oldCurrentThemeConfig.list_focus_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('subtitle') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_explain_focus_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_focus_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_focus_font_color != oldCurrentThemeConfig.list_explain_focus_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_explain_focus_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_focus_font_color', oldCurrentThemeConfig.list_explain_focus_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlight') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_explain_focus_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_focus_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_focus_highlight_color != oldCurrentThemeConfig.list_explain_focus_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_explain_focus_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_focus_highlight_color', oldCurrentThemeConfig.list_explain_focus_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlightedBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_explain_focus_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_explain_focus_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_explain_focus_highlight_weight != oldCurrentThemeConfig.list_explain_focus_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_explain_focus_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_explain_focus_highlight_weight', oldCurrentThemeConfig.list_explain_focus_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('icon') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_focus_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_icon_color != oldCurrentThemeConfig.list_focus_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_focus_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_icon_color', oldCurrentThemeConfig.list_focus_icon_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('statusbar') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_focus_state_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_state_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_state_color != oldCurrentThemeConfig.list_focus_state_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_focus_state_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_state_color', oldCurrentThemeConfig.list_focus_state_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('keymap') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_focus_keymap_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_focus_keymap_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_focus_keymap_color != oldCurrentThemeConfig.list_focus_keymap_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_focus_keymap_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_focus_keymap_color', oldCurrentThemeConfig.list_focus_keymap_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('currentWindowItem') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_font_color != oldCurrentThemeConfig.list_current_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_font_color', oldCurrentThemeConfig.list_current_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_background_color != oldCurrentThemeConfig.list_current_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_background_color', oldCurrentThemeConfig.list_current_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('highlightColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_highlight_color != oldCurrentThemeConfig.list_current_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_highlight_color', oldCurrentThemeConfig.list_current_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('highlightBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_current_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_current_highlight_weight != oldCurrentThemeConfig.list_current_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_current_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_highlight_weight', oldCurrentThemeConfig.list_current_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('subtitle') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_explain_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_explain_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_explain_font_color != oldCurrentThemeConfig.list_current_explain_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_explain_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_explain_font_color', oldCurrentThemeConfig.list_current_explain_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlight') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_explain_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_explain_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_explain_highlight_color != oldCurrentThemeConfig.list_current_explain_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_explain_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_explain_highlight_color', oldCurrentThemeConfig.list_current_explain_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlightedBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_current_explain_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_explain_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_current_explain_highlight_weight != oldCurrentThemeConfig.list_current_explain_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_current_explain_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_explain_highlight_weight', oldCurrentThemeConfig.list_current_explain_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('icon') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_icon_color != oldCurrentThemeConfig.list_current_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_icon_color', oldCurrentThemeConfig.list_current_icon_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('statusbar') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_state_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_state_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_state_color != oldCurrentThemeConfig.list_current_state_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_state_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_state_color', oldCurrentThemeConfig.list_current_state_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('currentWindowItemSelected') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_focus_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_focus_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_focus_font_color != oldCurrentThemeConfig.list_current_focus_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_focus_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_focus_font_color', oldCurrentThemeConfig.list_current_focus_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_focus_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_focus_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_focus_background_color != oldCurrentThemeConfig.list_current_focus_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_focus_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_focus_background_color', oldCurrentThemeConfig.list_current_focus_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('highlightColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_focus_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_focus_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_focus_highlight_color != oldCurrentThemeConfig.list_current_focus_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_focus_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_focus_highlight_color', oldCurrentThemeConfig.list_current_focus_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('highlightBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_current_focus_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_focus_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_current_focus_highlight_weight != oldCurrentThemeConfig.list_current_focus_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_current_focus_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_focus_highlight_weight', oldCurrentThemeConfig.list_current_focus_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('subtitle') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_explain_focus_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_explain_focus_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_explain_focus_font_color != oldCurrentThemeConfig.list_current_explain_focus_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_explain_focus_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_explain_focus_font_color', oldCurrentThemeConfig.list_current_explain_focus_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlight') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_explain_focus_highlight_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_explain_focus_highlight_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_explain_focus_highlight_color != oldCurrentThemeConfig.list_current_explain_focus_highlight_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_explain_focus_highlight_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_explain_focus_highlight_color', oldCurrentThemeConfig.list_current_explain_focus_highlight_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('subtitleHighlightedBold') }}</span>
              <el-select
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.list_current_explain_focus_highlight_weight"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_explain_focus_highlight_weight', $event)">
                <el-option
                  v-for="align in highlightFontWeight"
                  :value="align.value"
                  :label="align.label"
                  :key="align.value"></el-option>
              </el-select>
              <el-tooltip
                v-if="currentThemeConfig.list_current_explain_focus_highlight_weight != oldCurrentThemeConfig.list_current_explain_focus_highlight_weight"
                placement="top"
                :content="highlightFontWeight.find(align => align.value == oldCurrentThemeConfig.list_current_explain_focus_highlight_weight).label">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_explain_focus_highlight_weight', oldCurrentThemeConfig.list_current_explain_focus_highlight_weight)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('icon') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_focus_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_focus_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_focus_icon_color != oldCurrentThemeConfig.list_current_focus_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_focus_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_focus_icon_color', oldCurrentThemeConfig.list_current_focus_icon_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('statusbar') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_current_focus_state_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_current_focus_state_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_current_focus_state_color != oldCurrentThemeConfig.list_current_focus_state_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_current_focus_state_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_current_focus_state_color', oldCurrentThemeConfig.list_current_focus_state_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('scrollBar') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('color') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_scrollbar_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_scrollbar_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_scrollbar_color != oldCurrentThemeConfig.list_scrollbar_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_scrollbar_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_scrollbar_color', oldCurrentThemeConfig.list_scrollbar_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('selectedColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.list_scrollbar_focus_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('list_scrollbar_focus_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.list_scrollbar_focus_color != oldCurrentThemeConfig.list_scrollbar_focus_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.list_scrollbar_focus_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('list_scrollbar_focus_color', oldCurrentThemeConfig.list_scrollbar_focus_color)"></i>
              </el-tooltip>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="lang('menubar')" name="menu" lazy>
            <el-divider>{{ lang('layout') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('height') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.toolbar_height"
                :min="30"
                :max="600"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_height', $event || 30)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_height != oldCurrentThemeConfig.toolbar_height"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_height+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_height', oldCurrentThemeConfig.toolbar_height)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_background_color != oldCurrentThemeConfig.toolbar_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_background_color', oldCurrentThemeConfig.toolbar_background_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('borderColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_border_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_border_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_border_color != oldCurrentThemeConfig.toolbar_border_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_border_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_border_color', oldCurrentThemeConfig.toolbar_border_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('icon') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('autoHide') }}</span>
              <el-switch
                :value="currentThemeConfig.toolbar_icon_auto_hide"
                :disabled="currentTheme.is_system"
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('toolbar_icon_auto_hide', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_icon_auto_hide != oldCurrentThemeConfig.toolbar_icon_auto_hide"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_icon_auto_hide ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_icon_auto_hide', oldCurrentThemeConfig.toolbar_icon_auto_hide)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('color') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_icon_color != oldCurrentThemeConfig.toolbar_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_icon_color', oldCurrentThemeConfig.toolbar_icon_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('selectedColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_icon_focus_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_icon_focus_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_icon_focus_color != oldCurrentThemeConfig.toolbar_icon_focus_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_icon_focus_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_icon_focus_color', oldCurrentThemeConfig.toolbar_icon_focus_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('dropdownMenu') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('autoHide') }}</span>
              <el-switch
                :value="currentThemeConfig.toolbar_menu_auto_hide"
                :disabled="currentTheme.is_system"
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('toolbar_menu_auto_hide', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_menu_auto_hide != oldCurrentThemeConfig.toolbar_menu_auto_hide"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_menu_auto_hide ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_menu_auto_hide', oldCurrentThemeConfig.toolbar_menu_auto_hide)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('workspaceName') }}</span>
              <el-switch
                :value="currentThemeConfig.toolbar_menu_show_workspace_name"
                :disabled="currentTheme.is_system"
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('toolbar_menu_show_workspace_name', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_menu_show_workspace_name != oldCurrentThemeConfig.toolbar_menu_show_workspace_name"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_menu_show_workspace_name ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_menu_show_workspace_name', oldCurrentThemeConfig.toolbar_menu_show_workspace_name)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_menu_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_menu_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_menu_font_color != oldCurrentThemeConfig.toolbar_menu_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_menu_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_menu_font_color', oldCurrentThemeConfig.toolbar_menu_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('iconColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_menu_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_menu_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_menu_icon_color != oldCurrentThemeConfig.toolbar_menu_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_menu_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_menu_icon_color', oldCurrentThemeConfig.toolbar_menu_icon_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('iconSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_menu_icon_fixed_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_menu_icon_fixed_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_menu_icon_fixed_color != oldCurrentThemeConfig.toolbar_menu_icon_fixed_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_menu_icon_fixed_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_menu_icon_fixed_color', oldCurrentThemeConfig.toolbar_menu_icon_fixed_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('inputBox') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('showHint') }}</span>
              <el-switch
                :value="currentThemeConfig.toolbar_input_tip_show"
                :disabled="currentTheme.is_system"
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('toolbar_input_tip_show', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_input_tip_show != oldCurrentThemeConfig.toolbar_input_tip_show"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_input_tip_show ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_input_tip_show', oldCurrentThemeConfig.toolbar_input_tip_show)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('borderSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_input_focus_border_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_input_focus_border_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_input_focus_border_color != oldCurrentThemeConfig.toolbar_input_focus_border_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_input_focus_border_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_input_focus_border_color', oldCurrentThemeConfig.toolbar_input_focus_border_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_input_selected_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_input_selected_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_input_selected_background_color != oldCurrentThemeConfig.toolbar_input_selected_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_input_selected_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_input_selected_background_color', oldCurrentThemeConfig.toolbar_input_selected_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('fontSize') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.toolbar_input_font_size"
                :min="12"
                :max="Math.floor((currentThemeConfig.toolbar_height-2)/1.15)"
                :precision="0"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_input_font_size', $event || 12)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_input_font_size != oldCurrentThemeConfig.toolbar_input_font_size"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_input_font_size+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_input_font_size', oldCurrentThemeConfig.toolbar_input_font_size)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_input_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_input_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_input_font_color != oldCurrentThemeConfig.toolbar_input_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_input_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_input_font_color', oldCurrentThemeConfig.toolbar_input_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('fontSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_input_selected_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_input_selected_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_input_selected_font_color != oldCurrentThemeConfig.toolbar_input_selected_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_input_selected_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_input_selected_font_color', oldCurrentThemeConfig.toolbar_input_selected_font_color)"></i>
              </el-tooltip>
            </div>
            <el-divider>{{ lang('operationButton') }}</el-divider>
            <div class="box">
              <span class="label">{{ lang('autoHide') }}</span>
              <el-switch
                :value="currentThemeConfig.toolbar_button_auto_hide"
                :disabled="currentTheme.is_system"
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('toolbar_button_auto_hide', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_auto_hide != oldCurrentThemeConfig.toolbar_button_auto_hide"
                placement="top"
                :content="oldCurrentThemeConfig.toolbar_button_auto_hide ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_auto_hide', oldCurrentThemeConfig.toolbar_button_auto_hide)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('fontColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_font_color != oldCurrentThemeConfig.toolbar_button_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_font_color', oldCurrentThemeConfig.toolbar_button_font_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('fontHovered') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_hover_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_hover_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_hover_font_color != oldCurrentThemeConfig.toolbar_button_hover_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_hover_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_hover_font_color', oldCurrentThemeConfig.toolbar_button_hover_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('borderHovered') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_hover_border_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_hover_border_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_hover_border_color != oldCurrentThemeConfig.toolbar_button_hover_border_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_hover_border_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_hover_border_color', oldCurrentThemeConfig.toolbar_button_hover_border_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundHovered') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_hover_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_hover_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_hover_background_color != oldCurrentThemeConfig.toolbar_button_hover_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_hover_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_hover_background_color', oldCurrentThemeConfig.toolbar_button_hover_background_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('fontSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_active_font_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_active_font_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_active_font_color != oldCurrentThemeConfig.toolbar_button_active_font_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_active_font_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_active_font_color', oldCurrentThemeConfig.toolbar_button_active_font_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('borderSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_active_border_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_active_border_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_active_border_color != oldCurrentThemeConfig.toolbar_button_active_border_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_active_border_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_active_border_color', oldCurrentThemeConfig.toolbar_button_active_border_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('backgroundSelected') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.toolbar_button_active_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system"
                @change="editTheme('toolbar_button_active_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.toolbar_button_active_background_color != oldCurrentThemeConfig.toolbar_button_active_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.toolbar_button_active_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('toolbar_button_active_background_color', oldCurrentThemeConfig.toolbar_button_active_background_color)"></i>
              </el-tooltip>
            </div>
          </el-tab-pane>
          <el-tab-pane :label="lang('statusbar')" name="status" lazy>
            <div class="box">
              <span class="label">{{ lang('showStatusBar') }}</span>
              <el-switch
                :value="currentThemeConfig.statusbar_show"
                :disabled="currentTheme.is_system"
                active-color="#13ce66"
                inactive-color="gray"
                @change="editTheme('statusbar_show', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.statusbar_show != oldCurrentThemeConfig.statusbar_show"
                placement="top"
                :content="oldCurrentThemeConfig.statusbar_show ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('statusbar_show', oldCurrentThemeConfig.statusbar_show)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('showTotal') }}</span>
              <el-switch
                :value="currentThemeConfig.statusbar_show_search_total"
                active-color="#13ce66"
                inactive-color="gray"
                :disabled="currentTheme.is_system
                        || ! currentThemeConfig.statusbar_show"
                @change="editTheme('statusbar_show_search_total', $event)">
              </el-switch>
              <el-tooltip
                v-if="currentThemeConfig.statusbar_show_search_total != oldCurrentThemeConfig.statusbar_show_search_total"
                placement="top"
                :content="currentThemeConfig.statusbar_show_search_total ? lang('show') : lang('hide')">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('statusbar_show_search_total', oldCurrentThemeConfig.statusbar_show_search_total)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('backgroundColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.statusbar_background_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system
                        || ! currentThemeConfig.statusbar_show"
                @change="editTheme('statusbar_background_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.statusbar_background_color != oldCurrentThemeConfig.statusbar_background_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.statusbar_background_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('statusbar_background_color', oldCurrentThemeConfig.statusbar_background_color)"></i>
              </el-tooltip>
            </div>
            <div class="box">
              <span class="label">{{ lang('iconColor') }}</span>
              <el-color-picker
                show-alpha
                size="mini"
                :value="currentThemeConfig.statusbar_icon_color"
                :predefine="predefine"
                :disabled="currentTheme.is_system
                        || ! currentThemeConfig.statusbar_show"
                @change="editTheme('statusbar_icon_color', $event)"
              ></el-color-picker>
              <el-tooltip
                v-if="currentThemeConfig.statusbar_icon_color != oldCurrentThemeConfig.statusbar_icon_color"
                placement="top"
                effect="light">
                <div
                  slot="content"
                  class="color-tip">
                  <div :style="{ backgroundColor: oldCurrentThemeConfig.statusbar_icon_color }"></div>
                </div>
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('statusbar_icon_color', oldCurrentThemeConfig.statusbar_icon_color)"></i>
              </el-tooltip>
            </div>
            <br/>
            <div class="box">
              <span class="label">{{ lang('imageTransparency') }}</span>
              <el-input-number
                size="mini"
                style="width: 100px;"
                :value="currentThemeConfig.statusbar_image_opacity"
                :min="0.1"
                :max="1"
                :step="0.1"
                :precision="2"
                :disabled="currentTheme.is_system
                        || ! currentThemeConfig.statusbar_show"
                @change="editTheme('statusbar_image_opacity', $event || 0.2)"></el-input-number>
              <el-tooltip
                v-if="currentThemeConfig.statusbar_image_opacity != oldCurrentThemeConfig.statusbar_image_opacity"
                placement="top"
                :content="oldCurrentThemeConfig.statusbar_image_opacity+''">
                <i
                class="el-icon-refresh-right hover2"
                @click="editTheme('statusbar_image_opacity', oldCurrentThemeConfig.statusbar_image_opacity)"></i>
              </el-tooltip>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import { nanoid } from 'nanoid'
import Sortable from 'sortablejs';
import projectConfig from '@/config/project_config.json'
var validate = require("validate.js");

const THEME_TYPWE = {
  POPUP: 1,
  INJECT: 2,
}
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
      required: true,
    },
    currentThemeList: {
      type: Array,
      required: true,
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
        { value: 'center', label: this.lang('center')},
        { value: 'left', label: this.lang('left')},
        { value: 'right', label: this.lang('right')},
      ],
      positionVerticalOptions: [
        { value: 'center', label: this.lang('center')},
        { value: 'top', label: this.lang('top')},
        { value: 'bottom', label: this.lang('bottom')},
      ],
      highlightFontWeight: [
        { value: '100', label: '100'},
        { value: '200', label: '200'},
        { value: '300', label: '300'},
        { value: '400', label: this.lang('standard')},
        { value: '500', label: '500'},
        { value: '600', label: '600'},
        { value: '700', label: this.lang('bold')},
        { value: '800', label: '800'},
        { value: '900', label: '900'},
      ],

      themeAttribute: projectConfig.themeAttributes,

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
        this.currentThemeConfig.background_color,

        this.currentThemeConfig.list_font_color,
        this.currentThemeConfig.list_background_color,
        this.currentThemeConfig.list_explain_font_color,
        this.currentThemeConfig.list_highlight_color,
        this.currentThemeConfig.list_icon_color,
        this.currentThemeConfig.list_state_color,
        this.currentThemeConfig.list_keymap_color,

        this.currentThemeConfig.list_focus_font_color,
        this.currentThemeConfig.list_focus_background_color,
        this.currentThemeConfig.list_explain_focus_font_color,
        this.currentThemeConfig.list_focus_highlight_color,
        this.currentThemeConfig.list_focus_icon_color,
        this.currentThemeConfig.list_focus_state_color,
        this.currentThemeConfig.list_focus_keymap_color,

        // this.currentThemeConfig.toolbar_background_color,
        // this.currentThemeConfig.toolbar_border_color,
        // this.currentThemeConfig.toolbar_icon_color,
        // this.currentThemeConfig.toolbar_icon_focus_color,
        // this.currentThemeConfig.toolbar_menu_icon_color,
        // this.currentThemeConfig.toolbar_menu_icon_fixed_color,
        // this.currentThemeConfig.toolbar_menu_font_color,
        // this.currentThemeConfig.toolbar_input_font_color,
        // this.currentThemeConfig.toolbar_input_selected_font_color,
        // this.currentThemeConfig.toolbar_input_selected_background_color,
      ]))
    }
  },
  methods: {
    currentThemeFocus() {
      this.$nextTick(()=> this.$refs.theme.scrollTop = this.currentThemeIndex * (56+10));
    },

    tabClick() {
      let query = {};
      query[this.activeName]=null;
      this.$router.replace({ name: 'theme-general', query}).catch(()=>{});
    },

    leadOut() {
      let data = {
        user_theme_list: [
          validate.cleanAttributes(this.currentTheme, this.themeAttribute.user_theme_list.array)
        ]
      }

      let filename = this.currentTheme.name + '-SavetabsTheme.json';

      let patt = /^(?!\.)[^\\\/:\*\?"<>\|]{1,250}$/;
      if( ! patt.test(filename)) {
        filename = 'SaveTabsTheme.json';
      }

      this.download(filename, JSON.stringify(data));
    },

    download: function(filename, data) {
      var urlObject = window.URL || window.webkitURL || window;
      var blob = new Blob([data], {type: "application/json"});
      var url = urlObject.createObjectURL(blob);

      chrome.downloads.download({
          url: url,
          filename: filename,
          //saveAs: false,
      });
    }
  },
  mounted() {
    let res = window.location.href.match(/\?([^?]+)$/);
    if(res != null
    && ['global', 'list', 'menu', 'status'].indexOf(res[1]) != -1) {
      this.activeName = res[1];
    }

    this.currentThemeFocus();

    //创建拖拽对象
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
  padding-bottom: 25px;
  box-sizing: border-box;
  /* overflow: auto; */
  overflow: hidden;
}
.tabs >>> .el-tabs__content .el-tab-pane {
  height: 100%;
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
  width: 70px;
  margin-right: 10px;
  font-size: 13px;
  color: #303133;
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