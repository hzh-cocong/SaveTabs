<template>
  <div class="history">

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
          <div>{{ lang('historyNoResult') }}</div>
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
          padding: (currentThemeConfig.item_height*1/5)+'px',
          marginLeft: item.count == undefined
                    ? currentThemeConfig.item_height*1/5+'px'
                    : 0 }">
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
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }">
          <i
            v-if="item.count != undefined && item.count > 1"
            style="margin-right: 10px;"
            :class="{ 'el-icon-circle-plus-outline' : item.subFiles.length > 0,
                        'el-icon-remove-outline' : item.subFiles.length <= 0,  }"></i>
          <span v-html="highlightMap[index].title || highlightMap[index].url"></span>
        </div> -->
        <div
          class="title"
          :style="{ fontSize: currentThemeConfig.list_font_size+'px' }">
          <i
            v-if="item.count != undefined && item.count > 1"
            style="margin-right: 10px;"
            :class="{ 'el-icon-circle-plus-outline' : item.subFiles.length > 0,
                        'el-icon-remove-outline' : item.subFiles.length <= 0,  }"></i>
          <span v-html="isSelected || storageKeyword != ''
                      ? (highlightMap[index].title || highlightMap[index].url)
                      : (beautifyTitle(highlightMap[index].title) || getDomain(highlightMap[index].url))"></span>
        </div>
        <div
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: isSelected
                  ? currentThemeConfig.list_explain_focus_font_color
                  : currentThemeConfig.list_explain_font_color,
            direction: isSelected ? 'rtl' : 'ltr' }"
            v-html="isSelected && keyType != ''
                  ? getTip()
                  : ( item.count == undefined || item.count == 1
                    ? (isSelected || storageKeyword != ''
                      ? highlightMap[index].url
                      : getDomain(item.count == undefined ? item.url : item.subFiles[0].url))
                    : (highlightMap[index].domain+' | '+item.count) )"></div>
      </div>

      <div
        class="right"
        :style="{ paddingLeft: isActive ? '5px' : '10px' }"
        @click.stop>
        <div v-if="isActive">
          <i
            v-if="storageKeyword != getDomain(item.count == undefined
                                            ? item.url
                                            : (
                                                item.subFiles.length > 0
                                              ? item.subFiles[0].url
                                              : list[index+1].url
                                            ))"
            class="el-icon-more hover"
            @click.stop="input(
                          getDomain(
                            item.count == undefined
                            ? item.url
                            : (
                                item.subFiles.length > 0
                              ? item.subFiles[0].url
                              : list[index+1].url
                            )
                          ))"
            :style="{
              color:currentThemeConfig.list_focus_font_color}"></i>
          <i
            class="el-icon-close hover"
            @click.stop="deleteHistory"
            :style="{
              color:currentThemeConfig.list_focus_font_color}"></i>
        </div>
        <template v-else>
          <span
            :style="{
              fontSize: currentThemeConfig.list_state_size+'px',
              color: isSelected
                ? currentThemeConfig.list_focus_state_color
                : currentThemeConfig.list_state_color,
            }">{{
              timeShow(
                item.count == undefined
              ? item.lastVisitTime
              : (
                  item.subFiles.length > 0
                ? item.subFiles[0].lastVisitTime
                : list[index+1].lastVisitTime
              ))
            }}</span>
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

  <el-dialog
    :visible.sync="dialogVisible"
    :append-to-body="true"
    class="history-dialog"
    width="420px"
    :title="lang('clearBrowsingData')"
    @opened="$nextTick(() => { $refs.clearButton.$el.focus() })"
    @close="focus">
    <el-select
      v-model="range"
      style="width: 100%;"
      @change="$nextTick(() => { $refs.clearButton.$el.focus() })"
      ref="select">
      <el-option :value="3600000" :label="this.lang('lastHour')"></el-option>
      <el-option :value="86400000" :label="this.lang('lastTwentyFourHours')"></el-option>
      <el-option :value="604800000" :label="this.lang('lastSevenDays')"></el-option>
      <el-option :value="2419200000" :label="this.lang('lastFourDays')"></el-option>
      <el-option :value="-1" :label="this.lang('allTime')"></el-option>
    </el-select>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">{{ lang('cancel') }}</el-button>
      <el-button type="primary" @click="clearRecent" ref="clearButton">{{ lang('sure') }}</el-button>
    </span>
  </el-dialog>

  </div>
</template>

<script>
import List from '../common/List.vue'

