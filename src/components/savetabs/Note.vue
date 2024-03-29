<template>
  <div class="note">

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
          <div v-if="storageList.length > 0">{{ lang('noResultTip') }}</div>
          <div>{{ lang('noteCountTip').replace('[total]', storageList.length) }}</div>
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
        <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }"
          v-html="isSelected || storageKeyword != ''
                ? (highlightMap[index].title || highlightMap[index].url)
                : (beautifyTitle(item.title) || getDomain(item.url))"></div>
        <div
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: item.url == currentTab.url
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
        @click.stop>
        <template v-if="isActive
                || activeTabs[item.url]
                || (storageKeyword != '' && item.lastVisitTime != undefined)">
          <div v-if="isActive">
            <div
              v-if="activeTabs[item.url] && activeTabs[item.url].count > 1"
              class="number-button hover"
              @click.stop="input(item.url, 'tab')"
              :style="{
                color: item.url == currentTab.url
                      ? currentThemeConfig.list_current_focus_font_color
                      : currentThemeConfig.list_focus_font_color,
                borderColor: item.url == currentTab.url
                            ? currentThemeConfig.list_current_focus_font_color
                            : currentThemeConfig.list_focus_font_color }">{{ activeTabs[item.url].count }}</div>
            <i
              v-if="activeTabs[item.url]
                && (activeTabs[item.url].count > 1
                  || isRepeat(index))"
              class="el-icon-close close-without-tab hover"
              @click.stop="deleteNote"
              :style="{
                color: item.url == currentTab.url
                      ? currentThemeConfig.list_current_focus_font_color
                      : currentThemeConfig.list_focus_font_color,
                borderColor: item.url == currentTab.url
                            ? currentThemeConfig.list_current_focus_font_color
                            : currentThemeConfig.list_focus_font_color }"></i>
            <i
              v-else
              class="el-icon-close hover"
              @click.stop="deleteNote"
              :style="{
                color: item.url == currentTab.url
                      ? currentThemeConfig.list_current_focus_font_color
                      : currentThemeConfig.list_focus_font_color}"></i>
          </div>
          <div
            v-else-if="item.url == currentTab.url"
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                    ? currentThemeConfig.list_current_focus_state_color
                    : currentThemeConfig.list_current_state_color,
              borderColor: isSelected
                    ? currentThemeConfig.list_current_focus_state_color
                    : currentThemeConfig.list_current_state_color }">
              {{ lang('current') +( activeTabs[item.url].count > 1 ? ' ('+activeTabs[item.url].count+')' : '') }}
          </div>
          <div
            v-else-if="activeTabs[item.url]"
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                  ? currentThemeConfig.list_focus_state_color
                  : currentThemeConfig.list_state_color }">
            {{ lang('opened') + (isSelected && activeTabs[item.url].count > 1 ? ' ('+activeTabs[item.url].count+')' : '') }}
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
        <template v-if=" ! isActive && item.url != currentTab.url">
          <span
            v-if="isSelected"
            :style="{
              fontSize: currentThemeConfig.list_keymap_size+'px',
              color: currentThemeConfig.list_focus_keymap_color }">↩</span>
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
import { nanoid } from 'nanoid'

