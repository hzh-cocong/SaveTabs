<template>
  <div class="history">

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
        <div>{{ lang('historyNoResult') }}</div>
        <div>{{ lang('historyCountTip') }}</div>
      </div>
      <el-button circle size="mini" icon="el-icon-coffee-cup" style="margin-left: 2px !important;" @click="$open('./options.html?type=praise')"></el-button>
      <el-button circle size="mini" icon="el-icon-chat-dot-square" style="margin-left: 2px !important;" @click="$open('https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews')"></el-button>
      <el-button circle size="mini" icon="el-icon-setting" style="margin-left: 2px !important;" @click="$open('./options.html?type=other')"></el-button>
    </div>
  </el-alert>

  <list
    :list="list"
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
    @itemClick="_openWindow">>
    <template #default="{ index, item, isActive, isSelected }">
      <span
        class="left"
        :style="{
          width: (config.item_height-20)+'px',
          height: (config.item_height-20)+'px',
          marginLeft: item.count == undefined
                    ? 10+'px'
                    : 0 }">
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
          :style="{ fontSize: config.list_font_size+'px' }">
          <i
            v-if="item.count != undefined && item.count > 1"
            style="margin-right: 10px;"
            :class="{ 'el-icon-circle-plus-outline' : item.subFiles.length > 0,
                        'el-icon-remove-outline' : item.subFiles.length <= 0,  }"></i>
          <span v-html="highlightMap[index].title || highlightMap[index].url"></span>
        </div>
        <!-- <div
          class="title"
          :style="{ fontSize: config.list_font_size+'px' }">
          <template v-if="item.count == undefined || item.count == 1">
            {{ item.count == undefined
            ? (item.title || item.url)
            : (item.subFiles[0].title || item.subFiles[0].url) }}
          </template>
          <template v-else>
            <i
              style="margin-right: 10px;"
              :class="{ 'el-icon-circle-plus-outline' : item.subFiles.length > 0,
                          'el-icon-remove-outline' : item.subFiles.length <= 0,  }"></i>
            <span>{{ item.subFiles.length > 0
                    ? (item.subFiles[0].title || item.subFiles[0].url)
                    : (list[index+1].title || list[index+1].url) }}</span>
          </template>
        </div> -->
        <div
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color,
            direction: isSelected ? 'rtl' : 'ltr' }"
            v-html="item.count == undefined || item.count == 1
                  ? highlightMap[index].url
                  : highlightMap[index].domain+' | '+item.count">
        </div>
        <!-- <div
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color,
            direction: isSelected ? 'rtl' : 'ltr' }">
            <template v-if="item.count == undefined || item.count == 1">
              {{ item.count == undefined
                ? item.url
                : item.subFiles[0].url }}
            </template>
            <template v-else>
              {{ ( item.subFiles.length > 0
                  ? getDomain(item.subFiles[0].url)
                  : getDomain(list[index+1].url))
                + ' | '+item.count }}
            </template>
        </div> -->
      </div>

      <div class="right">
        <div v-if="isActive">
          <i
            v-if="storageKeyword != getDomain(item.count == undefined
                                            ? item.url
                                            : (
                                                item.subFiles.length > 0
                                              ? item.subFiles[0].url
                                              : list[index+1].url
                                            ))"
            class="el-icon-more"
            style="font-size: 20px;cursor:pointer;margin-right: 11px;padding: 5px;"
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
              color:config.list_focus_font_color}"></i>
          <i
            class="el-icon-close"
            style="font-size: 20px;cursor:pointer;margin-right: 2px;"
            @click.stop="deleteHistory"
            :style="{
              color:config.list_focus_font_color}"></i>
        </div>
        <div v-if=" ! isActive">
          <span
            :style="{
              fontSize: config.list_state_size+'px',
              color: isSelected
                ? config.list_focus_state_color
                : config.list_state_color,
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
        </div>
        <div v-if=" ! isActive">
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
        </div>
      </div>
    </template>
  </list>

  <el-dialog
    :visible.sync="dialogVisible"
    :append-to-body="true"
    width="80%"
    title="清除浏览数据"
    @close="focus">
    <el-select v-model="range" style="width: 100%;">
      <el-option :value="3600000" label="过去一小时"></el-option>
      <el-option :value="86400000" label="过去24小时"></el-option>
      <el-option :value="604800000" label="过去7天"></el-option>
      <el-option :value="2419200000" label="过去4周"></el-option>
      <el-option :value="-1" label="时间不限"></el-option>
    </el-select>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="clearRange">确 定</el-button>
    </span>
  </el-dialog>

  </div>
