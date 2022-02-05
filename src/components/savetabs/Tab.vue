<template>
  <div class="tab">

  <div
    v-if="isSearched && list.length == 0"
    style="margin: 0 10px;">
    <el-alert
      type="info"
      :closable="false"
      show-icon>
      <div
        slot="title"
        style="display:flex;align-items: center;font-size:12px;">
        <div style="flex:1;">
          <div>{{ lang('tabNoResult') }}</div>
          <div>{{ lang('tabCountTip').replace('[total]', originList.length) }}</div>
        </div>
        <div style="margin-left: 8px;margin-right: -8px;">
          <el-button circle size="mini" icon="el-icon-coffee-cup" @click="$open('./options.html?type=workspace#/other-support', getKeyType($event))" :title="lang('rewardAuthor')"></el-button>
          <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open(projectConfig.webStore[$platform].reviews, getKeyType($event))" :title="lang('giveGoodComment')"></el-button>
          <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=workspace#/workspace-general', getKeyType($event))" :title="lang('gotoSetting')"></el-button>
        </div>
      </div>
    </el-alert>
  </div>

  <list
    :list="list"
    :listLength="list.length"
    :itemHeight="currentThemeConfig.item_height"
    :itemShowCount="itemShowCount || 1"
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
      <span
        class="left"
        :style="{
          width: currentThemeConfig.item_height+'px',
          padding: (currentThemeConfig.item_height*1/5)+'px' }">
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
          <div slot="placeholder"></div>
        </el-image>
      </span>

      <div class="main">
        <!-- <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="highlightMap[index].title || highlightMap[index].url"></div> -->
        <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="isSelected || storageKeyword != ''
                ? (highlightMap[index].title || highlightMap[index].url)
                : (beautifyTitle(item.title) || getDomain(item.url))"></div>
          <!-- v-if="isSelected || storageKeyword != ''" -->
        <div
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: item.id == activeTabId
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
                  ? highlightMap[index].url
                  : (isSelected ? item.url : getDomain(item.url)) )"></div>
      </div>

      <div
        class="right"
        :style="{ paddingLeft: isActive ? '5px' : '10px' }"
        @click.stop>
        <div v-if="isActive">
          <i
            v-if="storageKeyword != getDomain(item.url)"
            class="el-icon-more hover"
            @click.stop="input( getDomain(item.url) )"
            :style="{
              color: item.id == activeTabId
                    ? currentThemeConfig.list_current_focus_font_color
                    : currentThemeConfig.list_focus_font_color}"></i>
          <i
            class="el-icon-close hover"
            @click.stop="closeTab"
            :style="{
              color: item.id == activeTabId
                    ? currentThemeConfig.list_current_focus_font_color
                    : currentThemeConfig.list_focus_font_color}"></i>
        </div>
        <template v-else-if="item.id == activeTabId">
          <span
            :style="{
                fontSize: currentThemeConfig.list_state_size+'px',
                color: isSelected
                      ? currentThemeConfig.list_current_focus_state_color
                      : currentThemeConfig.list_current_state_color,
                borderColor: isSelected
                      ? currentThemeConfig.list_current_focus_state_color
                      : currentThemeConfig.list_current_state_color }">{{ lang('current') }}</span>
        </template>
        <template v-else>
          <span
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                ? currentThemeConfig.list_focus_state_color
                : currentThemeConfig.list_state_color }">{{
                item.windowId == currentWindowId
              ? lang('current')
              : ( windowRank[item.windowId] == undefined
                ? lang('opened')
                : lang('win').replace(/^\S/, s => s.toUpperCase())+windowRank[item.windowId] )
            }}</span>
        </template>
        <!-- <template v-else> -->
        <template v-if=" ! isActive && item.id != activeTabId">
          <span
            v-if="isSelected"
            :style="{
              fontSize: currentThemeConfig.list_keymap_size+'px',
              color: currentThemeConfig.list_focus_keymap_color,
            }">↩</span>
          <span
            v-else-if="_device.platform != ''"
            :style="{
              fontSize: currentThemeConfig.list_keymap_size+'px',
              color: currentThemeConfig.item_show_count > 9 && index-$refs.list.scrollLines+1 > 9
                    ? 'transparent'
                    : currentThemeConfig.list_keymap_color }">
            <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt') }}</font>
            <!-- index-$refs.list.scrollLines+1 < 1 -->
            <font
              style="display:inline-block;text-align:left;"
              :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }"
              >{{ index-$refs.list.scrollLines+1 &lt; 1
                ? 1
                : Math.min(index-$refs.list.scrollLines+1, currentThemeConfig.item_show_count, 9) }}</font>
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
          v-html="toHighlight(item.name, storageKeyword.substr(config.workspace_change_word.length).trim().split(/\s+/)[0], '<strong>', '</strong>')"></div>
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
          v-else-if="_device.platform != ''"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.item_show_count > 9 && index-$refs.list.scrollLines+1 > 9
                  ? 'transparent'
                  : currentThemeConfig.list_keymap_color }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt') }}</font>
          <!-- index-$refs.list.scrollLines+1 < 1 -->
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }"
            >{{ index-$refs.list.scrollLines+1 &lt; 1
              ? 1
              : Math.min(index-$refs.list.scrollLines+1, currentThemeConfig.item_show_count, 9) }}</font>
        </span>
      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from '../common/List.vue'

