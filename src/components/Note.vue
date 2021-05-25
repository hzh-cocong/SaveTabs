<template>
  <div class="note">

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
        <div v-if="storageList.length > 0">{{ lang('noteNoResult') }}</div>
        <div>{{ lang('noteCountTip')+storageList.length+lang('noteCountTip2') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise', $event)"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews', $event)"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other', $event)"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
    :itemHeight="config.item_height"
    :itemShowCount="config.item_show_count"
    :scrollDisabled="scrollDisabled"
    :scrollbarColor="config.list_scrollbar_color"
    :scrollbarFocusColor="config.list_scrollbar_focus_color"
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: item.url == currentTab.url
                          ? ( isSelected
                              ? config.list_current_focus_background_color
                              : config.list_current_background_color)
                          : ( isSelected
                              ? config.list_focus_background_color
                              : config.list_background_color),
          color: item.url == currentTab.url
              ? ( isSelected
                  ? config.list_current_focus_font_color
                  : config.list_current_font_color)
              : ( isSelected
                  ? config.list_focus_font_color
                  : config.list_font_color),

          '--list-highlight-color': item.url == currentTab.url
                                  ? ( isSelected
                                      ? config.list_current_focus_highlight_color
                                      : config.list_current_highlight_color)
                                  : ( isSelected
                                      ? config.list_focus_highlight_color
                                      : config.list_highlight_color),
          '--list-highlight-weight': item.url == currentTab.url
                                  ? ( isSelected
                                      ? config.list_current_focus_highlight_weight
                                      : config.list_current_highlight_weight)
                                  : ( isSelected
                                      ? config.list_focus_highlight_weight
                                      : config.list_highlight_weight),
        }"
        @click="$event.stopPropagation();currentIndex=index;_openWindow($event)">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon(item.icon, item.url, config.item_height-20)"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
          </el-image>
        </span>

        <div class="main">
          <!-- <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }">{{
                item.title
            }}</div> -->
          <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }"
            v-html="highlightMap[item.id].title"></div>
          <!-- <div
            v-if="storageKeyword != ''"
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              direction: isSelected ? 'rtl' : 'ltr' }">{{ item.url }}</div> -->
          <div
            v-if="storageKeyword != ''"
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              direction: isSelected ? 'rtl' : 'ltr' }"
            v-html="highlightMap[item.id].url"></div>
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
          <div v-if="isActive
                  || activeTabs[item.url]
                  || (storageKeyword != '' && item.lastVisitTime != undefined)">
            <div v-if="isActive">
              <div
                v-if="activeTabs[item.url] && activeTabs[item.url].count > 1"
                class="number-button"
                @click.stop="deleteNote"
                :style="{
                  color:config.list_focus_font_color,
                  borderColor:config.list_focus_font_color }">{{ activeTabs[item.url].count }}</div>
              <i
                v-if="activeTabs[item.url]
                  && (activeTabs[item.url].count > 1
                    || isRepeat(index))"
                class="el-icon-close close-without-tab"
                @click.stop="deleteNote"
                :style="{
                  color:config.list_focus_font_color,
                  borderColor:config.list_focus_font_color }"></i>
              <i
                v-else
                class="el-icon-close"
                style="font-size: 20px;cursor:pointer;margin-right: 2px;"
                @click.stop="deleteNote"
                :style="{
                  color:config.list_focus_font_color,
                  borderColor:config.list_focus_font_color}"></i>
            </div>
            <div
              v-else-if="item.url == currentTab.url"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color,
                borderColor: isSelected
                      ? config.list_current_focus_state_color
                      : config.list_current_state_color }">
                {{ lang('currentNote') +( activeTabs[item.url].count > 1 ? ' ('+activeTabs[item.url].count+')' : '') }}
                <!-- <span>{{ lang('currentNote') }}</span> -->
            </div>
            <div
              v-else-if="activeTabs[item.url]"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                    ? config.list_focus_state_color
                    : config.list_state_color }">
              <!-- {{ lang('opened') }} -->
              <!-- {{ lang('opened') + (activeTabs[item.url].count > 1 ? ' ('+activeTabs[item.url].count+')' : '') }} -->
              {{ lang('opened') + (isSelected && activeTabs[item.url].count > 1 ? ' ('+activeTabs[item.url].count+')' : '') }}
            </div>
            <div
              v-else-if="storageKeyword != '' && item.lastVisitTime != undefined"
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                    ? config.list_focus_state_color
                    : config.list_keymap_color }">
              {{ timeShow(item.lastVisitTime) }}
            </div>
          </div>
          <div
            v-show=" ! isActive && item.url != currentTab.url">
            <span
              v-if="isSelected"
              :style="{
                fontSize: isSelected
                    ? config.list_state_size
                    : config.list_keymap_size+'px',
                color: isSelected
                    ? config.list_focus_keymap_color
                    : config.list_focus_keymap_color }">↩</span>
            <span
              v-else-if="_device.platform != ''
                      && (index-$refs.list.scrollLines+1) <= config.item_show_count
                      && (index-$refs.list.scrollLines+1) >= 1
                      && (index-$refs.list.scrollLines+1) <= 9"
              :style="{
                fontSize: activeTabs[item.url]
                        || (storageKeyword != ''  && item.lastVisitTime != undefined)
                    ? config.list_state_size+'px'
                    : config.list_keymap_size+'px',
                color: activeTabs[item.url]
                    ? config.list_state_color
                    : config.list_keymap_color }">{{
                      _device.platform == 'Win'
                      ?  'Alt+'+(index-$refs.list.scrollLines+1)
                      : '⌘'+(index-$refs.list.scrollLines+1)
                      }}</span>
          </div>
        </div>

      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from './List.vue'