export default {
  name: 'History',
  inject: ['focus', 'input', 'statusTip'],
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
    history: {
      type: Object,
      required: false,
      default: function() {
        return {
          date: null,
        }
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

      scrollDisabled: true,
      queryDisabled: false, // true
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,

      lastVisitTime: null, // new Date().getTime(),
      lastEndTime: null,
      // startTime: 0,
      endTime: 0,

      range: 3600000,
      dialogVisible: false,

      w: {
        times: 0,
      },
    }
  },
  components: {
    List,
  },
  watch: {
    "history.date": function(/*newVal, oldVal*/) {
      this.search();
    },
    "history.visible": function(/*newVal, oldVal*/) {
      this.search();
    },
    "history.isDel": function(/*newVal, oldVal*/) {
      if( ! this.history.isDel) return;

      if(this.history.date == null) {
        this.dialogVisible = true;
        this.history.isDel = false;
      } else {
        // search 虽然会改变它，但是有可能这里会先执行，所以这里也执行一遍，避免搞错
        this.endTime = this.history.date.getTime()+86400000-1000;

        this.deleteRange(this.startTime, this.endTime, () => {
          this.lastEndTime = null; // 这样列表才能刷新
          this.search();
          this.history.isDel = false;
          // 删除按钮有可能在 input 非 foucs 时按下，那么 $confirm 关闭后 input 当然不会获得 focus，这里矫正一下
          this.focus();

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        });
      }
    },

    // cacheList(newVal, oldVal) {
    //   this.$emit('update:searchTotal', newVal.length)
    // },
    list(newVal/*, oldVal*/) {
      this.$emit('update:listCount', newVal.length)
    },

    workspaceSwitch(newVal/*, oldVal*/) {
      if(newVal) {
        let keymap = this.keymap['open_workspace_history']
                    ? ' ('+this.keymap['open_workspace_history']+')'
                    : ''
        this.statusTip('history'+keymap, true, 3000);
      }
    },
  },
  computed: {
    isNoSearch() {
      return this.currentThemeConfig.height_auto
          && this.storageKeyword == ''
          && this.openWay == 'popup'
          && ! this.history.visible;
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
        workspace => workspace != 'history'
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
      return this.list.map((item, index) => {
        return this.getIcon('', item.count == undefined
                              ? item.url
                              : (
                                  item.subFiles.length > 0
                                ? item.subFiles[0].url
                                : this.list[index+1].url
                              ), this.currentThemeConfig.item_height*3/5);
      })
    },
    highlightMap() {
      // 速度非常非常快，无需再缓存优化
      // 这种实现方式非常简单，而且改造方便，并且兼容所有可能情况，如修改标题
      let highlightMap = new Array(this.list.length);
      this.list.forEach((item, index) => {
        let url = item.count == undefined
                ? item.url
                : (
                    item.subFiles.length > 0
                  ? item.subFiles[0].url
                  : this.list[index+1].url
                );
        let title = item.count == undefined
                  ? item.title
                  : (
                      item.subFiles.length > 0
                    ? item.subFiles[0].title
                    : this.list[index+1].title
                  );
        highlightMap[ index ] = {
          title: this.toHighlight(title, this.storageKeyword, '<strong>', '</strong>'),
          url: this.toHighlight(url, this.storageKeyword, '<strong>', '</strong>'),
          domain: this.toHighlight(this.getDomain(url), this.storageKeyword, '<strong>', '</strong>'),
        }
      });

      return highlightMap;
    },

    // 这个会导致搜索时最新的搜不到，因为 new Date().getTime() 并非双向绑定
    // endTime() {
    //   if(this.history.date == null || ! this.history.visible) {
    //     // return null;
    //     return new Date().getTime();
    //   } else {
    //     return this.history.date.getTime()+86400000-1000;
    //   }
    // },
    startTime() {
      if(this.history.date == null ||  ! this.history.visible) {
        return 0;
      } else {
        return this.history.date.getTime();
      }
    },

    // list() {
    //   return this.cacheList.slice(0, this.page*this.listPageCount);
    //   // this.list.concat(this.list.length, this.list.length+this.listPageCount);
    // },
    currentHistory() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    currentFolderIndex() {
      // 从当前位置网上寻找父亲
      let k = this.currentIndex;
      while(this.list[ k ].count == undefined) k--;
      return k;
    },
    currentFolder() {
      // 从当前位置寻找父亲
      return this.list[ this.currentFolderIndex ];
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'temporary';
    }
  },
  methods: {
    itemStyle({/* index, item, isActive, */isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
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
    },

    up(keyType) {
      if(keyType == 'meta/ctrl') {
        if(this.workspaceSwitch) return;
        if(this.currentHistory == null) return;

        // 只收起文件夹
        if(this.currentHistory.count == 1) {
          // 根文件，无法收起
        } else if(this.currentHistory.count == undefined) {
          // 找到父文件并收起
          for(let i = this.currentIndex-1; i >= 0; i--) {
            if(this.list[i].count == undefined) continue;

            this.currentIndex = i;
            this._openWindow('');

            break;
          }
        } else if(this.currentHistory.subFiles.length <= 0) {
          this._openWindow('');
        } else {
          // 文件夹已收起
        }
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
      if(this.currentHistory == null) return;

      // 工作区切换
      if(this.workspaceSwitch) return

      let urls='';
      // let count = 0;
      if(this.currentHistory.count == undefined) {
        urls = this.currentHistory.url;
        // count = 0;
      } else if(this.currentHistory.count == 1) {
        urls = this.currentHistory.subFiles[0].url;
        // count = 0;
      } else if(this.currentHistory.subFiles.length > 0) { // 未展开
        urls = this.currentHistory.subFiles.reduce((accumulator, history, index) => {
          if(index == 0) return history.url;
          else return accumulator+"\n"+history.url;
        }, '');
        // count = this.currentHistory.subFiles.length;
      } else { // 已展开
        for(let i = this.currentIndex+1; i <= this.currentIndex+this.currentHistory.count; i++) {
          if(i == this.currentIndex+1) {
            urls = this.list[i].url;
          } else {
            urls += "\n"+this.list[i].url;
          }
        }
        // count = this.this.currentHistory.count;
      }

      if(urls == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: urls,
        count: this.currentHistory.count == undefined ? 1 : this.currentHistory.count,
      })
    },

    search(keyword) {
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword == keyword.trim()) return;
        this.storageKeyword = keyword.trim();
      }

      if(this.listPageCount <= 0) {
        this.cacheList = [];
        this.list = [];
        this.scrollDisabled = true;
        // this.queryDisabled = true;
        return;
      }

      if(this.history.date == null || ! this.history.visible) {
        this.endTime = new Date().getTime();
      } else {
        this.endTime = this.history.date.getTime()+86400000-1000;
      }

      if(keyword == undefined && this.lastEndTime == this.endTime) return;

      // 展示工作区
      if(this.workspaceSwitch) {
        this.showWorkspaceList();
        return;
      }

      let times = ++this.w.times;

      this.lastEndTime = this.endTime;
      let lastVisitTime = this.endTime;

      // 默认只展示 24 小时内的数据（体验不好）
      // this.startTime = this.storageKeyword == '' ?  new Date().getTime()-86400000 : 0;

      // 反正历史记录就不太对，不如将错就错
      // this.startTime = 0;

      // 提高健壮性，虽然没什么用
      // this.scrollDisabled = true;
      // this.queryDisabled = true;

      // 查找历史
      this.query((historys) => {
        // 防止并发错误
        if(times != this.w.times) return;

        if(historys.length == 0) {
          this.cacheList = [];
          this.list = [];

          this.currentIndex = -1;
          this.scrollDisabled = true;
          this.queryDisabled = true;

          // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
          this.isSearched = true;

          return;
        }

        this.cacheList = [];
        this.mergeHistory(this.cacheList, historys);

        this.list = this.cacheList.slice(0, this.listPageCount);

        this.currentIndex = 0;

        // query 并不精确，有可能这次只返回一条，下次却返回10条
        this.scrollDisabled = false;
        this.queryDisabled = false;

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      }, lastVisitTime, 27)
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
    },
    load() {
      // 避免出现死循环（并发时会出现）
      if(this.listPageCount <= 0) return;

      let end = this.list.length+this.listPageCount;

      if(this.cacheList.length >= end) {
        // 性能最高
        this.list.push(...this.cacheList.slice(this.list.length, end));
        return;
      }

      if(this.queryDisabled) {
        if(this.list.length >= this.cacheList.length) return; // 避免引起不必要的计算
        this.list.push(...this.cacheList.slice(this.list.length, end))
        this.scrollDisabled = true;
        return;
      }

      // 查找历史
      this.scrollDisabled = true;
      this.query((historys) => {
        if(historys.length == 0) {
          if(this.list.length < this.cacheList.length) { // 避免引起不必要的计算
            this.list.push(...this.cacheList.slice(this.list.length, end))
          }

          this.scrollDisabled = true;
          this.queryDisabled = true;

          // 结果只有一条时自动展开
          if(this.cacheList.length == 1 && this.cacheList[0].count > 1) {
            let historys = this.cacheList[0].subFiles.splice(0, this.cacheList[0].count);

            this.cacheList.push(...historys);
            this.list.push(...historys);

            this.currentIndex = 1;

            // 不加这个，目录可能会被隐藏，即自动向上滚动了一行
            this.$nextTick(() => {
              this.$refs.list.currentTo(1);
            });
          }

          return;
        }

        this.mergeHistory(this.cacheList, historys);
        this.list.push(...this.cacheList.slice(this.list.length, end));
        this.scrollDisabled = false;
      })

      // 不使用预加载，因为预加载过快，dom 反而会因此等待
    },
    query(callback, lastVisitTime, max=55) {
      max = max < this.listPageCount ? this.listPageCount : max;

      // 防止并发问题
      lastVisitTime = lastVisitTime == undefined ? this.lastVisitTime : lastVisitTime;

      // 查找
      chrome.history.search({
        text: this.storageKeyword,
        startTime: this.startTime,
        endTime: lastVisitTime,
        maxResults: max, // this.listPageCount, 每次尽可能查多一点，这样就可以大大减少错误结果
      }, (historys)=>{
        // 谷歌提供的接口返回的结果过有时候会是错误的，排序出问题容易被看出，所以我们要自己给它重新排一下
        historys = historys.sort((a, b)=>{
          return b.lastVisitTime-a.lastVisitTime;
        });

        // 这个比较特殊，这里处理结果会更准确
        // 其实当过滤完了没数据后，已经没得救了，所以还是交给别人处理吧
        // this.scrollDisabled = historys.length < max;

        if(historys.length == 0) {
          callback([]);
          return;
          // return [];
        }

        // 谷歌可能返回超出时间范围的结果，很容易被看出，这里我们给它过滤一下
        historys = historys.filter((history) => {
          // 会导致该历史无法删除，所以注释掉
          // 去除末尾 /
          // history.url = history.url.replace(/\/+$/g, "");

          return history.lastVisitTime < lastVisitTime;
        })

        // 过滤
        if(historys.length == 0) {
          // 糟糕，被过滤完了
          // this.lastVisitTime = this.lastVisitTime-1000*1;
          callback([]);
          return;
        }

        this.lastVisitTime = Math.floor(historys[historys.length-1].lastVisitTime)-1;

        callback(historys);
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
      if(this.currentHistory == null) return;

      // 工作区切换
      if(this.workspaceSwitch) {
        this.changeWorkspace();
        return;
      }

      if(this.currentHistory.count == undefined || this.currentHistory.count == 1) {
        // 打开新标签
        let url = this.currentHistory.count == undefined
                ? this.currentHistory.url
                : this.currentHistory.subFiles[0].url
        this.$open(url, keyType);
        return;
      }

      // 展开或收起目录
      if(this.currentHistory.subFiles.length > 0) {
        // 展开
        // let historys = this.currentHistory.subFiles.splice(0, this.currentHistory.count);
        let historys = this.currentHistory.subFiles;
        this.cacheList.splice(this.currentIndex+1, 0, ...historys);
        this.list.splice(this.currentIndex+1, 0, ...historys);
        this.currentHistory.subFiles = [];

        // 由于 currentIndex List 组件通过 $emit 调用触发的，虽然对于父组件 currentIndex 的更新是实时的，但是对于其依赖（即子组件的 currentIndex），则是被放到异步队列中执行的，因此此时子组件的 currentIndex 值依然是旧的
        this.$nextTick(() => {
          if(this.$refs.list.visiualIndex+this.currentHistory.count+1 > this.currentThemeConfig.item_show_count) {
            let index = this.currentThemeConfig.item_show_count-this.currentHistory.count-1;
            // index = index < 0 ? 0 : index;
            this.$refs.list.currentTo(index);
          }
          // this.$refs.list.currentToTop();
        })
      } else {
        // 收起
        this.cacheList.splice(this.currentIndex+1, this.currentHistory.count);
        this.currentHistory.subFiles = this.list.splice(this.currentIndex+1, this.currentHistory.count);
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
      this.input(keywords, this.currentHistory.type, true);
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },
    deleteHistory() {
      // 删除单独一条历史记录
      if(this.currentHistory.count == 1) {
        chrome.history.deleteUrl({ url: this.currentHistory.subFiles[0].url }, () => {
          this.cacheList.splice(this.currentIndex, 1);
          this.list.splice(this.currentIndex, 1);

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        })
        return;
      }

      // 删除文件夹内的某条历史记录（肯定展开了）
      if(this.currentHistory.count == undefined) {
        chrome.history.deleteUrl({ url: this.currentHistory.url }, () => {
          if(this.currentFolder.count-1 == 1) {
            // 收起文件夹
            let index = this.currentFolderIndex+1 == this.currentIndex
                      ? this.currentFolderIndex+2  // 删除第一条
                      : this.currentFolderIndex+1; // 删除最后一条
            // 先收起
            this.currentFolder.subFiles = this.list.slice(index, index+1);
            this.currentFolder.count--;
            // 再全部移除
            this.cacheList.splice(this.currentFolderIndex+1, 2);
            this.list.splice(this.currentFolderIndex+1, 2);
          } else {
            this.currentFolder.count--;
            this.cacheList.splice(this.currentIndex, 1);
            this.list.splice(this.currentIndex, 1);
          }

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        })

        return;
      }

      // 删除整个文件夹（未展开）
      if(this.currentHistory.count != undefined && this.currentHistory.subFiles.length != 0) {
        Promise.all(this.currentHistory.subFiles.map((history) => {
          return new Promise(resolve => {
            chrome.history.deleteUrl({ url: history.url }, () => {
              resolve()
            })
          })
        })).then(() => {
          this.cacheList.splice(this.currentIndex, 1);
          this.list.splice(this.currentIndex, 1);

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        });

        return;
      }

      // 删除整个文件夹（已展开）
      if(this.currentHistory.count != undefined && this.currentHistory.subFiles.length == 0) {
        let historys = this.list.slice(this.currentIndex+1, this.currentIndex+this.currentHistory.count+1);

        Promise.all(historys.map((history) => {
          return new Promise(resolve => {
            chrome.history.deleteUrl({ url: history.url }, () => {
              resolve()
            })
          })
        })).then(() => {
          this.cacheList.splice(this.currentIndex, this.currentHistory.count+1);
          this.list.splice(this.currentIndex, this.currentHistory.count+1);

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        });

        return;
      }
    },

    mergeHistory(list, historys) {
      let k = list.length-1;
      for(let history of historys) {
        let domain = this.getDomain(history.url);
        let lastDomain = k >= 0
                      ? ( list[k].count == undefined
                        ? this.getDomain(list[k].url)
                        : this.getDomain(list[k].subFiles[0].url))
                      : null;
        if(domain == lastDomain && list[k].count == undefined) {
          // 文件夹展开的情况（一般不会遇到）
          let l = k;
          while(list[ l ].count == undefined) l--;

          list[l].count++;
          list[++k] = history;
        } else if(domain == lastDomain && list[k].count != undefined) {
          // 文件夹未展开
          list[k].subFiles.push(history);
          list[k].count++;
        } else {
          // 新文件夹
          list[++k] = {
            count: 1,
            subFiles: [ history ],
          }
        }
      }
    },

    clearRecent() {
      if(this.range == -1) {
        chrome.history.deleteAll(() => {
          this.search();
          this.dialogVisible = false;

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        })
      } else {
        let endTime = new Date().getTime();
        let startTime = endTime-this.range;

        chrome.history.deleteRange({
          startTime: startTime,
          endTime: endTime,
        }, () => {
          this.search();
          this.dialogVisible = false;

          // 让 all 保持数据同步
          chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'history', operation: 'delete'});
        })
      }
    },

    deleteRange(startTime, endTime, callback) {
      this.$confirm(this.lang('historyDeleteConfirm'), this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true,
        customClass: 'window-message-box'
      }).then(() => {
        chrome.history.deleteRange({
          startTime: startTime,
          endTime: endTime,
        }, callback)
      }).catch(callback);
    },

    getTip() {
      if(this.currentHistory.count == undefined || this.currentHistory.count == 1) {
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

      if(this.currentHistory.subFiles.length > 0) {
        return this.lang('unfold');
      } else {
        return this.lang('fold');
      }
    },
  },
  mounted() {
    this.$emit('finish');

    // 更新列表
    // this.search();
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
.history .el-alert .el-alert__content {
  flex: 1;
}

.history .title strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
.history .sub-title strong {
  color: var(--list-explain-highlight-color);
  font-weight: var(--list-explain-highlight-weight);
}

.history-dialog .el-dialog {
  /* min-width: 80% !important; */
  max-width: 99% !important;
  /* width: 420px; */
}
</style>