</template>

<script>
import List from './List.vue'

export default {
  name: 'History',
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
    },
    history: {
      type: Object,
      required: false,
      default: function() {
        return {
          date: null,
        }
      },
    }
  },
  data() {
    return {
      list: [],
      cacheList: [],

      scrollDisabled: true,
      queryDisabled: false,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,

      lastVisitTime: null, // new Date().getTime(),
      lastEndTime: null,
      // startTime: 0,

      range: 3600000,
      dialogVisible: false,
    }
  },
  components: {
    List,
  },
  watch: {
    // todo
    "history.date": function(newVal, oldVal) {
      console.log('history.date', this.history.date, newVal, oldVal);
      this.search();
    },
    "history.visible": function(newVal, oldVal) {
      console.log('history.visible', newVal, oldVal);
      if(this.history.isActive) this.search();
    },
    "history.isDel": function(newVal, oldVal) {
      console.log('history.isDel', newVal, oldVal);
      if( ! this.history.isDel) return;

      if(this.history.date == null) {
        this.dialogVisible = true;
        this.history.isDel = false;
      } else {
        this.deleteRange(this.startTime, this.endTime, () => {
          this.storageKeyword = undefined; // 这样列表才会刷新
          this.search('');
          this.history.isDel = false;
          this.focus();
        });
      }
    },
  },
  computed: {
    iconMap() {
      console.log('getIcon:iconMap');
      let a = new Date().getTime();

      let ss = this.list.map((item, index) => {
        return this.getIcon('', item.count == undefined
                              ? item.url
                              : (
                                  item.subFiles.length > 0
                                ? item.subFiles[0].url
                                : this.list[index+1].url
                              ), this.config.item_height-20);
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
          title: this.highlight(title, this.storageKeyword, '<strong>', '</strong>'),
          url: this.highlight(url, this.storageKeyword, '<strong>', '</strong>'),
          domain: this.highlight(this.getDomain(url), this.storageKeyword, '<strong>', '</strong>'),
        }
      });

      let b = new Date().getTime();

      console.log('===h', (b-a)/1000);

      return highlightMap;
    },

    endTime() {
      console.log('computed.endTime');
      if(this.history.date == null || ! this.history.visible) {
        // return null;
        return new Date().getTime();
      } else {
        return this.history.date.getTime()+86400000-1000;
      }
    },
    startTime() {
      console.log('computed.startTime');
      if(this.history.date == null ||  ! this.history.visible) {
        return 0;
      } else {
        return this.history.date.getTime();
      }
    },

    // list() {
    //   return this.cacheList.slice(0, this.page*this.config.list_page_count);
    //   // this.list.concat(this.list.length, this.list.length+this.config.list_page_count);
    // },
    currentHistory() {
      if(this.list.length == 0) return null;
      return this.list[ this.currentIndex ];
    },
    currentFolderIndex() {
      // 从当前位置网上寻找父亲
      console.log('currentFolderIndex', this.currentIndex)
      let k = this.currentIndex;
      while(this.list[ k ].count == undefined) k--;
      console.log('currentFolderIndex', this.currentIndex, k, this.list[k])
      return k;
    },
    currentFolder() {
      // 从当前位置寻找父亲
      console.log('currentFolder', this.list[ this.currentFolderIndex ]);
      return this.list[ this.currentFolderIndex ];
    }
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
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword == keyword.trim()) return;
        this.storageKeyword = keyword.trim();
      }