export default {
  name: 'Note',
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
    note: {
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
      storageList: [],

      scrollDisabled: true,
      storageKeyword: undefined,
      isFirstSearch: true,

      currentIndex: -1,
      currentTab: {},
      activeTabs: {},

      // isInCurrentTab: false,

      isSearched: false,
      isFinish: false,

      tip: '',

      isOperating: false,

      w: {
        timer: null,
      }
    }
  },
  components: {
    List,
  },
  watch: {
    "note.visible": function(/*newVal, oldVal*/) {
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
        let keymap = this.keymap['open_workspace_note']
                    ? ' ('+this.keymap['open_workspace_note']+')'
                    : ''
        this.statusTip('note'+keymap, true, 3000);
      }
    },
  },
  computed: {
    isNoSearch() {
      return this.currentThemeConfig.height_auto
          && this.storageKeyword == ''
          && this.openWay == 'popup'
          && ! this.note.visible;
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
        workspace => workspace != 'note'
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
        return this.getIcon(item.icon, item.url, this.currentThemeConfig.item_height*3/5);
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

    isInCurrentTab() {
      return this.storageList.some((note) => {
        if(note.url == this.currentTab.url) {
          return true;
        }
      })

      // 由于当前窗口会被排在最前面，所以并不需要遍历 storageList
      // 这种观点在一开始是错的，因为此时还没有调用 search，这时会导致重复添加
      // return this.list.length > 0 && this.list[0].url == this.currentTab.url;
    },
    currentNote() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    currentStorageIndex() {
      return this.storageList.findIndex(note => {
        return note.id == this.currentNote.id;
      });
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'note';
    }
  },
  methods: {
    itemStyle({/* index, */ item/*, isActive*/, isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
      if(item.url == this.currentTab.url) {
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
      if(this.currentNote == null) return;

      // 工作区切换
      if(this.workspaceSwitch) return

      let url = this.currentNote.url;
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

      // 查找
      let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
      // 注意这里关键词为空就不会去循环，所以优化效果可能不大
      let filterList = this.storageKeyword == '' ? this.storageList : this.storageList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1 ;
        });
      })

      // 重新排序
      let currentList = filterList.filter(tab => {
        return tab.url == this.currentTab.url;
      });
      let openedList = filterList.filter(tab => {
        return this.activeTabs[tab.url]
            && this.activeTabs[tab.url].url != this.currentTab.url;
      });
      let closeList = filterList.filter(tab => {
        return ! this.activeTabs[tab.url];
      });

      // 列表赋值
      this.cacheList = currentList; this.cacheList.push(...openedList, ...closeList);
      // this.cacheList = currentList.concat(openedList).concat(closeList);
      this.list = this.cacheList.slice(0, this.listPageCount);

      this.scrollDisabled = this.list.length <= 0 || this.list.length >= this.cacheList.length;
      if(this.isFirstSearch && this.list.length > 1 && this.list[0].url == this.currentTab.url) {
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
    add(callback) {
      if( ! this.isFinish) return;
      if(this.isOperating) return;
      this.isOperating = true;

      // 保存过就 取消掉标签
      if(this.isInCurrentTab) {
        // 移除数据
        this.storageList.splice(this.storageList.findIndex(note => {
          return note.url == this.currentTab.url;
        }), 1);

        chrome.storage.local.set({tabs: this.storageList}, () => {
          this.statusTip(this.lang('noteDeleted'), false, 3000);

          // 这样列表才会刷新
          this.isFirstSearch = true;

          callback(true);
          this.isOperating = false;

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'note', operation: 'add'});
        })

        return;
      }

      // // 当前标签只能有一个
      // if(this.isInCurrentTab) {
      //   this.$message({
      //     type: 'warning',
      //     message: this.lang('noteSaved'),
      //     offset: 69,
      //     duration: 2000,
      //     customClass: 'window-message-box',
      //   });
      //   // 返回 true，这样会清空输入框，避免用户的一些困惑更为重要
      //   callback(true);
      //   this.isOperating = false;

      //   return;
      // }

      // 获取当前标签
      // 重新获取，因为网页可能还未加载完
      new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 去除末尾 / （pendingUrl 有可能不存在）
          tabs[0].url = tabs[0].url == '' && tabs[0].pendingUrl
                      ? tabs[0].pendingUrl.replace(/\/+$/g, "")
                      : tabs[0].url.replace(/\/+$/g, "");

          if(tabs[0].url == '') {
            reject();
            return;
          }

          resolve(tabs[0])
        })
      }).then((tab) => {
        // 构造数据
        this.storageList.unshift({
          id: nanoid(),
          title: tab.title,
          url: tab.url,
          icon: tab.favIconUrl,
          lastVisitTime: new Date().getTime(),
        });
        return tab;
      }).then((tab) => {
        // 保存数据
        return new Promise((resolve) => {
          chrome.storage.local.set({tabs: this.storageList}, () => {
            resolve(tab);
          })
        })
      }).then((tab) => {
        // 更新结果
        this.currentTab = tab;
        // // 其实不写也没关系，只是要是 currenTab 真的变了就不好了（测试也容易，因为测试的数据有问题）
        // 不大可能发生，最重要的是这样会导致 number 显示不出来
        // this.activeTabs[ this.currentTab.url ] = tab;

        // 这样列表才会被触发更新，不能为 undefined，否则会报错，不自动选择第二项
        this.storageKeyword = ' ';

        this.statusTip(this.lang('noteAddSuccess'), false, 3000);

        // 由于在添加的时候还顺带着切换，从而导致搜索，这两个是并行的，会有影响
        // 这里放到定时队列里，相当于排最后，避免冲突，会出现损坏的图片
        // 正式环境其实没有问题，因为图片都是可访问的，而且也没那么快
        // setTimeout(()=>{
        //   callback(true)
        // }, 1)
        callback(true);
        this.isOperating = false;

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'note', operation: 'add'});
      }).catch(() => {
        this.$message({
          type: 'error',
          message: this.lang('webRetry'),
          customClass: 'window-message-box',
          offset: 69,
          duration: 3000,
        });
        this.isOperating = false;
      })
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
      if(this.currentNote == null) return;

      // 工作区切换
      if(this.workspaceSwitch) {
        this.changeWorkspace();
        return;
      }

      // 更新时间
      this.storageList[this.currentStorageIndex].lastVisitTime = new Date().getTime();

      // 标签已打开，直接切换
      if(this.activeTabs[this.currentNote.url]) {
        // 存储新数据（排序发生变化）
        this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
        // 先存储，再切换
        chrome.storage.local.set({tabs: this.storageList}, () => {
          if(this.currentNote.url == this.currentTab.url) {
            // 如果操作的是当前便签，则直接关闭插件
            chrome.runtime.sendMessage({ type: 'closeExtension' })
            return;
          }

          // 先激活标签，再切换窗口
          chrome.tabs.update(this.activeTabs[this.currentNote.url].id, { active: true }, () => {
            chrome.windows.update(this.activeTabs[this.currentNote.url].windowId, { focused: true});
          });
        });
        return;
      }

      // 存储
      this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
      chrome.storage.local.set({tabs: this.storageList}, () => {
        this.$open(this.currentNote.url, keyType, (tab, type) => {
          // 去除末尾 /
          tab.url = tab.url == '' && tab.pendingUrl
                  ? tab.pendingUrl.replace(/\/+$/g, "")
                  : tab.url.replace(/\/+$/g, "");

          if(type == 'cover') {
            if(this.activeTabs[ this.currentTab.url ].count > 1) {
              this.activeTabs[ this.currentTab.url ].count--;
              let t = this.activeTabs[ this.currentTab.url ].other.splice(0, 1);
              this.activeTabs[ this.currentTab.url ].id = t[0];
            } else {
              delete this.activeTabs[ this.currentTab.url ];
            }

            this.currentTab = tab;
            this.activeTabs[ this.currentTab.url ] = tab;
          } else {
            tab.count = 1;
            tab.other = [];
            this.activeTabs[ tab.url ] = tab;
          }

          // 列表刷洗交给监听事件吧
          // // 这样才会自动选择第二项
          // this.isFirstSearch = true;
          // this.search();
        });
      });
    },
    changeWorkspace() {
      let keywords;
      let keyword = this.workspaceStorageKeyword.toUpperCase().split(/\s+/)[0];
      if(this.workspaceList.some(workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 )) {
        keywords = this.workspaceStorageKeyword.split(/\s+/).slice(1).join(' ');
      } else {
        keywords =  this.workspaceStorageKeyword.split(/\s+/).join(' ');
      }
      this.input(keywords, this.currentNote.type, true);
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },
    deleteNote() {
      // 移除数据
      this.storageList.splice(this.currentStorageIndex , 1);
      chrome.storage.local.set({tabs: this.storageList}, () => {
        if( ! this.activeTabs[this.currentNote.url]) {
        } else if(this.activeTabs[this.currentNote.url].count > 1) {
          // 存在多个网页则不关闭网页
        } else if(this.getCacheUrlCount(this.currentNote.url) > 1) {
          // 存储了多个相同的网页也不自动关闭标签，直到只剩下一个

        }else {
          // 如果删除的是已经打开的便签，则顺带把对应的标签页给关闭了
          chrome.tabs.remove(this.activeTabs[this.currentNote.url].id);
        }

        // 移除，不重新search，体验不好
        this.list.splice(this.currentIndex, 1);
        this.cacheList.splice(this.currentIndex, 1);

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'note', operation: 'delete'});
      })
    },

    isRepeat(index) {
      if(this.cacheList[index].url == this.currentTab.url) {
        // 当前窗口只需比较附近即可
        if(index > 0) {
          if(this.cacheList[index-1].url == this.cacheList[index].url)
            return true;
        }
        if(index+1 < this.cacheList.length) {
          if(this.cacheList[index+1].url == this.cacheList[index].url)
            return true;
        }
      } else {
        // 非当前窗口需要遍历所有 opened 窗口
        for(let i in this.cacheList) {
          let tab = this.cacheList[i];
          if(i == index) continue;
          if( ! this.activeTabs[tab.url]) {
            return false;
          } else {
            if(tab.url == this.cacheList[index].url) {
              return true;
            }
          }
        }
      }
      return false;
    },
    getCacheUrlCount(url) {
      return this.cacheList.reduce((accumulator, tab) => {
        return accumulator+(tab.url == url ? 1 : 0);
      }, 0)
    },

    refreshTabs() {
      Promise.all([
        // 获取当前标签
        new Promise((resolve) => {
          chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            // 去除末尾 / （pendingUrl 有可能不存在）
            tabs[0].url = tabs[0].url == '' && tabs[0].pendingUrl
                        ? tabs[0].pendingUrl.replace(/\/+$/g, "")
                        : tabs[0].url.replace(/\/+$/g, "");
            this.currentTab = tabs[0];
            resolve()
          })
        }),
        // 获取全部标签
        new Promise((resolve) => {
          chrome.tabs.query({}, tabs => {
            this.activeTabs = {};
            for(let tab of tabs) {
              // 去除末尾 /
              tab.url = tab.url == '' && tab.pendingUrl
                      ? tab.pendingUrl.replace(/\/+$/g, "")
                      : tab.url.replace(/\/+$/g, "");
              if(this.activeTabs[ tab.url ] == undefined) {
                tab.count = 1;
                tab.other = [];
                this.activeTabs[ tab.url ] = tab;
              } else {
                this.activeTabs[ tab.url ].count++;
                this.activeTabs[ tab.url ].other.push(tab.id);
              }
            }
            resolve()
          })
        })
      ]).then(() => {
        // 这样才会自动选择第二项
        this.isFirstSearch = true;
        // 当前工作区是本工作区则刷新列表，否则记录一下
        if(this.isActiveWorkspace) this.search();
      })
    },
    getTip() {
      if(this.activeTabs[this.currentNote.url]) {
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
  },
  // beforeUpdate() {
  //   console.warn('note:beforeUpdate');
  // },
  // updated() {
  //   console.warn('note:updated');
  // },
  mounted() {
    Promise.all([
      new Promise((resolve) => {
        // 获取本地数据
        chrome.storage.local.get({tabs: []}, items => {
          this.storageList = items.tabs.map((tab) => {
            // 兼容旧版（旧版没有自动去除末尾 /）
            tab.url = tab.url.replace(/\/+$/g, "");
            // 去除旧版一些没用的数据
            delete tab.tabId;
            delete tab.windowId;

            return tab;
          });
          resolve()
        });
      }),
      // 获取当前标签
      new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 去除末尾 / （pendingUrl 有可能不存在）
          tabs[0].url = tabs[0].url == '' && tabs[0].pendingUrl
                      ? tabs[0].pendingUrl.replace(/\/+$/g, "")
                      : tabs[0].url.replace(/\/+$/g, "");
          this.currentTab = tabs[0];
          resolve()
        })
      }),
      // 获取全部标签
      new Promise((resolve) => {
        chrome.tabs.query({}, tabs => {
          for(let tab of tabs) {
            // 去除末尾 /
            tab.url = tab.url == '' && tab.pendingUrl
                    ? tab.pendingUrl.replace(/\/+$/g, "")
                    : tab.url.replace(/\/+$/g, "");
            if(this.activeTabs[ tab.url ] == undefined) {
              tab.count = 1;
              tab.other = [];
              this.activeTabs[ tab.url ] = tab;
            } else {
              this.activeTabs[ tab.url ].count++;
              this.activeTabs[ tab.url ].other.push(tab.id);
            }
          }
          resolve()
        })
      })
    ]).then(() => {
      this.isFinish = true;
      this.$emit('finish');
    })

    // 自动保持窗口信息同步
    // 便签只需要知道标签状态，不需要其详细详细，所以 onUpdated 并不需要
    // 网页被覆盖 onCreated 或 onRemoved 是不会被触发的，所以 openWindow 要自己处理
    // 再加上 timer ，openWindow 自己可以防止重复点击
    chrome.tabs.onCreated.addListener((/*tab*/) => {
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs();
      }, 200);
    })
    // chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    //   if(changeInfo.status != 'complete') return;
    //   clearTimeout(this.w.timer);
    //   this.w.timer = setTimeout(() => {
    //     this.refreshTabs();
    //   }, 200);
    // })
    chrome.tabs.onRemoved.addListener(() => {
      // 这个无法像 tab 那样直接移除，因为涉及到太多东西，并不是简单的删除，如同样的标签只是数据减少，但并没有为 0
      clearTimeout(this.w.timer);
      this.w.timer = setTimeout(() => {
        this.refreshTabs();
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

.list >>> .list-item .right .number-button {
  min-width: 10px;
  height: 20px;
  padding: 2px 7px;
  font-size: 18px;
  line-height: 20px;
  border: 2px solid white;
  border-radius: 20px;
  margin-right: 15px;
  text-align: center;
  white-space: nowrap;
  display: inline-block;
  cursor: pointer;
}
.list >>> .list-item .right .close-without-tab {
  min-width: 20px;
  height: 20px;
  font-size: 18px !important;
  font-weight: 800;
  padding: 2px;
  border:2px solid white;
  border-radius: 20px;
  text-align: center;
  cursor: pointer;
}
.list >>> .list-item .right .close-without-tab:before {
  position: relative;
  top: 1px;
}
.list >>> .list-item .right .el-icon-close {
  margin-right: 2px;
  font-size: 20px;
  cursor: pointer;
}
/* 解决 direction: rtl造成的问题是特殊符号结尾会显示在文本的最左边。 */
.list >>> .list-item .main .sub-title:after {
  content: "\200E‎";
}
</style>

<style>
.note .el-alert .el-alert__content {
  flex: 1;
}

.note .title strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
.note .sub-title strong {
  color: var(--list-explain-highlight-color);
  font-weight: var(--list-explain-highlight-weight);
}
</style>