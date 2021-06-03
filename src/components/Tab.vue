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
            <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
          </div>
          <div slot="placeholder" class="image-slot">
            <!-- <img src="../assets/fallback.png" style="width:100%; height: 100%;" /> -->
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
          v-if="storageKeyword != ''"
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color,
            direction: isSelected ? 'rtl' : 'ltr' }"
          v-html="highlightMap[index].url"></div>
        <div
          v-else
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color }"
          v-text="isSelected ? item.url : getDomain(item.url)"></div>
      </div>

      <div class="right">
        <template v-if="isActive">
          <i
            class="el-icon-close hover"
            @click.stop="closeTab(index)"
            :style="{
              color:config.list_focus_font_color,
              borderColor:config.list_focus_font_color}"></i>
        </template>
        <template v-else>
          <span
            v-if="isSelected"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_focus_keymap_color,
            }">↩</span>
          <span
            v-else-if="platform != ''
              && (index-$refs.list.scrollLines+1) <= config.item_show_count
              && (index-$refs.list.scrollLines+1) >= 1
              && (index-$refs.list.scrollLines+1) <= 9"
            :style="{
              fontSize: config.list_keymap_size+'px',
              color: config.list_keymap_color,
            }">{{
                platform == 'Win'
              ?  'Alt+'+(index-$refs.list.scrollLines+1)
              : '⌘'+(index-$refs.list.scrollLines+1)
              }}</span>
        </template>
      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from './List.vue'

export default {
  name: 'Tab',
  inject: ['focus'],
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

      scrollDisabled: true,
      storageKeyword: null,

      page: 0,
      currentIndex: -1,

      isSearched: false,
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
  },
  methods: {
    itemStyle({ index, item, isActive, isSelected }) {
      // 由于 vue 以组件为粒度进行更新，这里会被频繁调用
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

      this.storageKeyword = keyword.trim();

      // 查找
      let filterList = this.originList.filter(tab => {
        let title = tab.title.toUpperCase();
        let url = tab.url.toUpperCase();
        for(let keyword of this.storageKeyword.toUpperCase().split(/\s+/)) {
          if(title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1) {
            return false;
          }
        }
        return true;
      })

      // 列表赋值
      this.cacheList = filterList;
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.page = 1;

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      this.currentIndex = 0;

      // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
      this.isSearched = true;
    },
    load() {
      let data = this.cacheList.slice(this.page*this.config.list_page_count, (this.page+1)*this.config.list_page_count);
      if(data.length <= 0) {
        this.scrollDisabled = true;
        return;
      }

      this.list.push(...data);
      this.page++;
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
      let tab = this.list[ this.currentIndex ];
      chrome.tabs.update(tab.id, { active: true }, () => {
        chrome.windows.update(tab.windowId, { focused: true});
      })
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
    // 查找
    chrome.tabs.query({}, (tabs)=>{
      this.originList = tabs.map((tab) => {
        // 去除末尾 /
        tab.url = tab.url.replace(/(\/*$)/g,"");
        return tab;
      });

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
.list >>> .list-item .right .el-icon-close {
  margin-right: 2px;
  font-size: 20px;
  cursor:pointer;
}

.el-badge {
    /* margin-right: 5px; */
    border-color: inherit !important;
}
.el-badge.refresh {
    margin-left: 10px;
}
</style>
<style>
.tab strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>