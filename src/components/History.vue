<template>
  <div>

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
    v-model="currentIndex"
    ref="list"
    @load="load"
    @click.native="focus">
    <template #default="{ index, item, isActive, isSelected }">
      <div
        class="item"
        :style="{
          backgroundColor: isSelected
                          ? config.list_focus_background_color
                          : config.list_background_color,
          color: isSelected
                ? config.list_focus_font_color
                : config.list_font_color
        }"
        @click="$event.stopPropagation();currentIndex=index;_openWindow()">

        <span
          class="left"
          :style="{
            width: (config.item_height-20)+'px',
            height: (config.item_height-20)+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon('', item.url, config.item_height-20)"
            style="width:100%; height: 100%;"
            fit="cover"
            :lazy="index >= config.item_show_count">
            <div slot="error" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot">
              <img src="../assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <!-- <div slot="placeholder" class="image-slot">
              <img
                v-if="index >= config.item_show_count"
                src="../assets/fallback.png"
                style="width:100%; height: 100%;" />
            </div> -->
          </el-image>
        </span>

        <div class="main">
          <div
            class="title"
            :style="{ fontSize: config.list_font_size+'px' }">{{
                item.title || item.deleteUrl
            }}</div>
          <!-- <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              direction: isSelected ? 'rtl' : 'ltr' }">{{ item.url }}</div> -->
        </div>

        <div class="right">
          <div v-if="isActive">
            <i
              class="el-icon-close"
              style="font-size: 20px;cursor:pointer;border:2px solid white;border-radius:2px"
              @click.stop="deleteHistory(index)"
              :style="{
                color:config.list_focus_font_color,
                borderColor:config.list_focus_font_color}"></i>
          </div>
          <div v-if=" ! isActive">
            <span
              :style="{
                fontSize: config.list_state_size+'px',
                color: isSelected
                  ? config.list_focus_state_color
                  : config.list_state_color,
              }">{{ timeShow(item.lastVisitTime) }}</span>
          </div>
          <div v-if=" ! isActive">
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
          </div>
        </div>

      </div>
    </template>
  </list>

  </div>
</template>

<script>
import List from './List.vue'

export default {
  name: 'History',
  inject: ['focus', 'prev', 'next'],
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

      lastVisitTime: new Date().getTime(),
      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      startTime: 0,

      isSearched: false,

      lock: false,
    }
  },
  components: {
    List,
  },
  methods: {
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

      let lastVisitTime = new Date().getTime();
      this.startTime = this.storageKeyword == '' ?  new Date().getTime()-86400000 : 0;

      // 查找
      chrome.history.search({
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: lastVisitTime,
          maxResults: this.config.list_page_count,
        }, (historys)=>{
        // 谷歌提供的接口返回的结果过有时候会是错误的
        historys = historys.sort((a, b)=>{
          return b.lastVisitTime-a.lastVisitTime;
        });

        if(historys.length == 0) {
          this.list = [];
          this.currentIndex = 0; //-1;（-1比较危险，不过bug修复后应该没问题，下个版本再思考-1的问题吧）
          this.scrollDisabled == true;

          // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
          this.isSearched = true;

          return;
        }

        let historys2 = historys.filter((history) => {
          return history.lastVisitTime < lastVisitTime;
        })

        this.list = historys2;
        this.currentIndex = 0;
        this.scrollDisabled = historys.length < this.config.list_page_count;
        if(this.list.length == 0) {
          this.lastVisitTime = lastVisitTime-1000*1;
        } else {
          this.lastVisitTime = Math.floor(this.list[this.list.length-1].lastVisitTime)-1000;
        }

        // 防止“无数据提示栏”在一开始就出现，从而造成闪烁
        this.isSearched = true;
      })
    },
    load() {
      // 查找
      chrome.history.search({
          text: this.storageKeyword,
          startTime: this.startTime,
          endTime: this.lastVisitTime,
          maxResults: this.config.list_page_count,
        }, (historys)=>{
        historys = historys.sort((a, b)=>{
          return b.lastVisitTime-a.lastVisitTime;
        });

        if(historys.length == 0) {
          this.scrollDisabled = true;
          return;
        }

        let historys2 = historys.filter((history) => {
          // if(history.lastVisitTime >= this.lastVisitTime) console.warn('aaaaaa');
          return history.lastVisitTime < this.lastVisitTime;
        })

        this.list.push(...historys2);
        // this.lastVisitTime = Math.floor(this.list[this.list.length-1].lastVisitTime)-1000;
        this.scrollDisabled = historys.length < this.config.list_page_count;
        let lastVisitTime = Math.floor(this.list[this.list.length-1].lastVisitTime)-1000;
        // console.warn('history.loading.result', this.lastVisitTime, this.timeShow(this.lastVisitTime), lastVisitTime, this.timeShow(lastVisitTime));
        if(this.lastVisitTime <= lastVisitTime) {
          // console.error('history.loading.result.wrong', this.lastVisitTime, this.timeShow(this.lastVisitTime), lastVisitTime, this.timeShow(lastVisitTime));
          lastVisitTime = this.lastVisitTime-1000*1;
        }
        this.lastVisitTime = lastVisitTime;
      })
    },
    openWindow(index) {
      if(index == undefined) {
        this._openWindow();
        return;
      }

      let currentIndex = index+this.$refs.list.scrollLines-1;
      if(currentIndex >= this.list.length || index > this.config.item_show_count) {
        return;
      }

      this.currentIndex = currentIndex;
      this._openWindow();
    },
    _openWindow() {
      // alert('ss')
      let history = this.list[ this.currentIndex ];
      let url = history.url;

      // 打开新标签
      this.$open(url);
      // chrome.tabs.create({
      //   url: url,
      // })
    },
    deleteHistory(index) {
      let url = this.list[index].url;
      chrome.history.deleteUrl({ url: url }, () => {
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
    this.$emit('finish');

    // 更新列表
    // this.search();

    this.$el.addEventListener("mousewheel", (event) => {
      const eventDeltaX = -event.wheelDeltaX || event.deltaX * 3;
      const eventDeltaY = -event.wheelDeltaY || event.deltaY * 3;
      if(Math.abs(eventDeltaX) <= 0 || eventDeltaY != 0)
        return;

      // 防止滚动过快，渲染速度跟不上看起来会停止，体验不好
      if(this.lock == true) return;
      this.lock = true;

      eventDeltaX > 0 ? this.next() : this.prev();

      setTimeout(() => { this.lock = false; }, 1000);
    })
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


</style>