console.warn('isSearched');
      console.log('search', this.storageKeyword, keyword,  this.endTime, new Date().getTime());

      if(keyword == undefined && this.lastEndTime == this.endTime) return;

      console.log('search2', this.storageKeyword, this.lastEndTime, this.endTime);

      this.lastEndTime = this.endTime;
      let lastVisitTime = this.endTime;

      // 默认只展示 24 小时内的数据（体验不好）
      // this.startTime = this.storageKeyword == '' ?  new Date().getTime()-86400000 : 0;

      // 反正历史记录就不太对，不如将错就错
      // this.startTime = 0;
console.warn('isSearched2');
      // 查找历史
      this.query((historys) => {console.warn('isSearched3');
        console.log('history.search', historys);
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

        // 只有一条时自动展开
        if(this.cacheList.length == 1 && this.cacheList[0].count > 1) {
          let historys = this.cacheList[0].subFiles.splice(0, this.cacheList[0].count);

          this.cacheList.push(...historys);
          // this.cacheList.splice(1, 0, ...historys);

          this.currentIndex = 1;

          // 不加这个，目录可能会被隐藏，即自动向上滚动了一行
          this.$nextTick(() => {
            this.$refs.list.currentTo(1);
          });
        } else {
          this.currentIndex = 0;
        }

        this.list = this.cacheList.slice(0, this.config.list_page_count);

        // query 并不精确，有可能这次只返回一条，下次却返回10条
        this.scrollDisabled = false;
        this.queryDisabled = false;

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      }, lastVisitTime, 27)
    },
    load() {
console.log('load', this.cacheList.length, this.list.length+this.config.list_page_count)
      let isPrepare = false;
      if(this.cacheList.length >= this.list.length+this.config.list_page_count) {
        // 性能最高
        this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))

        // 预加载，即下次翻页需要调用接口时，那么这次就先调用接口
        console.log('load2', this.cacheList.length, this.list.length+this.config.list_page_count)
        if(this.cacheList.length >= this.list.length+this.config.list_page_count) return;
        isPrepare = true;
      }
