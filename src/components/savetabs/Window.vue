<template>
  <div class="window">

  <el-alert
    v-if="isSearched && list.length == 0"
    type="info"
    :closable="false"
    show-icon
    style="margin: 0 10px;"
    :style="{ width: (currentThemeConfig.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (currentThemeConfig.width-70)+'px' }">
      <div style="flex:1;">
        <div>{{ storageList.length == 0 ? lang('windowNoResult') : lang('windowNoResult2') }}</div>
        <div v-if="storageList.length > 0">{{ lang('windowCountTip')+storageList.length+lang('windowCountTip2') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise', getKeyType($event))"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews', getKeyType($event))"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other', getKeyType($event))"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :listLength="list.length"
    :itemHeight="currentThemeConfig.item_height"
    :itemShowCount="itemShowCount"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="currentThemeConfig.list_scrollbar_color"
    :scrollbarFocusColor="currentThemeConfig.list_scrollbar_focus_color"
    :itemStyle="itemStyle"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @itemClick="_openWindow(getKeyType($event))">
    <template
      v-if=" ! workspaceSwitch"
      #default="{ index, item, isActive, isSelected }">
          <!-- width: (currentThemeConfig.item_height*3/5)+'px',
          height: (currentThemeConfig.item_height*3/5)+'px' }" -->
      <span
        class="left"
        :style="{
          width: currentThemeConfig.item_height+'px',
          padding: (currentThemeConfig.item_height*1/5)+'px' }">
          <!-- :src="getIcon(item.tabs[0].icon, item.tabs[0].url, currentThemeConfig.item_height*3/5)" -->
        <el-image
          v-if="isLoad"
          :src="iconMap[index]"
          style="width:100%; height: 100%;"
          fit="cover"
          :scroll-container="$refs.list.$el"
          :lazy="index >= currentThemeConfig.item_show_count">
          <div slot="error">
            <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder">
            <!-- <img v-if="index >= currentThemeConfig.item_show_count" src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
          </div>
        </el-image>
      </span>

      <div class="main">
        <span
          class="title"
          :style="{fontSize: currentThemeConfig.list_font_size+'px'}"
          v-html="highlightMap[index]"></span>
        <div
          class="sub-title"
          v-if="isSelected && keyType != ''"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: item.windowId == currentWindowId
                ? ( isSelected
                  ? currentThemeConfig.list_current_explain_focus_font_color
                  : currentThemeConfig.list_current_explain_font_color)
                : ( isSelected
                  ? currentThemeConfig.list_explain_focus_font_color
                  : currentThemeConfig.list_explain_font_color) }">{{ getTip() }}</div>
      </div>

      <div
        class="right"
        @click.stop>
        <template v-if="isActive || activeWindows[item.windowId] || (storageKeyword != '' && item.lastVisitTime != undefined)">
          <div v-if="isActive">
            <el-badge
              v-if="isCurrentWindowChange && item.windowId == currentWindowId"
              is-dot
              class="refresh"
              style="margin-right: 10px"
              :style="{ borderColor: currentThemeConfig.list_current_focus_state_color } " >
              <el-button
                type="warning"
                icon="el-icon-refresh"
                circle
                @click.stop="showDifference"></el-button>
            </el-badge>
            <el-button
              v-if="! isInCurrentWindow && ! activeWindows[item.windowId]"
              type="warning"
              icon="el-icon-refresh"
              circle
              @click.stop="showDifference"></el-button>
            <el-button
              type="success"
              icon="el-icon-folder-opened"
              circle
              @click.stop="openGroup"></el-button>
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              @click.stop="changeGroupName"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              @click.stop="deleteGroup"></el-button>
          </div>
          <div
            v-else-if="item.windowId == currentWindowId"
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                    ? currentThemeConfig.list_current_focus_state_color
                    : currentThemeConfig.list_current_state_color }">
            <template v-if="isCurrentWindowChange">
              <el-badge
                is-dot
                :style="{
                  borderColor: isSelected
                              ? currentThemeConfig.list_current_focus_state_color
                              : currentThemeConfig.list_current_state_color }">
                <span style="margin-right: 5px;">{{ lang('currentWindow') }}</span>
              </el-badge>
            </template>
            <template v-else>
              <span>{{ lang('currentWindow') }}</span>
            </template>
          </div>
          <div
            v-else-if="activeWindows[item.windowId]"
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                  ? currentThemeConfig.list_focus_state_color
                  : currentThemeConfig.list_state_color }">
            {{ lang('opened') }}
          </div>
          <div
            v-else-if="storageKeyword != '' && item.lastVisitTime != undefined"
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                  ? currentThemeConfig.list_focus_state_color
                  : currentThemeConfig.list_state_color }">
            {{ timeShow(item.lastVisitTime) }}
          </div>
        </template>
        <template v-if=" ! isActive && item.windowId != currentWindowId">
          <span
            v-if="isSelected"
            :style="{
              fontSize: currentThemeConfig.list_keymap_size+'px',
              color: currentThemeConfig.list_focus_keymap_color }">↩</span>
          <span
            v-else-if="_device.platform != ''
                    && (index-$refs.list.scrollLines+1) <= 9"
            :style="{
              fontSize: currentThemeConfig.list_keymap_size+'px',
              color: currentThemeConfig.list_keymap_color }">
            <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
            <!-- <font style="font-family: Consolas, Monaco, monospace;">{{ -->
            <font
              style="display:inline-block;text-align:left;"
              :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }">{{
                1 > index-$refs.list.scrollLines+1
              ? 1
              : (index-$refs.list.scrollLines+1 > currentThemeConfig.item_show_count
                ? currentThemeConfig.item_show_count
                : index-$refs.list.scrollLines+1)
            }}</font>
          </span>
        </template>
      </div>
    </template>
    <template
      v-else
      #default="{ index, item, isActive, isSelected }">
      <span
        class="left"
        :style="{
          width: currentThemeConfig.item_height+'px',
          padding: (currentThemeConfig.item_height*1/5)+'px' }">
        <svg-icon
          :name="item.svg"
          style="width:100%; height: 100%;"
          :style="{ color: isSelected
                          ? currentThemeConfig.list_focus_icon_color
                          : currentThemeConfig.list_icon_color, }"></svg-icon>
      </span>

      <div class="main">
        <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="highlight(item.name, storageKeyword.substr(config.workspace_change_word.length).trim().split(/\s+/)[0], '<strong>', '</strong>')"></div>
        <div
          v-if="isSelected && item.tip != ''"
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: isSelected
                  ? currentThemeConfig.list_explain_focus_font_color
                  : currentThemeConfig.list_explain_font_color }"
            v-html="item.tip"></div>
      </div>

      <div class="right">
        <span
            v-if="isSelected"
            :style="{
              fontSize: currentThemeConfig.list_keymap_size+'px',
              color: currentThemeConfig.list_focus_keymap_color,
            }">↩</span>
        <span
          v-else-if="_device.platform != ''
            && (index-$refs.list.scrollLines+1) <= 9"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.list_keymap_color,
          }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
          <!-- <font style="font-family: Consolas, Monaco, monospace;">{{ -->
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }">{{
              1 > index-$refs.list.scrollLines+1
            ? 1
            : (index-$refs.list.scrollLines+1 > currentThemeConfig.item_show_count
              ? currentThemeConfig.item_show_count
              : index-$refs.list.scrollLines+1)
          }}</font>
        </span>
      </div>
    </template>
  </list>

  <el-dialog
    :visible.sync="groupVisible"
    :append-to-body="true"
    width="80%"
    class="window-group"
    @open="groupVisible2=true;blur();"
    @closed="groupVisible2=false"
    @close="focus">
    <div slot="title" style="width: 100%;display:flex;">
      <!-- <el-link type="info" @click="download"><i class="el-icon-download"></i></el-link> -->
      <span style="color:gray;cursor:pointer;margin-top:4px;" @click="download"><i class="el-icon-download"></i></span>
      <span style="margin-left: 15px;font-size: 18px; flex: 1; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <span>{{group.name}}</span>
        <span
          style="color:hsl(0, 0%, 66%);margin-left: 20px;"
          v-if="group.tabs">{{ group.tabs.length+' '+(group.tabs.length>1?'tabs':'tab') }}</span>
      </span>
    </div>
    <!-- v-if="groupVisible" 减少不必要的调用 -->
    <ul
      v-if="groupVisible2"
      class="group-list beautify-scrollbar"
      :style="{ height: (30*currentThemeConfig.item_show_count)+'px' }">
      <li
        class="group-list-item"
        v-for="(tab, index) in group.tabs"
        :key="index">

        <el-image
          :src="getIcon(tab.icon, tab.url, 20)"
          style="width:20px; height:20px;"
          fit="cover"
          scroll-container=".window-group .group-list"
          lazy>
          <div slot="error">
            <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder">
            <!-- <img v-if="index >= currentThemeConfig.item_show_count" src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
          </div>
        </el-image>

        <span
          class="tab-name"
          type="default"
          :title="tab.url"
          @click="$open(tab.url, getKeyType($event))">{{ tab.title || tab.url }}</span>

      </li>
    </ul>
  </el-dialog>

  <!-- 由于该 dialog 绑定了一些比较耗时的 computed，会导致页面启动时多次 update，所以加多个 v-if -->
  <el-dialog
    v-if="isSearched"
    :visible.sync="differenceVisible"
    :append-to-body="true"
    :destroy-on-close="true"
    width="80%"
    class="window-difference"
    @opened="addCompareEvent"
    @open="differenceVisible2=true;"
    @closed="differenceVisible2=false"
    @close="focus">
    <div slot="title" style="width: 100%;display:flex;">
      <span style="color:gray;cursor:pointer;margin-top:4px;" @click="refreshWindows(true)"><i class="el-icon-refresh"></i></span>
      <span style="margin-left: 15px;font-size: 18px; flex: 1; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        <span>{{oldGroup.name}}</span>
        <span
          style="color:hsl(0, 0%, 66%);margin-left: 20px;"
          v-if=" ! haveDifference">{{ '无差别' }}</span>
      </span>
    </div>
    <!-- v-if="differenceVisible" 减少不必要的更新，如 getIcon 会因为别的变化而多次调用-->
    <div class="compare" v-if="differenceVisible2">
      <div class="left">
        <div style="text-align: center;padding: 5px 0;">
          <span>旧</span>
          <span
            style="margin-left: 20px;"
            v-if="oldGroup.tabs">{{ oldGroup.tabs.length+' '+(oldGroup.tabs.length>1?'tabs':'tab') }}</span>
        </div>
        <ul
          class="group-list"
          :style="{ height: (30*(currentThemeConfig.item_show_count <= 2 ? 1 : currentThemeConfig.item_show_count-2)+10)+'px' }">
          <li
            class="group-list-item"
            v-for="(tab, index) in oldGroup.tabs"
            :key="index">

            <el-image
              :src="getIcon(tab.icon, tab.url, 20)"
              style="width:20px; height:20px;"
              fit="cover"
              scroll-container=".window-difference .compare .left .group-list"
              lazy>
              <div slot="error">
                <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder">
                <!-- <img v-if="index >= currentThemeConfig.item_show_count" src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
              </div>
            </el-image>

            <span
              class="tab-name"
              type="default"
              :title="'【icon】'+(tab.icon || '')+'\r\n'+'【url】'+tab.url"
              @click="$open(tab.url, getKeyType($event))">{{ tab.title || tab.url }}</span>

          </li>
        </ul>
      </div>
      <div class="right">
        <div style="text-align: center;padding: 5px 0;">
          <span>新</span>
          <span
            style="margin-left: 20px;"
            v-if="currentWindow.tabs">{{ currentWindow.tabs.length+' '+(currentWindow.tabs.length>1?'tabs':'tab') }}</span>
        </div>
        <ul
          class="group-list"
          :style="{ height: (30*(currentThemeConfig.item_show_count <= 2 ? 1 : currentThemeConfig.item_show_count-2)+10)+'px' }">
          <li
            class="group-list-item"
            v-for="(tab, index) in currentWindow.tabs"
            :key="index">

            <el-image
              :src="getIcon('', tab.url || tab.pendingUrl, 20)"
              style="width:20px; height:20px;"
              fit="cover"
              scroll-container=".window-difference .compare .right .group-list"
              lazy>
              <div slot="error">
                <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder">
                <!-- <img v-if="index >= currentThemeConfig.item_show_count" src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
              </div>
            </el-image>

            <span
              class="tab-name"
              type="default"
              :title="'icon: '+(tab.favIconUrl || '')+'\r\n'+'url: '+(tab.url || tab.pendingUrl)"
              @click="$active(tab.id)">{{ tab.title || tab.url || tab.pendingUrl }}</span>

          </li>
        </ul>
      </div>
    </div>
    <span slot="footer" v-if="differenceVisible2">
      <el-button size="small" v-if="isCurrentWindowChange" style="float: left;" @click="restore">还 原</el-button>
      <el-button size="small" v-else style="float: left;" @click="bind">绑 定</el-button>
      <el-button size="small" @click="differenceVisible = false">取 消</el-button>
      <el-button class="autofocus" type="primary" size="small" @click="updateGroup">更 新</el-button>
    </span>
  </el-dialog>

  </div>