import { nanoid } from 'nanoid'

export default {
  name: 'Note',
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
    }
  },
  data() {
    return {
      list: [],
      cacheList: [],
      storageList: [],

      scrollDisabled: true,
      storageKeyword: undefined,

      currentIndex: -1,
      currentTab: {},
      activeTabs: {},

      // isInCurrentTab: false,

      isSearched: false,
    }
  },
  components: {
    List,
  },
  computed: {
    highlightMap() {
      console.log('===========================hh')

      let a = new Date().getTime();

      // 速度非常非常快，无需再缓存优化
      // 这种实现方式非常简单，而且改造方便，并且兼容所有可能情况，如修改标题
      let highlightMap = {};
      this.list.forEach(item => {
        highlightMap[ item.id ] = {
          title: this.highlight(item.title, this.storageKeyword, '<strong>', '</strong>'),
          url: this.highlight(item.url, this.storageKeyword, '<strong>', '</strong>'),
        }
      });

      let b = new Date().getTime();

      console.log('===h', (b-a)/1000);

      return highlightMap;
    },
    isInCurrentTab() {
      // return this.storageList.some((tab) => {
      //   // 兼容旧版（旧版没有自动去除末尾 /
      //   if(tab.url == this.currentTab.url) {
      //     return true;
      //   }
      // })
      // console.log('isInCurrentTab');
      // let count = 0;
      // this.list.forEach((tab) => {
      //   if(tab.url == this.currentTab.url) {
      //     count++;
      //   } else {
      //     return count;
      //   }
      // })
      // return count;

      // 由于当前窗口会被排在最前面，所以并不需要遍历 storageList
      return this.list.length > 0 && this.list[0].url == this.currentTab.url;
    },
    currentNote() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    currentStorageIndex() {
      return this.storageList.findIndex(note => {
        return note.id == this.currentNote.id;
      });
    }
  },
  methods: {
    up() {
      this.currentIndex--;
    },
    down() {
      this.currentIndex++;
    },
    search(keyword) {
      console.log('search===h', typeof this.storageKeyword, this.storageKeyword==undefined||this.storageKeyword.length);
      if(keyword == undefined) return;
      if(this.storageKeyword == keyword.trim()) return;
console.log('search2===h');
      let isFirstSearch = this.storageKeyword == undefined;

      this.storageKeyword = keyword.trim();

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

      // // 查找
      // let filterList = this.storageList.filter(tab => {
      //   let title = tab.title.toUpperCase();
      //   let url = tab.url.toUpperCase();
      //   for(let keyword of this.storageKeyword.toUpperCase().split(/\s+/)) {
      //     if(title.indexOf(keyword) == -1 && url.indexOf(keyword) == -1) {
      //       return false;
      //     }
      //   }
      //   return true;
      // })

      // 重新排序
      let currentList = filterList.filter(tab => {
        return tab.url == this.currentTab.url;

        // 当前窗口需要三个条件同时满足
        // return tab.tabId == this.currentTab.id
        //     && tab.windowId == this.currentTab.windowId
        //     && tab.url == this.currentTab.url;
      });
      let openedList = filterList.filter(tab => {
        return this.activeTabs[tab.url]
            && this.activeTabs[tab.url].url != this.currentTab.url;

        // 需已打开，并且地址未变化，而且不是当前窗口
        // return this.activeTabs[tab.tabId]
        //     && this.activeTabs[tab.tabId].url == tab.url
        //     && ! (tab.tabId == this.currentTab.id
        //         && tab.windowId == this.currentTab.windowId);
      });
      let closeList = filterList.filter(tab => {
        return ! this.activeTabs[tab.url];

        // return ! this.activeTabs[tab.tabId]
        //       || this.activeTabs[tab.tabId].url != tab.url;
      });

      // 列表赋值
      this.cacheList = currentList; this.cacheList.push(...openedList, ...closeList);
      // this.cacheList = currentList.concat(openedList).concat(closeList);
      this.list = this.cacheList.slice(0, this.config.list_page_count);

      this.scrollDisabled = this.list.length >= this.cacheList.length;
      if(isFirstSearch && this.isInCurrentTab && this.list.length > 1) {
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

      // let data = this.cacheList.slice(this.page*this.config.list_page_count, (this.page+1)*this.config.list_page_count);
      // if(data.length <= 0) {
      //   this.scrollDisabled = true;
      //   return;
      // }

      // // 赋值
      // this.list = this.list.concat(data);
      // // this.list.push(...data);
      // this.page++;
      // this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    add(callback) {
      // 当前标签只能有一个
      if(this.isInCurrentTab) {
        this.$message({
          type: 'warning',
          message: this.lang('noteSaved'),
          offset: 69,
          duration: 2000,
          customClass: 'window-message-box',
        });
        // 返回 true，这样会清空输入框，避免用户的一些困惑更为重要
        callback(true);

        return;
      }

      // 获取当前标签
      // 重新获取，因为网页可能还未加载完
      new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 去除末尾 /
          tabs[0].url = tabs[0].url.replace(/(\/*$)/g,"")

          resolve(tabs[0])
        })
      }).then((tab) => {
        // 构造数据
        this.storageList.unshift({
          id: nanoid(),
          title: tab.title,
          url: tab.url,
          icon: tab.favIconUrl,
          // tabId: this.currentTab.id,
          // windowId: this.currentTab.windowId,
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
        // 其实不写也没关系，只是要是 currenTab 真的变了就不好了（测试也容易，因为测试的数据有问题）
        this.activeTabs[ this.currentTab.url ] = tab;

        // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
        this.storageKeyword = ' ';
console.log('add =====h')
        // this.search(this.storageKeyword);

        // 由于在添加的时候还顺带着切换，从而导致搜索，这两个是并行的，会有影响
        // 这里放到定时队列里，相当于排最后，避免冲突，会出现损坏的图片
        // 正式环境其实没有问题，因为图片都是可访问的，而且也没那么快
        // setTimeout(()=>{
        //   callback(true)
        // }, 1)
        callback(true);
      })

      // let id = nanoid();
      // this.storageList.unshift({
      //   id: id,
      //   title: this.currentTab.title,
      //   url: this.currentTab.url,
      //   icon: this.currentTab.favIconUrl,
      //   // tabId: this.currentTab.id,
      //   // windowId: this.currentTab.windowId,
      //   lastVisitTime: new Date().getTime(),
      // });

      // // 保存数据
      // chrome.storage.local.set({tabs: this.storageList}, () => {

      //   // this.activeTabs[this.currentTab.id] = {
      //   //   id: this.currentTab.id,
      //   //   url: this.currentTab.url,
      //   //   windowId: this.currentTab.windowId,
      //   // }
      //   // this.isInCurrentTab = true;

      //   // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
      //   this.storageKeyword = ' ';

      //   // this.search(this.storageKeyword);
      //   callback(true);
      // })
    },
    openWindow(index, event) {
      if(index == undefined) {
        this._openWindow(event);
        return;
      }

      let currentIndex = index+this.$refs.list.scrollLines-1;
      if(currentIndex >= this.list.length || index > this.config.item_show_count) {
        return;
      }

      this.currentIndex = currentIndex;
      this._openWindow(event);
    },
    _openWindow(event) {
      if(this.currentNote == null) return;

      // 更新时间
      this.storageList[this.currentStorageIndex].lastVisitTime = new Date().getTime();

      // 标签已打开，直接切换
      if(this.activeTabs[this.currentNote.url]) {
        // 存储新数据（排序发生变化）
        this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
        // 先存储，再切换
        chrome.storage.local.set({tabs: this.storageList}, () => {
          // 先激活标签，再切换窗口
          chrome.tabs.update(this.activeTabs[this.currentNote.url].id, { active: true }, () => {
            chrome.windows.update(this.activeTabs[this.currentNote.url].windowId, { focused: true});
          });
        });
        return;
      }

      // 存储
      this.storageList.unshift(this.storageList.splice(this.currentStorageIndex , 1)[0]);
      console.log('111111111111', this.currentNote.url, this.currentNote.title)
      // let s = true; if(s)return;
      chrome.storage.local.set({tabs: this.storageList}, () => {
        this.$open(this.currentNote.url, event, (tab, type) => {
          console.log('333333333333', tab.url, tab.title, type)
          if(type == 'cover') {
            if(this.activeTabs[ this.currentTab.url ].count > 1) {
              console.log('mmmmmmmmmmmmmmmmmmmmmm', this.activeTabs[ this.currentTab.url ].count, this.activeTabs[ this.currentTab.url ].id, this.activeTabs[ this.currentTab.url ].other)
              this.activeTabs[ this.currentTab.url ].count--;
              let gg = this.activeTabs[ this.currentTab.url ].other.splice(0, 1);
              console.log('gg', gg)
              this.activeTabs[ this.currentTab.url ].id = gg[0];
              console.log('mmmmmmmmmmmmmmmmmmmmmm2', this.activeTabs[ this.currentTab.url ].count, this.activeTabs[ this.currentTab.url ].id, this.activeTabs[ this.currentTab.url ].other)
            } else {
              delete this.activeTabs[ this.currentTab.url ];
            }

            this.currentTab = tab;
            this.activeTabs[ this.currentTab.url ] = tab;

          console.log('444444444', this.currentTab.url, this.currentTab.title)
            // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
            let origin = this.storageKeyword;
            this.storageKeyword = ' ';
            this.search(origin);

            this.focus();
          }
        });
      });
    },
    deleteNote() {
      // 移除数据
      this.storageList.splice(this.currentStorageIndex , 1);
      chrome.storage.local.set({tabs: this.storageList}, () => {
        if( ! this.activeTabs[this.currentNote.url]) {
console.log('aa')
        } else if(this.activeTabs[this.currentNote.url].count > 1) {
          // 存在多个网页则不关闭网页
console.log('bb')
        } else if(this.getCacheUrlCount(this.currentNote.url) > 1) {
          // 存储了多个相同的网页也不自动关闭标签，直到只剩下一个

        }else {
          // 如果删除的是已经打开的便签，则顺带把对应的标签页给关闭了
          chrome.tabs.remove(this.activeTabs[this.currentNote.url].id);
        }

        // 移除，不重新search，体验不好
        this.list.splice(this.currentIndex, 1);
        this.cacheList.splice(this.currentIndex, 1);
        // if(this.list.length < this.config.list_page_count
        //   && this.scrollDisabled == false) {
        //   this.load();
        // }

        // // 这样列表才会被触发更新，不能为 undefined，否则会自动选择第二项
        // let origin = this.storageKeyword;
        // this.storageKeyword = ' ';
        // this.search(origin);

        this.focus();
      })
    },

    isRepeat(index) {
      console.log('isRepeat', index)
      if(this.cacheList[index].url == this.currentTab.url) {
        console.log('isRepeat fffffff', index)
        // 当前窗口只需比较附近即可
        if(index > 0) {
          console.log('isRepeat ffffffffff2', index)
          if(this.cacheList[index-1].url == this.cacheList[index].url)
            return true;
        }
        if(index+1 < this.cacheList.length) {
          console.log('isRepeat fffffffffffffff3', this.cacheList.length)
          if(this.cacheList[index+1].url == this.cacheList[index].url)
            return true;
        }
      } else {
        console.log('isRepeat jjjjjjjjjjj', index)
        // 非当前窗口需要遍历所有 opened 窗口
        for(let i in this.cacheList) {
          let tab = this.cacheList[i];
          if(i == index) continue;
          console.log('isRepeat jjjjjjjjjjj2', i, index)
          if( ! this.activeTabs[tab.url]) {
            console.log('isRepeat jjjjjjjjjjj3', false)
            return false;
          } else {
            console.log('isRepeat jjjjjjjjjjj4',  this.activeTabs[tab.url] == this.cacheList[index].url)
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
    }
  },
  mounted() {
    //todo
    window.n = this;

    Promise.all([
      new Promise((resolve) => {
        // 获取本地数据
        chrome.storage.local.get({tabs: []}, items => {
          this.storageList = items.tabs.map((tab) => {
            // 兼容旧版（旧版没有自动去除末尾 /）
            tab.url = tab.url.replace(/(\/*$)/g,"");
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
          // 去除末尾 /
          tabs[0].url = tabs[0].url.replace(/(\/*$)/g,"")
          this.currentTab = tabs[0];
          resolve()
        })
      }),
      // 获取全部标签
      new Promise((resolve) => {
        chrome.tabs.query({}, tabs => {
          for(let tab of tabs) {
            // 去除末尾 /
            tab.url = tab.url.replace(/(\/*$)/g,"");
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
      this.$emit('finish');
    })

    // new Promise((resolve) => {
    //   // 获取本地数据
    //   chrome.storage.local.get({tabs: []}, items => {
    //     this.storageList = items.tabs;
    //     resolve()
    //   });
    // }).then(() => {
    //   // 获取当前标签
    //   return new Promise((resolve) => {
    //     chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    //       this.currentTab = tabs[0];
    //       resolve()
    //     })
    //   })
    // }).then(() => {
    //   // 处理当前标签数据

    //   // 判断是否存在在当前标签
    //   let index = -1;
    //   for(let i in this.storageList) {
    //     if(this.storageList[i].windowId == this.currentTab.windowId
    //       && this.storageList[i].tabId == this.currentTab.id
    //       && this.storageList[i].url == this.currentTab.url) {
    //       index = i;
    //       break;
    //     }
    //   }
    //   if(index == -1) return;

    //   // 标记
    //   // if(this.storageList.length > 1) this.currentIndex = 1; // 列表还未赋值，会被改回去
    //   this.isInCurrentTab = true;
    // }).then(() => {
    //   // 获取全部标签
    //   return new Promise((resolve) => {
    //     chrome.tabs.query({}, tabs => {
    //       resolve(tabs)
    //     })
    //   })
    // }).then((tabs) => {
    //   // 保存活跃的窗口
    //   for(let tab of tabs) {
    //     this.activeTabs[ tab.id ] = tab;// tab.windowId;
    //   }

    //   this.$emit('finish');

    //   // 更新列表
    //   // this.search(this.storageKeyword);
    // })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.item {
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
.item .left {
  padding: 10px;
  text-align: center;
}
.item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  flex-direction: column;
  /* justify-content: space-evenly; */
  justify-content: center;
}
.item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 5px;
}
.item .right {
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

.el-badge {
    /* margin-right: 5px; */
    border-color: inherit !important;
}
.el-badge.refresh {
    margin-left: 10px;
}

.number-button {
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
  cursor:pointer;
}
.close-without-tab {
  min-width: 20px;
  height: 20px;
  padding: 2px;
  font-size: 20px;
  border:2px solid white;
  font-size: 18px;
  border-radius: 20px;
  text-align: center;
  cursor:pointer;
}
.close-without-tab:before {
  position: relative;
  top: 1px;
}
</style>

<style>
.note strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>