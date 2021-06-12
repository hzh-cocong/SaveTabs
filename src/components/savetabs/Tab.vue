<template>
  <div class="tab">

  <el-alert
    type="info"
    :closable="false"
    show-icon
    v-if="isSearched && list.length == 0"
    style="margin: 0 10px;"
    :style="{ width: (config.width-20)+'px' }">
    <div
      slot="title"
      style="display:flex;align-items: center;"
      :style="{ width: (config.width-70)+'px' }">
      <div style="flex:1;">
        <div>{{ lang('tabNoResult') }}</div>
        <div>{{ lang('tabCountTip')+originList.length+lang('tabCountTip2') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise', $event)"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews', $event)"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other', $event)"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :listLength="list.length"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="config.list_scrollbar_color"
    :scrollbarFocusColor="config.list_scrollbar_focus_color"
    :itemStyle="itemStyle"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus"
    @itemClick="_openWindow">
    <template #default="{ index, item, isActive, isSelected }">
      <span
        class="left"
        :style="{
          width: (config.item_height-20)+'px',
          height: (config.item_height-20)+'px' }">
        <el-image
          v-if="isLoad"
          :src="iconMap[index]"
          style="width:100%; height: 100%;"
          fit="cover"
          lazy>
          <div slot="error" class="image-slot">
            <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder" class="image-slot">
            <!-- <img src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
          </div>
        </el-image>
      </span>

      <div class="main">
        <div
          class="title"
          :style="{ fontSize: config.list_font_size+'px' }"
          v-html="highlightMap[index].title"></div>
        <!-- <span
          class="title"
          :style="{ fontSize: config.list_font_size+'px' }">{{
              item.title
          }}</span> -->
        <div
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: item.id == activeTabId
                ? ( isSelected
                  ? config.list_current_explain_focus_font_color
                  : config.list_current_explain_font_color)
                : ( isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color),
            direction: isSelected ? 'rtl' : 'ltr' }"
          v-html="storageKeyword != ''
                ? highlightMap[index].url
                : (isSelected ? item.url : getDomain(item.url))"></div>
        <!-- <div
          v-if="storageKeyword != ''"
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: item.id == activeTabId
                ? ( isSelected
                  ? config.list_current_explain_focus_font_color
                  : config.list_current_explain_font_color)
                : ( isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color),
            direction: isSelected ? 'rtl' : 'ltr' }"
          v-html="highlightMap[index].url"></div>
        <div
          v-else
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: item.id == activeTabId
                ? ( isSelected
                  ? config.list_current_explain_focus_font_color
                  : config.list_current_explain_font_color)
                : ( isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color)}"
          v-text="isSelected ? item.url : getDomain(item.url)"></div> -->
      </div>

      <div class="right">
        <div v-if="isActive">
          <i
            v-if="storageKeyword != getDomain(item.url)"
            class="el-icon-more hover"
            @click.stop="input( getDomain(item.url) )"
            :style="{
              color:config.list_focus_font_color}"></i>
          <i
            class="el-icon-close hover"
            @click.stop="closeTab(index)"
            :style="{
              color:config.list_focus_font_color}"></i>
        </div>
        <template v-else-if="item.id == activeTabId">
          <span
            :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color,
                borderColor: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color }">Current</span>
        </template>
        <template v-else>
          <span
            :style="{
              fontSize: config.list_state_size+'px',
              color: isSelected
                ? config.list_focus_state_color
                : config.list_state_color }">Opened</span>
        </template>
        <!-- <template v-else> -->
        <template v-if=" ! isActive && item.id != activeTabId">
          <span
            v-if="isSelected"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_focus_keymap_color,
            }">↩</span>
          <span
            v-else-if="_device.platform != ''
              && (index-$refs.list.scrollLines+1) <= 9"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_keymap_color,
            }">{{
                (_device.platform == 'Mac' ? '⌘' : 'Alt+')
              + ( 1 > index-$refs.list.scrollLines+1
                ? 1
                : (index-$refs.list.scrollLines+1 > config.item_show_count
                  ? config.item_show_count
                  : index-$refs.list.scrollLines+1)
                )
              }}</span>
        </template>
      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from '../common/List.vue'