</template>

<script>
import List from '../common/List.vue'
import { nanoid } from 'nanoid'

export default {
  name: 'Window',
  inject: ['focus', 'blur', 'input', 'statusTip'],
  props: {
    searchTotal: {
      type: Number,
      required: false,
      default: 0,
    },
    listCount: {
      type: Number,
      required: false,
      default: 0,
    },
    config: {
      type: Object,
      required: require,
    },
    currentThemeConfig: {
      type: Object,
      required: require,
    },
    projectConfig: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    keyType: {
      type: String,
      required: false,
      default: '',
    },
    activeWorkspace: {
      type: Object,
      required: true,
    },
    openWay: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      list: [],
      cacheList: [],
      storageList: [],

      scrollDisabled: true,
      storageKeyword: undefined,
      isFirstSearch: true,

      currentIndex: -1,
      activeWindows: {},

      // isCurrentWindowChange: false,
      // isInCurrentWindow: false,

      groupVisible: false,
      groupVisible2: false,
      group: {},

      isSearched: false,
      isFinish: false,

      differenceVisible: false,
      differenceVisible2: false,
      oldGroup: {},
      currentWindow: {},
      // haveDifference: true,

      isOperating: false,

      w: {
        timer: null,
      }
    }
  },
  watch: {
    cacheList(newVal, oldVal) {
      console.log('watch:cacheList', newVal, oldVal)
      this.$emit('update:searchTotal', newVal.length)
    },
    list(newVal, oldVal) {
      console.log('watch:list', newVal, oldVal)
      this.$emit('update:listCount', newVal.length)
    },
  },
  components: {
    List,
  },
  computed: {
    listPageCount() {
      if(this.itemShowCount <= 0) return 0;
      console.log('window.listPageCount')

      return this.storageKeyword == '' && this.currentThemeConfig.height_auto && this.openWay == 'popup'
            ? this.currentThemeConfig.no_search_list_page_count
            : this.currentThemeConfig.list_page_count
    },
    itemShowCount() {
      return this.storageKeyword == '' && this.currentThemeConfig.height_auto && this.openWay == 'popup'
            ? this.currentThemeConfig.no_search_item_show_count
            : this.currentThemeConfig.item_show_count
    },

    workspaceSwitch() {
      return ! ( this.storageKeyword == undefined
              || this.config.workspace_change_word == undefined
              || this.config.workspace_change_word.length == 0
              || this.storageKeyword.startsWith(this.config.workspace_change_word) == false);
    },
    workspaceList() {
      return this.config.workspaces.filter(
        workspace => workspace != 'window'
      ).map(workspace => ({
        type: workspace,
        name: this.lang(workspace) + ( this.lang(workspace) == workspace ? '' : ` (${workspace}) `),
        svg: this.projectConfig.allWorkspaces[ workspace ].svg,
      }));
    },
    workspaceStorageKeyword() {
      return this.storageKeyword.substr(this.config.workspace_change_word.length).trim();
    },

    iconMap() {
      console.log('getIcon:iconMap');
      let a = new Date().getTime();

      let ss = this.list.map((item, index) => {
        return this.getIcon(item.tabs[0].icon, item.tabs[0].url, this.currentThemeConfig.item_height*3/5);
      })
      let b = new Date().getTime();
      console.log('getIcon:iconMap', (b-a)/1000);

      return ss;
    },
    highlightMap() {
      console.log('===========================hh')

      let a = new Date().getTime();

      // 速度非常非常快，无需再缓存优化
      // 这种实现方式非常简单，而且改造方便，并且兼容所有可能情况，如修改标题
      let highlightMap = new Array(this.list.length);
      this.list.forEach((item, index) => {
        highlightMap[ index ] = this.highlight(item.name, this.storageKeyword, '<strong>', '</strong>');
      });

      let b = new Date().getTime();

      console.log('===h', (b-a)/1000);

      return highlightMap;
    },

    currentWindowId() {
      console.log('get_current_window_id', this.currentWindow, this.currentWindow.id)
      return this.currentWindow.id;
    },
    currentWindowStorageIndex() {
      // 判断是否存在在当前分组
      console.log('get_currentWindowStorageIndex', this.storageList, this.currentWindowId)
      if(this.currentWindowId == undefined) return -1;
console.log('get_currentWindowStorageIndex2');

      // 这个非常高效（找到第一个就停止遍历
      let index = this.storageList.findIndex((group) => {
        // console.log('a')
        return group.windowId == this.currentWindowId;
      })
console.log('get_currentWindowStorageIndex3', index);
      return index;
    },
    isInCurrentWindow() {
      console.log('get_isInCurrentWindow', this.currentWindowStorageIndex)
      return this.currentWindowStorageIndex != -1;
    },
    isCurrentWindowChange() {
      console.log('get_isCurrentWindowChange', this.currentWindowStorageIndex)
      if(this.currentWindowStorageIndex == -1) return false;

      console.log('get_isCurrentWindowChange2', this.currentWindowStorageIndex, this.isDifference(
        this.storageList[ this.currentWindowStorageIndex ],
        this.currentWindow
      ))
      return this.isDifference(
        this.storageList[ this.currentWindowStorageIndex ],
        this.currentWindow
      );
    },
    haveDifference() {
      return this.isDifference(this.oldGroup, this.currentWindow);
    },
    currentGroup() {
      console.log('get_currentGroup', this.list, this.list[ this.currentIndex ])
      if(this.list.length <= 0 || this.currentIndex >= this.list.length) return null;
      return this.list[ this.currentIndex ];
    },
    currentStorageIndex() {
      console.log('get_currentStorageIndex', this.currentGroup)
      // let group = this.list[ this.currentIndex ];
      return this.storageList.findIndex(group => {
        return group.id == this.currentGroup.id;
      });
      // for(let i in this.storageList) {
      //   if(this.storageList[i].id == this.currentGroup.id) {
      //     console.log('get_currentStorageIndex2', i)
      //     return i;
      //   }
      // }
      // console.log('get_currentStorageIndex3', -1)
      // return -1;
    },
    currentTab() {
      console.log('get_currentTab', this.currentWindow.tabs)

      for(let tab of this.currentWindow.tabs) {
        if(tab.active == true) {
          console.log('get_currentTab2', tab)
          return tab;
        }
      }

      console.log('get_currentTab3', {})
      return {};
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'window';
    }
  },
  methods: {
    itemStyle({ index, item, isActive, isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
      if(item.windowId == this.currentWindowId) {
        if(isSelected) {
          return {
            'background-color': this.currentThemeConfig.list_current_focus_background_color,
            'color': this.currentThemeConfig.list_current_focus_font_color,
            '--list-highlight-color': this.currentThemeConfig.list_current_focus_highlight_color,
            '--list-highlight-weight': this.currentThemeConfig.list_current_focus_highlight_weight,
            '--list-explain-highlight-color': this.currentThemeConfig.list_current_explain_focus_highlight_color,
            '--list-explain-highlight-weight': this.currentThemeConfig.list_current_explain_focus_highlight_weight,
          }
        } else {
          return {
            'background-color': this.currentThemeConfig.list_current_background_color,
            'color': this.currentThemeConfig.list_current_font_color,
            '--list-highlight-color': this.currentThemeConfig.list_current_highlight_color,
            '--list-highlight-weight': this.currentThemeConfig.list_current_highlight_weight,
            '--list-explain-highlight-color': this.currentThemeConfig.list_current_explain_highlight_color,
            '--list-explain-highlight-weight': this.currentThemeConfig.list_current_explain_highlight_weight,
          }
        }
      } else {
        if(isSelected) {
          return {
            'background-color': this.currentThemeConfig.list_focus_background_color,
            'color': this.currentThemeConfig.list_focus_font_color,
            '--list-highlight-color': this.currentThemeConfig.list_focus_highlight_color,
            '--list-highlight-weight': this.currentThemeConfig.list_focus_highlight_weight,
            '--list-explain-highlight-color': this.currentThemeConfig.list_explain_focus_highlight_color,
            '--list-explain-highlight-weight': this.currentThemeConfig.list_explain_focus_highlight_weight,
          }
        } else {
          return {
            'background-color': this.currentThemeConfig.list_background_color,
            'color': this.currentThemeConfig.list_font_color,
            '--list-highlight-color': this.currentThemeConfig.list_highlight_color,
            '--list-highlight-weight': this.currentThemeConfig.list_highlight_weight,
            '--list-explain-highlight-color': this.currentThemeConfig.list_explain_highlight_color,
            '--list-explain-highlight-weight': this.currentThemeConfig.list_explain_highlight_weight,
          }
        }
      }
    },

    up(keyType) {
      if(keyType == 'meta/ctrl') {
        // 无操作
      } else {
        this.currentIndex--;
      }
    },
    down(keyType) {
      if(keyType == 'meta/ctrl') {
        // 这个操作和鼠标点击或者直接回车是差不多的，区别是 keyType 会被强制为默认的
        this._openWindow('');
      } else {
        this.currentIndex++;
      }
    },
    copy() {
      console.log('copy', this.currentGroup)

      if(this.currentGroup == null) return;

      // 工作区切换
      if(this.workspaceSwitch) return

      let urls = this.currentGroup.tabs.reduce((accumulator, group, index) => {
        if(index == 0) return group.url;
        else return accumulator+"\n"+group.url;
      }, '');
      console.log('copy2', urls, urls == '')
      if(urls == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: urls,
        count: this.currentGroup.tabs.length,
      })
    },

    search(keyword) {
      console.log('window.search', keyword, '|', this.storageKeyword, '|', this.scrollDisabled );
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword != keyword.trim()) {
          this.storageKeyword = keyword.trim();
        } else if( ! this.isFirstSearch) {
          return;
        }
      }