export default {
  name: 'Tab',
  inject: ['input', 'statusTip'],
  props: {
    config: {
      type: Object,
      required: true,
    },
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
    tab: {
      type: Object,
      required: false,
      default: function() {
        return {}
      },
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
    keymap: {
      type: Object,
      required: false,
      default: function() {
        return {};
      },
    },
  },
  data() {
    return {
      list: [],
      cacheList: [],
      originList: [],
      focusList: [],

      scrollDisabled: true,
      storageKeyword: undefined,
      isFirstSearch: true,

      currentIndex: -1,

      isSearched: false,

      activeTab: null,
      windowIds: [],
      // windowRank: {},

      w: {
        timer: null,
      }
    }
  },
  components: {
    List,
  },
  watch: {
    "tab.visible": function(newVal/*, oldVal*/) {
      this.search();

      if(newVal == false) return;

      let windowFilter = this.windowIds.map((windowId, index) => {
        return [
          windowId == this.currentWindowId ? 0 : windowId,
          windowId == this.currentWindowId
          ? this.lang('current')
          : this.lang('win')+(index+1)
        ];
      })

      if(this.originList.some(tab => this.windowRank[tab.windowId] == undefined)) {
        windowFilter.push([-2, this.lang('opened')]);
      }

      this.tab.windowFilter = windowFilter;
    },
    "windowIds": function(/*newVal, oldVal*/) {
      if(this.tab.visible == false) return;

      let windowFilter = this.windowIds.map((windowId, index) => {
        return [
          windowId == this.currentWindowId ? 0 : windowId,
          windowId == this.currentWindowId
          ? this.lang('current')
          : this.lang('win')+(index+1)
        ];
      })
      if(this.originList.some(tab => this.windowRank[tab.windowId] == undefined)) {
        windowFilter.push([-2, this.lang('opened')]);
      }

      this.tab.windowFilter = windowFilter;
    },
    "tab.windowId": function(/*newVal, oldVal*/) {
      this.search();
    },

    cacheList(newVal/*, oldVal*/) {
      this.$emit('update:searchTotal', newVal.length)
    },
    list(newVal/*, oldVal*/) {
      this.$emit('update:listCount', newVal.length)
    },

    workspaceSwitch(newVal/*, oldVal*/) {
      if(newVal) {
        let keymap = this.keymap['open_workspace_tab']
                    ? ' ('+this.keymap['open_workspace_tab']+')'
                    : ''
        this.statusTip('tab'+keymap, true, 3000);
      }
    },
  },
  computed: {
    isNoSearch() {
      return this.currentThemeConfig.height_auto
          && this.storageKeyword == ''
          && this.openWay == 'popup'
          && ! this.tab.visible;
    },
    listPageCount() {
      if(this.itemShowCount <= 0) return 0;

      return this.isNoSearch
            ? this.currentThemeConfig.no_search_list_page_count
            : this.currentThemeConfig.list_page_count
    },
    itemShowCount() {
      return this.isNoSearch
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
        workspace => workspace != 'tab'
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
      return this.list.map((item/*, index*/) => {
        return this.getIcon(item.favIconUrl, item.url, this.currentThemeConfig.item_height*3/5);
        // return this.getIcon('', item.url, this.currentThemeConfig.item_height*3/5);
      })
    },
    highlightMap() {
      // 速度非常非常快，无需再缓存优化
      // 这种实现方式非常简单，而且改造方便，并且兼容所有可能情况，如修改标题
      let highlightMap = new Array(this.list.length);
      this.list.forEach((item, index) => {
        highlightMap[ index ] = {
          title: this.toHighlight(item.title, this.storageKeyword, '<strong>', '</strong>'),
          url: this.toHighlight(item.url, this.storageKeyword, '<strong>', '</strong>'),
        }
      });

      return highlightMap;
    },

    selectedTabId() {
      return this.selectedTab.id;
    },
    selectedTab() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    selectedOriginIndex() {
      return this.originList.findIndex(tab => {
        return tab.id == this.selectedTabId;
      });
    },

    activeTabId() {
      return this.activeTab.id;
    },
    currentWindowId() {
      return this.activeTab.windowId;
    },

    // currentTabList() {
    //   return this.originList.filter((tab) => {
    //     return tab.windowId == this.currentWindowId;
    //   })
    // }

    windowRank() {
      return this.windowIds.reduce((accumulator, windowId, index) => {
        accumulator[windowId] = index+1;
        return accumulator;
      }, {})
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'tab';
    }
  },
  methods: {
    itemStyle({/* index,*/ item, /*isActive, */isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
      if(item.id == this.activeTabId) {
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
      if(this.selectedTab == null) return;

      // 工作区切换
      if(this.workspaceSwitch) return

      let url = this.selectedTab.url;
      if(url == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: url,
        count: 1,
      })
    },

    search(keyword) {
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword != keyword.trim()) {
          this.storageKeyword = keyword.trim();
        } else if( ! this.isFirstSearch) {
          return;
        }
      }

      // 展示工作区
      if(this.workspaceSwitch) {
        this.showWorkspaceList();
        return;
      }

      let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
      let filterList = this.focusList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1 ;
        }) && ( // 过滤窗口
          ! this.tab.visible // 选择框未打开不过滤（为 !false = true）
          || this.tab.windowId == -1 // 未选择也不过滤
          || ( this.tab.windowId == 0
            && tab.windowId == this.currentWindowId) // Current
          || ( this.tab.windowId == -2
            && tab.windowId != this.currentWindowId
            && this.windowRank[tab.windowId] == undefined) // Opened
          || ( tab.windowId == this.tab.windowId
            && this.windowRank[tab.windowId] != undefined) // 过滤窗口
        )
      })

      // 列表赋值
      this.cacheList = filterList;
      this.list = this.cacheList.slice(0, this.listPageCount);

      this.scrollDisabled = this.list.length <= 0 || this.list.length >= this.cacheList.length;
      if(this.isFirstSearch && this.list.length > 1 && this.list[0].id == this.activeTabId) {
        this.currentIndex = 1;
        if(this.isSearched) this.$nextTick(() => this.$refs.list.currentTo(1));
      } else {
        this.currentIndex = this.list.length > 0 ? 0 : -1;
      }
      this.isFirstSearch = false;

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
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
      // 加载数据
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.listPageCount))
      this.scrollDisabled = this.list.length >= this.cacheList.length;
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
      if(this.selectedTab == null) return;

      // 工作区切换
      if(this.workspaceSwitch) {
        this.changeWorkspace();
        return;
      }

      if(keyType == 'meta/ctrl') {
        // 移动到当前标签的下一个位置，但不激活
        chrome.tabs.move(this.selectedTabId, {windowId: this.currentWindowId, index: this.activeTab.index+1}, (/*tab*/) => {
          // 位置一旦变动，很多 tab 的 index 都会发生改变，仅仅靠下面这个是完全不够的
          // Object.assign(this.selectedTab, tab);
          // 只需更新数据，无需重新 search
          // 这里列表被覆盖了，局部更新还是很麻烦的，还是选择整个更新好了
          // this.refreshTabs();

          // 改用事件监听了
          // 延迟一下，chrome.windows.onRemoved 执行会慢一点点
          // clearTimeout(this.w.timer);
          // this.w.timer = setTimeout(() => {
          //   this.refreshTabs(() => {
          //       // 这样才会自动选择第二项
          //       this.isFirstSearch = true;
          //       // 当前工作区是本工作区则刷新列表，否则记录一下
          //       if(this.isActiveWorkspace) this.search();
          //   });
          // }, 200);
        });
      } else if(keyType == 'shift') {
        // 移动到新窗口（新建窗口）
        chrome.windows.create({tabId: this.selectedTabId, focused: true});
      } else if(keyType == 'alt') {
        // 交换两个标签的位置，激活被选中的标签

        // 让后台帮忙交换，因为这个极有可能导致弹框关闭，进而导致操作突然终止
        chrome.runtime.sendMessage({
            type: 'exchangeTab',
            target: this.activeTab,
            destination: this.selectedTab
        })
      } else {
        // 当前窗口则直接关闭，因为 inject 不会像 popup 那样自动关闭
        if(this.selectedTabId == this.activeTabId) {
          chrome.runtime.sendMessage({
            type: 'closeExtension',
          })
          return;
        }

        // 切换到对应的标签，不做任何移动（默认方式）
        chrome.tabs.update(this.selectedTabId, { active: true }, () => {
          chrome.windows.update(this.selectedTab.windowId, { focused: true}, () => {
            // 会有专门的事件处理，这里返回回导致插件重启
            // chrome.runtime.sendMessage({
            //   type: 'closeExtension',
            // })
          });
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
      this.input(keywords, this.selectedTab.type, true);
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },
    closeTab() {
      // 这个必须放外面，防止 onRemove 先执行而刷新列表
      this.originList.splice(this.selectedOriginIndex, 1);
      chrome.tabs.remove(this.selectedTabId, () => {
        // 防止重复点击产生错误
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);
      })
    },

    refreshTabs(callback) {
      // 查找
      Promise.all([
        new Promise((resolve) => {
          // 获取标签顺序
          chrome.runtime.sendMessage({
              type: 'getActiveTabIds'
          }, (tabIds) => {
            resolve(tabIds);
          })
        }),
        new Promise((resolve) => {
          // 获取窗口顺序
          chrome.runtime.sendMessage({
              type: 'getActiveWindowIds'
          }, (windowIds) => {
            windowIds.reverse()
            // this.windowIds = windowIds;
            resolve(windowIds);
          })
        }),
        new Promise(resolve => {
          // 获取所有标签
          chrome.tabs.query({}, (tabs)=>{
            let t = tabs.map((tab) => {
              // 去除末尾 /
              tab.url = tab.url == '' && tab.pendingUrl
                      ? tab.pendingUrl.replace(/\/+$/g, "")
                      : tab.url.replace(/\/+$/g, "");
              return tab;
            });
            resolve(t);
          })
        }),
        new Promise(resolve => {
          // 获取当前标签
          chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            this.activeTab = tabs[0];
            resolve()
          })
        })
      ]).then(([tabIds, windowIds, tabs]) => {
        // 记录窗口顺序
        // this.windowRank = {};
        // windowIds.forEach((windowId, index) => this.windowRank[windowId]=index+1);

        // this.windowRank = windowIds.reduce((accumulator, windowId, index) => {
        //   accumulator[windowId] = index+1;
        //   return accumulator;
        // }, {})

        // 建立索引，方便快速获取 tab 位置
        let map = new Map();
        tabIds.forEach((tabId, index) => {
          map.set(tabId, index)
        })

        // 当前窗口排最前面
        map.set(this.activeTabId, map.size);

        // 按标签顺序排序，没有记录的排最后
        this.originList = tabs.sort((tab1, tab2) => {
          // // 当前窗口排最前面
          // if(tab1.id == this.activeTabId) return -1;
          // if(tab2.id == this.activeTabId) return 1;

          let index1 = map.get(tab1.id);
          let index2 = map.get(tab2.id);

          if(index1 == undefined && index2 == undefined) return 0;
          if(index1 == undefined) return 1;
          if(index2 == undefined) return -1;

          return index2 - index1;
        })

        this.focusList = this.originList;

        // 相关依赖需要用到 originList，所以得放在最后更新
        this.windowIds = windowIds;

        callback != undefined && callback();
      })
    },
    getTip() {
      if(this.keyType == 'meta/ctrl') {
        return this.lang('moveToRight');
      } else if(this.keyType == 'shift') {
        return this.lang('moveToNewWindow');
      } else if(this.keyType == 'alt') {
        return this.lang('swapWithCurrentTab');
      } else if(this.keyType != '') {
        return this.lang('switchTab');
      } else {
        return '';
      }
    },
  },
  mounted() {
    this.refreshTabs(() => {
      this.$emit('finish');

      // 更新列表
      // this.search();
    })

    // 自动保持窗口信息同步
    // 不像 note 或 window，tab 不需要本地存储，其逻辑和一开始初始化完全相同
    // onCreated 是为了能够及时其它工作区所导致的标签变化
    // onUpdated 是为了能完美显示标签信息
    // 窗口移动窗口的状态发生改变，也需要进行监听
    chrome.tabs.onCreated.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs(() => {
          // 这样才会自动选择第二项
          this.isFirstSearch = true;
          // 当前工作区是本工作区则刷新列表，否则记录一下
          if(this.isActiveWorkspace) this.search();
        });
      }, 200);
    })
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if(changeInfo.status != 'complete') return;

      // 非搜索条件下可以直接更新，无需刷新列表，提升用户体验
      if(this.storageKeyword == '') {
        let t = this.originList.find(t => t.id == tab.id);
        if(t == undefined) return; // 有可能标签更新过快，此时列表还未完全刷新，这里直接忽略

        Object.assign(t, tab);

        return;
      }

      // 在搜索条件下，必须刷新列表
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs(() => {
          // 这样才会自动选择第二项
          this.isFirstSearch = true;
          // 当前工作区是本工作区则刷新列表，否则记录一下
          if(this.isActiveWorkspace) this.search();
        });
      }, 200);
    })
    chrome.tabs.onRemoved.addListener((tabId) => {
      let originIndex = this.originList.findIndex(tab => tab.id == tabId);

      // 被移除的标签本来就不存在，则不需要刷新列表，提升用户体验
      if(originIndex == -1) return;

      // 直接移除，无需刷新列表，提升用户体验
      this.originList.splice(originIndex, 1);
      let index = this.cacheList.findIndex(tab => tab.id == tabId);
      if(index != -1) {
        this.cacheList.splice(index, 1);
        this.list.splice(index, 1);
      }

      // clearTimeout(this.w.timer);
      // this.w.timer = setTimeout(() => {
      //   this.refreshTabs(() => {
      //     // 这样才会自动选择第二项
      //     this.isFirstSearch = true;
      //     // 当前工作区是本工作区则刷新列表，否则记录一下
      //     if(this.isActiveWorkspace) this.search();
      //   });
      // }, 200);
    })
    chrome.tabs.onMoved.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs(() => {
          // 这样才会自动选择第二项
          this.isFirstSearch = true;
          // 当前工作区是本工作区则刷新列表，否则记录一下
          if(this.isActiveWorkspace) this.search();
        });
      }, 200);
    })
    chrome.tabs.onDetached.addListener(() => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs(() => {
          // 这样才会自动选择第二项
          this.isFirstSearch = true;
          // 当前工作区是本工作区则刷新列表，否则记录一下
          if(this.isActiveWorkspace) this.search();
        });
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
}
.list >>> .list-item  .left {
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
.list >>> .list-item .right .el-icon-more {
  margin-right: 11px;
  padding: 5px;
  font-size: 20px;
  cursor:pointer;
}
.list >>> .list-item .right .el-icon-close {
  margin-right: 2px;
  font-size: 20px;
  cursor:pointer;
}
/* 解决 direction: rtl造成的问题是特殊符号结尾会显示在文本的最左边。 */
.list >>> .list-item .main .sub-title:after {
  content: "\200E‎";
}
</style>
<style>
.tab .el-alert .el-alert__content {
  flex: 1;
}

.tab .title strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
.tab .sub-title strong {
  color: var(--list-explain-highlight-color);
  font-weight: var(--list-explain-highlight-weight);
}
</style>