console.log('load3', this.list.length)

      if(this.queryDisabled && ! isPrepare) {
        this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
        this.scrollDisabled = true;
        return;
      }

      // 查找历史
      this.query((historys) => {
        console.log('history.load', historys);

        if(historys.length == 0) {
          if( ! isPrepare) {
            console.log('0000000000000000000000', this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
            this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
            this.scrollDisabled = true;
          }

          this.queryDisabled = true;
          return;
        }

        this.mergeHistory(this.cacheList, historys);
        console.log('history.load2', this.cacheList);

        if( ! isPrepare) {
          console.warn('pppppppppppppppppppppppppppppppp================')
          this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
        }
      })
    },
    query(callback, lastVisitTime, max) {
      max = max == undefined ? 55 : max;
      max = max < this.config.list_page_count ? this.config.list_page_count : max;

      // 防止并发问题
      lastVisitTime = lastVisitTime == undefined ? this.lastVisitTime : lastVisitTime;

      // 查找
      chrome.history.search({
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: lastVisitTime,
          maxResults: max, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
        }, (historys)=>{
        console.log('chrome.history.query', {
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: lastVisitTime,
          maxResults: 10, //100, // this.config.list_page_count, 每次尽可能查多一点，这样就可以大大减少错误结果
        }, historys)

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
          // 去除末尾 /
          history.url = history.url.replace(/(\/*$)/g,"");

          return history.lastVisitTime < lastVisitTime;
        })

        // 过滤
        if(historys.length == 0) {
          // 糟糕，被过滤完了
          console.warn('history.loading.result.warn', this.lastVisitTime, this.timeShow(this.lastVisitTime));
          // this.lastVisitTime = this.lastVisitTime-1000*1;
          console.warn('history.loading.result.warn', this.lastVisitTime, this.timeShow(this.lastVisitTime));
          callback([]);
          return;
        }

        this.lastVisitTime = Math.floor(historys[historys.length-1].lastVisitTime)-1;

        callback(historys);
      })
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
      if(this.currentHistory == null) return;

      if(this.currentHistory.count == undefined || this.currentHistory.count == 1) {
        // 打开新标签
        let url = this.currentHistory.count == undefined
                ? this.currentHistory.url
                : this.currentHistory.subFiles[0].url
console.log('_openWindow', url)
        this.$open(url, event);
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
        console.log('展开', this.list.length, this.cacheList.length)

        // 由于 currentIndex List 组件通过 $emit 调用触发的，虽然对于父组件 currentIndex 的更新是实时的，但是对于其依赖（即子组件的 currentIndex），则是被放到异步队列中执行的，因此此时子组件的 currentIndex 值依然是旧的
        this.$nextTick(() => {
          if(this.$refs.list.visiualIndex+this.currentHistory.count+1 > this.config.item_show_count) {
            let index = this.config.item_show_count-this.currentHistory.count-1;
            // index = index < 0 ? 0 : index;
            console.warn('kkkk2')
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
    deleteHistory() {
      // 删除单独一条历史记录
      if(this.currentHistory.count == 1) {
        chrome.history.deleteUrl({ url: this.currentHistory.subFiles[0].url }, () => {
console.log('删除单独一条历史记录')
          this.cacheList.splice(this.currentIndex, 1);
          this.list.splice(this.currentIndex, 1);

          this.focus();
        })
        return;
      }

      // 删除文件夹内的某条历史记录（肯定展开了）
      if(this.currentHistory.count == undefined) {
        chrome.history.deleteUrl({ url: this.currentHistory.url }, () => {
          if(this.currentFolder.count-1 == 1) {
console.log('删除文件夹内的某条历史记录（肯定展开了）1')
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
console.log('删除文件夹内的某条历史记录（肯定展开了）2')
            this.currentFolder.count--;
            this.cacheList.splice(this.currentIndex, 1);
            this.list.splice(this.currentIndex, 1);
          }

          this.focus();
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
console.log('删除整个文件夹（未展开）')
          this.cacheList.splice(this.currentIndex, 1);
          this.list.splice(this.currentIndex, 1);

          this.focus();
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
console.log('删除整个文件夹（已展开）')
          this.cacheList.splice(this.currentIndex, this.currentHistory.count+1);
          this.list.splice(this.currentIndex, this.currentHistory.count+1);

          this.focus();
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
                      : '';
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
      console.log('list', list)
    },

    clearRange() {
      if(this.range == -1) {
console.log('deleteAll')
        chrome.history.deleteAll(() => {
          this.storageKeyword = undefined; // 这样列表才会刷新
          this.search('');
          this.dialogVisible = false;
        })
      }  else {
        let endTime = new Date().getTime();
        let startTime = endTime-this.range;
console.log('clearRange', this.range, startTime, endTime, this.timeShow(startTime), this.timeShow(endTime))
        chrome.history.deleteRange({
          startTime: startTime,
          endTime: endTime,
        }, () => {
          this.storageKeyword = undefined; // 这样列表才会刷新
          this.search('');
          this.dialogVisible = false;
        })
      }
    },
    deleteRange(startTime, endTime, callback) {
      console.log('deleteRange', startTime, endTime, this.timeShow(startTime), this.timeShow(endTime))
      this.$confirm("确定删除？", '提示', {
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
    }
  },
  beforeUpdate() {
    console.warn('beforeUpdate');
  },
  updated() {
    console.warn('updated');
  },
  mounted() {
    // todo
    window.h = this;
console.warn('mounted')
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
  /* justify-content: space-evenly; */
  justify-content: center;
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

.el-badge {
    /* margin-right: 5px; */
    border-color: inherit !important;
}
.el-badge.refresh {
    margin-left: 10px;
}
</style>

<style>
.history strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>