console.log('window.search2', keyword, '|',  this.storageKeyword, '|', this.scrollDisabled );

      // 展示工作区
      if(this.workspaceSwitch) {
        this.showWorkspaceList();
        return;
      }

      // 查找
      let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
      // 注意这里关键词为空就不会去循环，所以优化效果可能不大
      let filterList = this.storageKeyword == '' ? this.storageList : this.storageList.filter(group => {
        let name = group.name.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return name.indexOf(keyword) == -1;
        });
      })

      // 重新排序
      let currentList = filterList.filter(group => {
        return group.windowId == this.currentWindowId;
      });
      let openedList = filterList.filter(group => {
        return this.activeWindows[group.windowId] && group.windowId != this.currentWindowId;
      });
      let closeList = filterList.filter(group => {
        return ! this.activeWindows[group.windowId];
      });

      // 列表赋值
      this.cacheList = currentList; this.cacheList.push(...openedList, ...closeList);
      this.list = this.cacheList.slice(0, this.listPageCount);
      this.scrollDisabled = this.list.length <= 0 || this.list.length >= this.cacheList.length;
      if(this.isFirstSearch && this.list.length > 1 && this.list[0].windowId == this.currentWindowId) {
        this.currentIndex = 1;
        if(this.isSearched) this.$nextTick(() => this.$refs.list.currentTo(1));
      } else {
        this.currentIndex = this.list.length > 0 ? 0 : -1;
      }
      this.isFirstSearch = false;

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
      console.log('window.searchEnd')
    },
    showWorkspaceList() {
      let keyword = this.workspaceStorageKeyword.toUpperCase().split(/\s+/)[0];
      let filterList =  this.workspaceList.filter( workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 );

      // 搜不到则展示全部工作区
      let keywords = filterList.length > 0
                    ? this.workspaceStorageKeyword.split(/\s+/).slice(1).join(' ')
                    : this.workspaceStorageKeyword.split(/\s+/).join(' ');
      filterList = filterList.length > 0 ? filterList : this.workspaceList

      // 列表赋值
      this.list = filterList.map((workspace) => {
        workspace.tip = keywords == '' ? '' : `Search ${workspace.type} for '<strong>${keywords.escape()}</strong>'`;
        return workspace;
      })

      this.scrollDisabled = true;
      this.currentIndex = 0;
      this.isFirstSearch = false;
    },
    load() {
      console.log('window.load', this.scrollDisabled, this.list.length, this.cacheList.length, this.itemShowCount, this.listPageCount)
      // 加载数据
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.listPageCount))
      this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    add(callback, keyword) {
      if( ! this.isFinish) return;
      if(this.isOperating) return;
      this.isOperating = true;

      this.$prompt('', '添加'+(this.isInCurrentWindow ? '（重复）' : ''), {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入窗口名',
        customClass: 'window-message-box',
        inputValue: keyword.trim() == '' ? null : keyword.trim(),
        inputValidator: ( value ) => {
          value = value == null ? '' : value.trim();

          // 窗口名不允许为空
          if(value == '') {
            return this.lang('emptyGroupName');
          }

          // 窗口名不允许重复
          for(let group of this.storageList) {
            if(group.name == value) {
              return this.lang('groupNameRepeat');
            }
          }

          return true;
        }
      }).then(({ value }) => {
        value = value.trim();

        new Promise((resolve, reject) => {
          // 获取当前窗口的所有标签
          chrome.windows.getCurrent({populate: true}, window => {
            if(window.tabs.some(tab => ! tab.url && ! tab.pendingUrl)) {
              reject();
              return;
            }

            // 重新获取，因为有些网页可能还未加载完
            resolve(window);
          })
        }).then((window) => {
          // 如果是已保存过并已打开（即当前窗口），则先解除当前窗口
          if(this.isInCurrentWindow) {
            // // 当前窗口肯定排在第一
            // this.storageList[0].windowId = -1;

            // 当前窗口不一定排第一，因为导入功能
            this.storageList[ this.currentWindowStorageIndex ].windowId = -1;
          }

          // 添加数据并绑定窗口id
          this.storageList.unshift({
            id: nanoid(),
            name: value,
            windowId: window.id,
            lastVisitTime: new Date().getTime(),
            tabs: window.tabs.map((tab) => {
              // 去除末尾 /
              tab.url = tab.url == '' && tab.pendingUrl
                      ? tab.pendingUrl.replace(/(\/*$)/g,"")
                      : tab.url.replace(/(\/*$)/g,"");

              return {
                icon: tab.favIconUrl,
                // url: tab.url == "" ? tab.pendingUrl : tab.url,
                url: tab.url,
                title: tab.title,
              };
            }),
          });
          return window;
        }).then((window) => {
          // 保存数据
          return new Promise((resolve) => {
            chrome.storage.local.set({list: this.storageList}, () => {
              resolve(window)
            });
          })
        }).then((window) => {
          // 更新结果
          this.currentWindow = window;

          // 这样列表才会被触发更新，不能为 undefined，否则会报错，不自动选择第二项
          this.storageKeyword = ' ';

          // 调用方会自动调用 search，不用我们处理
          // this.search();
          callback(true);
          this.isOperating = false;

          // 虽然有了默认数据，但是用户有可能把数据全清了，这个依然有用
          if(this.storageList.length == 1) {
            this.$message({
              type: 'success',
              message: this.lang('windowFirstAdd'),
              customClass: 'window-message-box',
              offset: 69,
              duration: 5000,
            });
          }

          this.statusTip('窗口添加成功');

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'window', operation: 'add'});
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '部分网页还未加载，请稍后重试',
            customClass: 'window-message-box',
            offset: 69,
            duration: 5000,
          });
          this.isOperating = false;
        })
      }).catch(() => {
        callback(false);
        this.isOperating = false;
      });
    },
    openWindow(index, keyType) {
      if(index == undefined) {
        this._openWindow(keyType);
        return;
      }

      if( ! this.$refs.list.choice(index)) {
        return;
      }

      this._openWindow(keyType);
    },
    _openWindow(keyType) {
      console.log('openWindow', keyType)

      if(this.currentGroup == null) return;

      // 工作区切换
      if(this.workspaceSwitch) {
        this.changeWorkspace();
        return;
      }

      // let group = this.list[ this.currentIndex ];
      let urls = this.currentGroup.tabs.map(tab => tab['url']);
      // let index = this.getStorageIndex();

      // 窗口已打开，直接切换
      if(this.activeWindows[this.currentGroup.windowId]) {
        // 更新时间
        this.storageList[ this.currentStorageIndex ].lastVisitTime = new Date().getTime();
        // 排序到最前面
        this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
        // 先存储
        chrome.storage.local.set({list: this.storageList}, () => {
          if(this.currentGroup.windowId == this.currentWindowId) {
            // 如果操作的是当前窗口，则直接关闭插件
            chrome.runtime.sendMessage({ type: 'closeExtension' })
            return;
          }

          // 再切换
          chrome.windows.update(this.currentGroup.windowId, { focused: true});
        });
        return;
      }

      if(keyType == 'meta/ctrl') {
        // 当前窗口打开，且不关闭，也不进行存储更新
        // 不自动关闭空白标签页，有隔离作用
        Promise.all(urls.map((url) => {
          return new Promise((resolve) => {
            chrome.tabs.create({url: url, active: false}, (tab) => {
              resolve(tab.index);
            });
          });
        })).then((/*indexs*/) => {
          // 由于添加了标签变化监听事件，这里已经不需要了
          // if( ! this.isInCurrentWindow) return;

          // // 刷新窗口
          // this.refreshWindows();
        })
      } else if(keyType == 'alt') {
        // 当前窗口打开，且不关闭，也不进行存储更新
        // 会高亮标签
        Promise.all(urls.map((url) => {
          return new Promise((resolve) => {
            chrome.tabs.create({url: url, active: false}, (tab) => {
              resolve(tab);
              // resolve(tab.index);
            });
          });
        })).then((tab) => {
          // chrome.tabs.highlight({tabs: indexs}) // window.open 不兼容
          chrome.tabs.highlight({
            windowId: tab[0].windowId,
            tabs: tab.map(tab => tab.index)
          }, window => {
            chrome.windows.update(window.id, {
              focused: true,
            })
          })
        })
      } else {
        // 直接回车 或 shift 方式打开（panel 只支持一个网页，没法玩）
        //let type = this._device.platform != '' && event.shiftKey ? 'panel' : 'normal';
        let type = 'normal';
        new Promise(resolve => {
          // 新建新窗口（先不激活，否则无法存储数据）
          chrome.windows.create({ url: urls, focused: false, type: type }, window => {
            resolve(window)
          })
        }).then((window) => {
          // 存储数据
          return new Promise(resolve => {
            // 更新时间
            this.storageList[this.currentStorageIndex].lastVisitTime = new Date().getTime();
            // 搬定新的窗口id
            this.storageList[this.currentStorageIndex].windowId = window.id;
            // 排序到最前面
            this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
            chrome.storage.local.set({list: this.storageList}, () => {
              resolve(window);
            });
          })
        }).then((window) => {
          // 激活窗口
          chrome.windows.update(window.id, { focused: true});

          // 关闭空白标签页（是工作窗口则不关闭）
          if( ! this.isInCurrentWindow
          && this.currentTab.url == 'chrome://newtab/') {
            chrome.tabs.remove(this.currentTab.id);
          }
        })
      }
    },
    changeWorkspace() {
      let keywords;
      let keyword = this.workspaceStorageKeyword.toUpperCase().split(/\s+/)[0];
      if(this.workspaceList.some(workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 )) {
        keywords = this.workspaceStorageKeyword.split(/\s+/).slice(1).join(' ');
      } else {
        keywords =  this.workspaceStorageKeyword.split(/\s+/).join(' ');
      }
      this.input(keywords, this.currentGroup.type, true);
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },
    openGroup() {
      // 不直接使用 currentGroup 是因为 this.group 会绑定 dom 元素，那样就会频繁刷新 dom
      this.group = this.currentGroup; //this.list[this.currentIndex];
      this.groupVisible = true;
    },
    changeGroupName() {
      // let index = this.getStorageIndex();
      // this.group = this.list[this.currentIndex];
      this.$prompt('', this.lang('updateGroupName'), {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: this.lang('groupNameInput'),
        inputValue: this.currentGroup.name,
        inputValidator: ( value ) => {
          value = value == null ? '' : value.trim();

          // 窗口名不允许为空
          if(value == '') {
            return this.lang('emptyGroupName');
          }

          // 窗口名不允许重复，自己的不算
          for(let i in this.storageList) {
            if(i != this.currentStorageIndex && this.storageList[i].name == value) {
              return this.lang('groupNameRepeat');
            }
          }

          return true;
        }
      }).then(({ value }) => {
        value = value.trim();

        // 窗口关闭后会自动 foucs，无需这个
        // this.focus();

        // 未修改则不更新
        if(this.storageList[ this.currentStorageIndex ].name == value) {
          return;
        }

        // 存储数据
        this.storageList[ this.currentStorageIndex ].name = value;
        chrome.storage.local.set({list: this.storageList}, () => {
          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'window', operation: 'change'});
        });
      }).catch(() => {
        // 窗口关闭后会自动 foucs，无需这个
        // this.focus();
      });
    },
    deleteGroup() {
      // let group = this.list[this.currentIndex];
      this.$confirm(' ('+this.currentGroup.name+') ', this.lang('deleteConfirm'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
        customClass: 'window-message-box'
      }).then(() => {
        // let index = this.getStorageIndex();
        this.storageList.splice(this.currentStorageIndex , 1);
        chrome.storage.local.set({list: this.storageList}, () => {
          this.cacheList.splice(this.currentIndex, 1);
          this.list.splice(this.currentIndex, 1);

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'window', operation: 'delete'});
        });
        // 窗口关闭后会自动 foucs，无需这个
        // this.focus();
      }).catch(() => {
        // 窗口关闭后会自动 foucs，无需这个
        // this.focus();
      });
    },
    addCompareEvent() {
      let leftNode = document.querySelector('.window-difference .compare .left .group-list');
      let rightNode = document.querySelector('.window-difference .compare .right .group-list');

      leftNode.addEventListener('scroll',() => {
        rightNode.scrollTop = leftNode.scrollTop;
        rightNode.scrollLeft = leftNode.scrollLeft;
      });
      rightNode.addEventListener('scroll',() => {
        leftNode.scrollTop = rightNode.scrollTop;
        leftNode.scrollLeft = rightNode.scrollLeft;
      });
    },
    showDifference() {
      // 不直接使用 currentGroup 是因为 this.oldGroup 会绑定 dom 元素，那样就会频繁刷新 dom
      // 不和 this.group 取相同的值也是为了避免不必要的 dom 刷新
      this.oldGroup = this.currentGroup; // this.list[this.currentIndex];

      // 获取当前窗口
      this.refreshWindows();
      // chrome.windows.getCurrent({populate: true}, window => {
      //   console.log(window)
      //   // 重新获取，因为有些网页可能还未加载完
      //   this.currentWindow = window;
      //   // this.haveDifference = this.isDifference(this.oldGroup, window);
      // })

      this.differenceVisible = true;

      this.$nextTick(() => {
        // autofocus 只在页面一开始加载的时候有效，只能用这种方式了
        document.querySelector('.el-button.autofocus').focus();
      })
    },
    updateGroup() {
      // 更新数据
      // let index = this.getStorageIndex();
      this.storageList[this.currentStorageIndex].windowId = this.currentWindowId;
      this.storageList[this.currentStorageIndex].lastVisitTime = new Date().getTime();
      this.storageList[this.currentStorageIndex].tabs = this.currentWindow.tabs.map(tab => {
        return {
          url: tab.url || tab.pendingUrl,
          title: tab.title,
          icon: tab.favIconUrl,
        };
      })

      // 排到最前面
      this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);

      // 存储数据
      chrome.storage.local.set({list: this.storageList}, () => {
        // this.isCurrentWindowChange = false;

        // 更新结果（强制绑定需要这个，current update 可以不用）
        this.activeWindows[this.currentWindowId] = true;
        // this.isInCurrentWindow = true;

        // 强制刷新，不会自动选择第二项
        this.search();

        // 关闭 dialog
        this.differenceVisible = false;


        this.statusTip('窗口更新成功');

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'window', operation: 'update'});
      })
    },
    bind() {
      // 更新数据
      // let index = this.getStorageIndex();
      this.storageList[this.currentStorageIndex].windowId = this.currentWindowId;
      this.storageList[this.currentStorageIndex].lastVisitTime = new Date().getTime();

      // 排到最前面
      this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);

      // 存储数据
      chrome.storage.local.set({list: this.storageList}, () => {
        // 判断当前分组是否需要更新
        // this.isCurrentWindowChange = this.isDifference(this.storageList[0], this.currentWindow);

        // 更新结果（强制绑定需要这个，current update 可以不用），
        // 强制绑定其实也不需要
        // this.activeWindows[this.currentWindowId] = true;
        // this.isInCurrentWindow = true;

        // 强制刷新，不会自动选择第二项
        this.search();

        // 关闭 dialog
        this.differenceVisible = false;

        this.statusTip('窗口绑定成功');

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'window', operation: 'bind'});
      })
    },
    restore() {
      // let index = this.getStorageIndex();

      // 获取当前标签所在位置
      let currentTabIndex = this.currentTab.index;

      // 获取当前所有标签页
      let currentTabIds = this.currentWindow.tabs.map(tab => {
        return tab.id;
      })
      // 获取旧的标签页地址
      let oldTabUrls = this.oldGroup.tabs.map(tab => {
        return tab.url;
      })

      // 过滤掉当前标签
      currentTabIds.splice(currentTabIndex, 1);
      oldTabUrls.splice(currentTabIndex, 1);
      console.log('ffff', this.currentWindow, this.oldGroup, currentTabIds, oldTabUrls)

      // 数据处理
      let coverTabs = currentTabIds.slice(0, oldTabUrls.length).map((tabId, index) => {
        return {
          tabId: tabId,
          url: oldTabUrls[index],
        }
      });
      let createTabUrls = oldTabUrls.slice(currentTabIds.length);
      let removeTabIds = currentTabIds.slice(oldTabUrls.length);
      console.log('eeeggg', coverTabs, createTabUrls, removeTabIds)

      // 覆盖当前标签页
      coverTabs.forEach(({tabId, url}) => {
        chrome.tabs.update(tabId, {url :url});
      })
      // 新建新的标签页
      createTabUrls.forEach((url) => {
        chrome.tabs.create({url: url, active: false});
      })
      // 关闭闭多余的标签
      chrome.tabs.remove(removeTabIds)

      // 更新时间
      this.storageList[this.currentStorageIndex].lastVisitTime = new Date().getTime();
      // 存储新数据（更新顺序）
      this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
      chrome.storage.local.set({list: this.storageList}, () => {
        console.log('fffffffffffffffffff', this.currentWindow.tabs[currentTabIndex].id, removeTabIds);
        // 处理当前标签
        if(this.oldGroup.tabs[currentTabIndex] == undefined) {
          console.log('a');
          // 移除当前标签
          chrome.tabs.remove(this.currentWindow.tabs[currentTabIndex].id)
        } else {
          console.log('b');
          // 覆盖当前标签
          chrome.tabs.update(this.currentWindow.tabs[currentTabIndex].id, {url :this.oldGroup.tabs[currentTabIndex].url});
        }

        //// 覆盖当前标签
        //// chrome.tabs.remove(removeTabIds)

        // 更新 currentWindow
        this.currentWindow.tabs = this.oldGroup.tabs.map((tab, index) => {
          console.log(index);
          // 只关心这几个值
          return {
            title: tab.title,
            url: tab.url,

            favIconUrl: tab.icon,

            id: this.currentTab.id,
            active: index == this.currentTab.index,
            index: index,
          }
        })
        console.log('change currentWindow', this.currentWindow);

        // 关闭 dialog
        this.differenceVisible = false;

        this.statusTip('窗口已还原');
      });
    },

    isDifference(group, window) {
      if(group.tabs == undefined || window.tabs == undefined) return true;

      // 判断当前分组是否需要更新
      if(group.tabs.length != window.tabs.length) {
        console.log('difference length')
        return true;
      }
      for(let i in group.tabs) {
        let tab = group.tabs[i];
        if(window.tabs[i].status == 'complete'
          && ( tab.url != window.tabs[i].url
            || tab.title != window.tabs[i].title
            || (window.tabs[i].favIconUrl != undefined
              // && window.tabs[i].favIconUrl != ''
              && tab.icon != window.tabs[i].favIconUrl))) {
        console.log('difference 2', tab, window.tabs[i])
          return true;
        }
      }
      return false;
    },
    download() {
      // let group = this.list[this.currentIndex];
      let filename = this.currentGroup.name + '.tabs.html';

      let patt = /^(?!\.)[^\\\/:\*\?"<>\|]{1,250}$/;
      if( ! patt.test(filename)) {
        filename = 'InvalidWindowName.tabs.html';
      }

      chrome.runtime.sendMessage({
        type: 'download',
        filename: filename,
        tabs: this.currentGroup.tabs,
      });
    },
    refreshWindows(showMessage = false) {
      // 获取当前窗口
      chrome.windows.getCurrent({populate: true}, window => {
        window.tabs.forEach((tab) => {
          // 去除末尾 /
          tab.url = tab.url.replace(/(\/*$)/g,"");
          tab.pendingUrl != undefined && (tab.pendingUrl = tab.pendingUrl.replace(/(\/*$)/g,""));
        })
        this.currentWindow = window;
        // this.haveDifference = this.isDifference(this.oldGroup, window);

        if( ! showMessage) return;

        this.$message({
          type: 'success',
          message: '新窗口数据已更新',
          customClass: 'window-message-box',
          offset: 10,
          duration: 2000,
        });
      })

      // 由于只要窗口焦点发生变化，插件就会自动关闭，所以不同去更新其它窗口的信息
    },

    getTip() {
      console.log('showTip');
      if(this.activeWindows[this.currentGroup.windowId]) {
        return '切换到对应的窗口';
      }

      if(this.keyType == 'meta/ctrl') {
        return  '当前窗口打开但不选中';
      } else if(this.keyType == 'alt') {
        return  '当前窗口打开并选中';
      } else if(this.keyType != '') {
        return  '默认新窗口打开';
      } else {
        return  '';
      }
    },
  },

  beforeUpdate() {
    console.warn('window:beforeUpdate');
  },
  updated() {
    console.warn('window:updated');
  },
  mounted() {
    // todo（删除该段代码）
    window.w = this;let a = new Date().getTime();
console.warn('mounted', a);
    // 并行执行，效率更高
    // 其实速度并没有多大提升，因为主要瓶颈在于获取本地数据，另外两个完全可以忽略不计
    // 更大的问题其实是 filter 和 currentWindowStorageIndex
    Promise.all([
      new Promise((resolve) => {
        // 获取本地数据
        chrome.storage.local.get({'list': []}, items => {
          // resolve(items.list)
          this.storageList = items.list;
          let b = new Date().getTime();
          console.warn('获取本地数据', b, (b-a)/1000)
          resolve();
        });
      }),
      // 获取当前窗口（不再 getAll 里拿是因为要加 populate 参数，会获取太多不必要的数据，当然实际测试好像速度没区别）
      new Promise((resolve) => {
        chrome.windows.getCurrent({populate: true}, (window) => {
          window.tabs.forEach((tab) => {
            // 去除末尾 /
            tab.url = tab.url.replace(/(\/*$)/g,"");
            tab.pendingUrl != undefined && (tab.pendingUrl = tab.pendingUrl.replace(/(\/*$)/g,""));
          })
          this.currentWindow = window;
          let b = new Date().getTime();
          console.warn('获取当前窗口', b, (b-a)/1000)
          resolve();
        })
      }),
      // 获取全部窗口
      new Promise((resolve) => {
        // 判断窗口是否已打开
        chrome.windows.getAll({}, (windows) => {
          // resolve(windows);
          // 保存活跃的窗口
          for(let window of windows) {
            this.activeWindows[ window.id ] = true;
          }
          let b = new Date().getTime();
          console.warn('判断窗口是否已打开', b, (b-a)/1000)
          resolve();
        })
      }),
    ]).then((/* res */) => {
      // 本地数据
      // this.storageList = res[0];

      // 当前窗口
      // this.currentWindow = res[1];

      // // 保存活跃的窗口
      // for(let window of res[2]) {
      //   this.activeWindows[ window.id ] = true;
      // }

      let b = new Date().getTime();
console.warn('finish', b, (b-a)/1000)

      this.isFinish = true;
      this.$emit('finish');

      // 更新列表
      // this.search();
    })

    // 自动保持窗口信息同步
    // onCreated 触发的更新可能会缺少标题，还是不要了，有手动更新功能，用户可以自己选择
    // chrome.tabs.onCreated.addListener(() => {
    //   clearTimeout(this.w.timer);
    //   this.w.timer = setTimeout(() => {
    //     console.log('window.refreshWindows')
    //     this.refreshWindows();
    //   }, 200);
    // })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if(changeInfo.status != 'complete') return;
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        console.log('window.refreshWindows')
        this.refreshWindows();
      }, 200);
    })
    chrome.tabs.onRemoved.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        console.log('window.refreshWindows')
        this.refreshWindows();
      }, 200);
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list >>> .list-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;

  /* 禁止选择 */
  /* 有了 @mousedown.prevent，不再需要这个了
  /* -moz-user-select:none; */ /*火狐*/
  /* -webkit-user-select:none; */ /*webkit浏览器*/
  /* -ms-user-select:none; */ /*IE10*/
  /* -khtml-user-select:none; */ /*早期浏览器*/
  /* user-select:none; */
}
.list >>> .list-item .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.list >>> .list-item .main {
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
.list >>> .list-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list >>> .list-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.list >>> .list-item .right {
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
/* .window strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
} */
.window .title strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
.window .sub-title strong {
  color: var(--list-explain-highlight-color);
  font-weight: var(--list-explain-highlight-weight);
}

.window .el-badge__content {
  background-color: inherit !important;
  border-color: inherit !important;
}

.window-group .el-dialog__header {
  padding: 16px 53px 0 16px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.window-group .el-dialog__body{
  padding: 10px 10px 10px 10px !important;
}
.window-group .group-list {
  padding: 0;
  margin: 0;
  overflow: overlay;
  font-size: 15px;
}
.window-group .group-list-item {
  padding: 5px;
  align-items: center;
  color: black;
  list-style: none;
  display: flex;
}
.window-group .tab-name{
  font-size:14px;
  margin-left: 10px;
  cursor: pointer;
  flex: 1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color: #4682BE;
}
.window-group .tab-name:hover {
  /* color: #409eff; */
  text-decoration: underline;
  color: #1288ff;
}

.window-difference .el-dialog__header {
  padding: 16px 53px 0 16px !important;
  text-align: left;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.window-difference .el-dialog__body{
  padding: 10px 10px 10px 10px !important;
}
.window-difference .el-dialog__footer{
  padding: 0px 10px 10px 10px !important;
}
.window-difference .compare .left,
.window-difference .compare .right {
  display: inline-block;
  padding: 0 5px;
  width: 50%;
  box-sizing: border-box;
  border: 1px solid #EBEEF5;
}
.window-difference .compare .left {
  color: hsl(0, 0%, 66%);
  border-radius: 2px 0 0 2px;
}
.window-difference .compare .right {
  /* color: black; */
  border-radius: 0px 2px 2px 0;
  border-left: 0;
}
.compare .right {
  border-left: 0;
}
.window-difference .group-list {
  padding: 0 0 10px 0;
  margin: 0;
  overflow: overlay;
  font-size: 15px;
}
.window-difference .group-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent;
}
.window-difference .group-list::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgba(127, 127, 127, .6);
}
.window-difference .group-list::-webkit-scrollbar-thumb:hover {
  border-radius: 5px;
  background-color: rgba(127, 127, 127, .9);;
}
/* 滚动槽 */
/* .window-difference .group-list::-webkit-scrollbar-track {
  box-shadow:inset 0 0 6px rgba(0,0,0,0.3);
  border-radius:10px;
} */
/* 边角 */
.window-difference .group-list::-webkit-scrollbar-corner  {
  background: transparent;
}
.window-difference .group-list-item {
  padding: 5px;
  align-items: center;
  color: black;
  list-style: none;
  display: flex;
}
.window-difference .el-image{
  flex: none;
}
.window-difference .tab-name{
  font-size:14px;
  margin-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  flex: 1;
  color: #606266;

  white-space:nowrap;

  /* overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap; */
}
.window-difference .tab-name:hover {
  text-decoration: underline;
  color: black;
}
.window-difference .compare .left .tab-name{
  color: hsl(0, 0%, 66%);
}
.window-difference .compare .left .tab-name:hover {
  color: #606266;
}
</style>