export default {
  name: 'Tab',
  inject: ['focus', 'input'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    platform: {
      type: String,
      required: false,
      default: '',
    }
  },
  data() {
    return {
      list: [],
      cacheList: [],
      originList: [],
      focusList: [],

      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,

      activeTab: null,
    }
  },
  components: {
    List,
  },
  computed: {
    iconMap() {
      console.log('getIcon:iconMap');
      let a = new Date().getTime();

      let ss = this.list.map((item, index) => {
        // return this.getIcon(item.favIconUrl, item.url, this.config.item_height-20);
        return this.getIcon('', item.url, this.config.item_height-20);
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
        highlightMap[ index ] = {
          title: this.highlight(item.title, this.storageKeyword, '<strong>', '</strong>'),
          url: this.highlight(item.url, this.storageKeyword, '<strong>', '</strong>'),
        }
      });

      let b = new Date().getTime();

      console.log('===h', (b-a)/1000);

      return highlightMap;
    },

    selectedTabId() {
      return this.selectedTab.id;
    },
    selectedTab() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
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
  },
  methods: {
    itemStyle({ index, item, isActive, isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
      if(item.id == this.activeTabId) {
        if(isSelected) {
          return {
            'background-color': this.config.list_current_focus_background_color,
            'color': this.config.list_current_focus_font_color,
            '--list-highlight-color': this.config.list_current_focus_highlight_color,
            '--list-highlight-weight': this.config.list_current_focus_highlight_weight,
          }
        } else {
          return {
            'background-color': this.config.list_current_background_color,
            'color': this.config.list_current_font_color,
            '--list-highlight-color': this.config.list_current_highlight_color,
            '--list-highlight-weight': this.config.list_current_highlight_weight,
          }
        }
      } else {
        if(isSelected) {
          return {
            'background-color': this.config.list_focus_background_color,
            'color': this.config.list_focus_font_color,
            '--list-highlight-color': this.config.list_focus_highlight_color,
            '--list-highlight-weight': this.config.list_focus_highlight_weight,
          }
        } else {
          return {
            'background-color': this.config.list_background_color,
            'color': this.config.list_font_color,
            '--list-highlight-color': this.config.list_highlight_color,
            '--list-highlight-weight': this.config.list_highlight_weight,
          }
        }
      }
    },

    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },
    search(keyword) {
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;

      let isFirstSearch = this.storageKeyword == undefined;

      this.storageKeyword = keyword.trim();

      let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
      // 注意这里关键词为空就不会去循环，所以优化效果可能不大
      let filterList = this.storageKeyword == '' ? this.focusList : this.focusList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        // 找出不匹配的过滤掉
        return ! keywords.some((keyword) => {
          // 不匹配则为 -1
          return title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1 ;
        });
      })

      // 列表赋值
      this.cacheList = filterList;
      this.list = this.cacheList.slice(0, this.config.list_page_count);

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      if(isFirstSearch && this.list.length > 1) {
        this.currentIndex = 1;
      } else {
        this.currentIndex = this.list.length > 0 ? 0 : -1;
      }

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
    },
    load() {
      // 加载数据
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
      this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    openWindow(index, event) {
      if(index == undefined) {
        this._openWindow(event);
        return;
      }

      if( ! this.$refs.list.choice(index)) {
        return;
      }

      this._openWindow(event);
    },
    _openWindow(event) {
      if(event != undefined
      &&((this._device.platform == 'Mac' && event.metaKey == true)
        || (this._device.platform != '' && event.ctrlKey == true))) {
        // 移动到当前标签的下一个位置，但不激活
        chrome.tabs.move(this.selectedTabId, {windowId: this.currentWindowId, index: this.activeTab.index+1});
      } else if(event != undefined
              && this._device.platform != ''
              && event.shiftKey == true) {
        // 移动到新窗口（新建窗口）
        chrome.windows.create({tabId: this.selectedTabId, focused: true});
      } else if(event != undefined
              && this._device.platform != ''
              && event.altKey == true) {
        // 交换两个标签的位置，激活被选中的标签
        console.log('exchangeTab');

        // 让后台帮忙交换，因为这个极有可能导致弹框关闭，进而导致操作突然终止
        chrome.runtime.sendMessage({
            type: 'exchangeTab',
            target: this.activeTab,
            destination: this.selectedTab
        })
      } else {
        // 切换到对应的标签，不做任何移动（默认方式）
        chrome.tabs.update(this.selectedTabId, { active: true }, () => {
          chrome.windows.update(this.selectedTab.windowId, { focused: true}, () => {
            chrome.runtime.sendMessage({
              type: 'closeExtension',
            })
          });
        })
      }
    },
    closeTab(index) {
      let id = this.list[index].id;
      chrome.tabs.remove(id, () => {
        this.list.splice(index, 1);
        if(this.list.length < this.config.list_page_count
        && this.scrollDisabled == false) {
          this.load();
        }
      })

      this.focus();
    }
  },
  mounted() {
    // todo
    window.tab = this;
console.log('ttttttttttttt')
    // 查找
    Promise.all([
      new Promise((resolve) => {
        // 获取标签顺序
        chrome.runtime.sendMessage({
            type: 'getActiveTabs'
        }, (tabIds) => {
          console.log('tabIds', tabIds)
          console.log('gggggggggg3');
          resolve(tabIds);
        })
      }),
      new Promise(resolve => {
        // 获取所有标签
        chrome.tabs.query({}, (tabs)=>{
          let t = tabs.map((tab) => {
            // 去除末尾 /
            tab.url = tab.url.replace(/(\/*$)/g,"");
            return tab;
          });
          console.log('gggggggggg');
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
    ]).then(([tabIds, tabs]) => {
      console.log('ssssss', tabIds, tabs);

      // 建立索引，方便快速获取 tab 位置
      let map = new Map();
      tabIds.forEach((tabId, index) => {
        map.set(tabId, index)
      })

      // 当前窗口排最前面
      map.set(this.activeTabId, map.size);
      console.log('init', map, this.activeTabId, map.size);

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

      this.$emit('finish');

      // 更新列表
      // this.search();
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
  -moz-user-select:none; /*火狐*/
  -webkit-user-select:none; /*webkit浏览器*/
  -ms-user-select:none; /*IE10*/
  -khtml-user-select:none; /*早期浏览器*/
  user-select:none;
}
.list >>> .list-item .left {
  padding: 10px;
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
  margin-right: 5px;
}
.list >>> .list-item .right {
  /* border: 1px solid black; */
  margin-left: 10px;
  margin-right: 10px;
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
</style>
<style>
.tab strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>