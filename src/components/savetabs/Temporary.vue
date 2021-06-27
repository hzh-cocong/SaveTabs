<template>
  <div class="temporary">

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
        <div v-if="storageList.length > 0">{{ lang('temporaryNoResult') }}</div>
        <div>{{ lang('temporaryCountTip')+storageList.length+lang('temporaryCountTip2') }}</div>
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
    @itemClick="_openWindow(getKeyType($event))">
    <template
      v-if=" ! workspaceSwitch"
      #default="{ index, item, isActive, isSelected }">
      <span
        class="left"
        :style="{
          width: (config.item_height-10)+'px',
          height: (config.item_height-10)+'px' }">
        <div class="image" :style="{ height: (config.item_height-14)+'px' }">
          <div class="a" :style="{
            transform : 'scale('+config.item_height/50*1.3+', '+config.item_height/50*1.3+')'
          }">{{ item.tabs.length}}</div>
          <div class="b" :style="{
            transform : 'scale('+config.item_height/50/2+', '+config.item_height/50/2+')',
            marginTop : config.item_height > 50
                      ? ((config.item_height-50)/5) + 'px'
                      : 0,
          }">{{ lang('temporaryTabTip') }}</div>
        </div>
      </span>

      <div
        class="main"
        :class="{ scroll: isActive }"
        :style="{
          'flex-direction': ! isSelected ? 'column' : 'column',
          'justify-content': ! isSelected ? 'space-evenly' : 'flex-start',
          'flex-wrap': ! isSelected ? 'nowrap' : 'wrap',
          'align-content': ! isSelected ? 'normal' : 'flex-start',
          'align-items': ! isSelected ? 'normal' : 'flex-start' }"
        @mouseenter="mainEnter"
        @mouseleave="mainLeave"
        @click.stop="focus">
        <template v-if="isSelected">
          <el-tag
            v-for="(tab, i) in item.tabs"
            :key="i"
            :title="tab.title+'\r\n'+tab.url"
            :style="{ height: tagConfig.tag_font_size+'px',
                      width: 'calc(100% / '+(storageKeyword == '' || item.tabs.length > tagConfig.tag_line_count ? tagConfig.tag_line_count : item.tabs.length)
                                            +' - '+(tagConfig.tag_padding_left*2+1*2+tagConfig.tag_margin_right)+'px)',
                      margin: tagConfig.tag_margin_top+'px '
                            + tagConfig.tag_margin_right+'px 0px 0px',
                      padding: tagConfig.tag_padding_top+'px '
                              +tagConfig.tag_padding_left+'px' }"
            :type="tabFocus[index+'|'+i] ? 'primary' : 'info'"
            :effect="'light'"
            :closable="isActive"
            :disable-transitions="true"
            :hit="false"
            @mouseover.native="$set(tabFocus, index+'|'+i, true)"
            @mouseout.native="$set(tabFocus, index+'|'+i, false)"
            @click.stop="openTab(i, getKeyType($event))"
            @close.stop="deleteTab(i)">
            <!-- 都不行 -->
            <!-- :scroll-container="'.main[data-text=\''+index+'\']'" -->
            <!-- :scroll-container="$refs.list.$el && $refs.list.$el.children[index].children[1]" -->
              <!-- :lazy="tagConfig.tag_line_count*tagConfig.tag_row_count >= i" -->
            <el-image
              v-if="isLoad"
              :src="getIcon(tab.icon, tab.url, tagConfig.tag_font_size)"
              :style="{ width: tagConfig.tag_font_size+'px',
                        height: tagConfig.tag_font_size+'px',
                        marginRight: tagConfig.tag_padding_left+'px' }"
              fit="cover"
              :lazy="false">
              <div slot="error" class="image-slot">
                <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder" class="image-slot">
                <!-- <img src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
              </div>
            </el-image>
            <!-- <div
              class="title"
              :style="{ fontSize: tagConfig.tag_font_size+'px',
                        width: 'calc(100% - '
                              +( tagConfig.tag_font_size+tagConfig.tag_padding_left*1
                                + (isActive ? 20 : 0) )
                              +'px' }"
              v-html="highlightMap[index][i].title || highlightMap[index][i].url"></div> -->
            <div
              class="title"
              :style="{ fontSize: tagConfig.tag_font_size+'px',
                        width: 'calc(100% - '
                              +( tagConfig.tag_font_size+tagConfig.tag_padding_left*1
                                + (isActive ? 20 : 0) )
                              +'px' }"
              v-html="tabFocus[index+'|'+i] || storageKeyword != ''
                    ? highlightMap[index][i].title || highlightMap[index][i].url
                    : beautifyTitle(highlightMap[index][i].title) || getDomain(highlightMap[index][i].url)"></div>
          </el-tag>
        </template>
        <template v-else>
          <div
          class="title"
          style="display:flex; overflow: hidden; align-items: center;"
          :style="{ fontSize: config.list_font_size+'px' }">
            <el-image
              v-if="isLoad"
              :src="iconMap[index]"
              fit="cover"
              :style="{ width: config.list_font_size+'px',
                        height: config.list_font_size+'px' }"
              :scroll-container="$refs.list.$el"
              :lazy="index >= config.item_show_count">
              <div slot="error" class="image-slot">
                <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder" class="image-slot">
                <!-- <img src="@/assets/fallback.png" style="width:100%; height: 100%;" /> -->
              </div>
            </el-image>
            <span
              style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;"
              v-html="isSelected || storageKeyword != ''
                    ? (highlightMap[index][0].title || highlightMap[index][0].url)
                    : (beautifyTitle(highlightMap[index][0].title) || getDomain(highlightMap[index][0].url))"></span>
            <!-- <span
              style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;"
              v-html="highlightMap[index][0].title || highlightMap[index][0].url"></span> -->
            <!-- <span style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;">{{ item.tabs[0].title || item.tabs[0].url }}</span> -->
          </div>
          <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              marginLeft: (config.list_font_size+5)+'px' }"
              v-html="storageKeyword == ''
                    ? highlightMap[index][0].domain
                    : highlightMap[index][0].url"></div>
          <!-- <div
            class="sub-title"
            :style="{
              fontSize: config.list_explain_font_size+'px',
              color: isSelected
                    ? config.list_explain_focus_font_color
                    : config.list_explain_font_color,
              marginLeft: (config.list_font_size+5)+'px' }">
              {{ getDomain(item.tabs[0].url) }}
          </div> -->
        </template>
      </div>

      <div
        class="right"
        :style="{ paddingLeft: isActive ? '5px' : '10px' }"
        @click.stop="focus">
        <div v-if="isActive && isShowOperationButton">
          <i
            class="el-icon-copy-document hover"
            @click="_openWindow(getKeyType($event))"
            :style="{
              color:config.list_focus_font_color}"></i>
          <i
            class="el-icon-close hover"
            @click="deleteTemporary"
            :style="{
              color:config.list_focus_font_color}"></i>
        </div>
        <template v-if=" ! isActive">
          <span
            :style="{
              fontSize: config.list_state_size+'px',
              color: isSelected
                ? config.list_focus_state_color
                : config.list_state_color,
            }">{{ timeShow(item.lastVisitTime) }}</span>
        </template>
        <template v-if=" ! isActive">
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
              color: config.list_keymap_color }">
            <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
            <!-- <font style="font-family: Consolas, Monaco, monospace;">{{ -->
            <font
              style="display:inline-block;text-align:left;"
              :style="{ width: (config.list_keymap_size/2)+'px' }">{{
                1 > index-$refs.list.scrollLines+1
              ? 1
              : (index-$refs.list.scrollLines+1 > config.item_show_count
                ? config.item_show_count
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
        style="padding: 10px;"
        :style="{
          width: (config.item_height-20)+'px',
          height: (config.item_height-20)+'px' }">
        <svg-icon
          :name="item.svg"
          style="width:100%; height: 100%;"
          :style="{ color: isSelected
                          ? config.list_focus_icon_color
                          : config.list_icon_color, }"></svg-icon>
      </span>

      <div
        class="main"
        style="flex-direction: column;justify-content: space-evenly;">
        <div
          class="title"
          :style="{ fontSize: config.list_font_size+'px' }"
          v-html="highlight(item.name, storageKeyword.substr(config.workspace_change_word.length).trim().split(/\s+/)[0], '<strong>', '</strong>')"></div>
        <div
          v-if="isSelected && item.tip != ''"
          class="sub-title"
          :style="{
            fontSize: config.list_explain_font_size+'px',
            color: isSelected
                  ? config.list_explain_focus_font_color
                  : config.list_explain_font_color }"
            v-html="item.tip"></div>
      </div>

      <div class="right">
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
            color: config.list_keymap_color }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
          <!-- <font style="font-family: Consolas, Monaco, monospace;">{{ -->
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (config.list_keymap_size/2)+'px' }">{{
              1 > index-$refs.list.scrollLines+1
            ? 1
            : (index-$refs.list.scrollLines+1 > config.item_show_count
              ? config.item_show_count
              : index-$refs.list.scrollLines+1)
          }}</font>
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
  name: 'Temporary',
  inject: ['focus', 'statusTip', 'input'],
  props: {
    config: {
      type: Object,
      required: require,
    },
    project_config: {
      type: Object,
      required: require,
    },
    isLoad: {
      type: Boolean,
      required: false,
      default: true,
    },
    // keyType: {
    //   type: String,
    //   required: false,
    //   default: '',
    // },
    activeWorkspace: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      list: [],
      cacheList: [],
      storageList: [],

      scrollDisabled: true,
      storageKeyword: null,

      currentIndex: -1,

      isSearched: false,
      isFinish: false,

      tabFocus: {},

      isOperating: false,

      isShowOperationButton: true,
    }
  },
  components: {
    List,
  },
  computed: {
    workspaceSwitch() {
      return ! ( this.storageKeyword == undefined
              || this.config.workspace_change_word == undefined
              || this.config.workspace_change_word.length == 0
              || this.storageKeyword.startsWith(this.config.workspace_change_word) == false);
    },
    workspaceList() {
      return this.config.workspaces.filter(
        workspace => workspace != 'temporary'
      ).map(workspace => ({
        type: workspace,
        name: this.lang(workspace) + ( this.lang(workspace) == workspace ? '' : ` (${workspace}) `),
        svg: this.project_config.allWorkspaces[ workspace ].svg,
      }));
    },
    workspaceStorageKeyword() {
      return this.storageKeyword.substr(this.config.workspace_change_word.length).trim();
    },

    iconMap() {
      console.log('getIcon:iconMap');
      let a = new Date().getTime();

      let ss = this.list.map((item, index) => {
        return this.getIcon(item.tabs[0].icon, item.tabs[0].url, this.config.list_font_size);
      })
      let b = new Date().getTime();
      console.log('getIcon:iconMap', (b-a)/1000);

      return ss;
    },
    highlightMap() {
      console.log('===========================hh')

      let a = new Date().getTime();

      // 速度其实差不多
      // let highlightMap = new Array(this.list.length);
      // this.list.forEach((item, index) => {
      //   let highlightMap2 = new Array(item.tabs.length);
      //   item.tabs.map((tab, i) => {
      //     highlightMap2[i] = {
      //       title: this.highlight(tab.title, this.storageKeyword, '<strong>', '</strong>'),
      //       url: this.highlight(tab.url, this.storageKeyword, '<strong>', '</strong>'),
      //       domain: this.highlight(this.getDomain(tab.url), this.storageKeyword, '<strong>', '</strong>'),
      //     }
      //   })

      //   highlightMap[index] = highlightMap2;
      // });

      // 速度非常非常快，无需再缓存优化
      // 这种实现方式非常简单，而且改造方便，并且兼容所有可能情况，如修改标题
      let highlightMap = this.list.map(item => {
        return item.tabs.map(tab => {
          return {
            title: this.highlight(tab.title, this.storageKeyword, '<strong>', '</strong>'),
            url: this.highlight(tab.url, this.storageKeyword, '<strong>', '</strong>'),
            domain: this.highlight(this.getDomain(tab.url), this.storageKeyword, '<strong>', '</strong>'),
          }
        })
      })

      let b = new Date().getTime();

      console.log('===h', (b-a)/1000);

      return highlightMap;
    },

    // 行数尽可能多，字体尽可能大
    tagConfig() {
      let item_height = this.config.item_height;
      let border = 1; // 上下左右

      let tag_margin_top_min = 3;
      // let tag_margin_right_min = 3; // 和 tag_margin_top_min 相同
      // let tag_padding_min = 3; // 和 tag_margin_top_min 相同
      let tag_font_size_min = 12;
      let tag_row_count_min = 1;
      // let tag_line_count_min = 1;

      let tag_margin_top_max = 10;
      // let tag_margin_right_max = 10; // 同上
      // let tag_padding_max = 3; // 同上
      let tag_font_size_max = this.config.list_font_size;
      // let tag_row_count_min = 0; // 不限制
      // let tag_line_count_max = 0; // 不限制

      // 使用从小变大的原则，以下是变化顺序
      // tag_line_count
      // tag_font_size
      // tag_margin_top
      // adjust （反计算得出）

      // 提示
      //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
      //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
      //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

      // tag_row_count_min
      let tag_row_count = tag_row_count_min;
      let row_count = Math.floor((item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2));
      if(row_count > tag_row_count_min) {
        tag_row_count = row_count;
      }
console.log('oooooooooooo', tag_row_count, (item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2))
console.log('oooooooo2', 3*(tag_font_size_min+tag_margin_top_min*3+border*2)+tag_margin_top_min);
      // tag_font_size
      let tag_font_size = tag_font_size_min;
      let font_size = (item_height-tag_margin_top_min)/tag_row_count-tag_margin_top_min*3-border*2;
      if(font_size > tag_font_size_min) {
        tag_font_size = font_size >= tag_font_size_max ? tag_font_size_max : font_size;
      }

      // tag_margin_top
      let tag_margin_top = tag_margin_top_min;
      let margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
      if(margin_top > tag_margin_top_min) {
        tag_margin_top = margin_top >= tag_margin_top_max ? tag_margin_top_max : margin_top;
      }

      let tag_padding_top = tag_margin_top;

      // 提示
      //item_height = tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top
      //item_height = tag_row_count*(tag_font_size+tag_margin_top*3+border*2)+tag_margin_top
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count)
      //tag_padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2
      //tag_margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count)

      let height = (tag_margin_top*3+tag_font_size+border*2)*tag_row_count+tag_margin_top;
      if(height < item_height) {
        console.log('tagConfig 有剩余空间', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})

        // 和 字体 优先不同，这里由于是按 tag_row_count 优先计算，其它值都是最小的了，如果再强塞一个，会导致它们被强制缩小
        // tag_row_count++;

        // 由于没有强制添加行，所以这里其实是放大

        // 先放大 tag_font_size
        let font_size = (item_height-tag_margin_top)/tag_row_count-tag_margin_top*3-border*2;
        tag_font_size = font_size >= tag_font_size_max ? tag_font_size_max : font_size;

        if(tag_font_size != font_size) {

          // 再放大 tag_margin_top
          margin_top = (item_height-tag_row_count*(tag_font_size+border*2))/(1+3*tag_row_count);
          tag_margin_top = margin_top >= tag_margin_top_max ? tag_margin_top_max : margin_top;
          tag_padding_top = tag_margin_top;

          if(tag_margin_top != margin_top) {

            // 强制缩小 tag_padding_top 直到 1
            let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
            tag_padding_top = padding_top <= 1 ? 1 : padding_top;
            console.error('强制缩小 tag_padding_top 直到 1', tag_padding_top)

            if(tag_padding_top != padding_top) {
              // 强制缩小 tag_margin_top 直到 1
              margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
              tag_margin_top = margin_top <= 1 ? 1 : margin_top;
              console.error('强制缩小 tag_margin_top 直到 1', tag_margin_top)

              if(tag_margin_top != margin_top) {
                console.error('tagConfig 我尽力了');
              }
            }
          }
        }
      } else if(height > item_height) {
        console.log('tagConfig 空间不够', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})
alert('空间不够')
        // 空间不够，此时全部值都应该是最小值

        // 强制缩小 tag_padding_top 直到 1
        let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
        tag_padding_top = padding_top <= 1 ? 1 : padding_top;
        console.error('强制缩小 tag_padding_top 直到 1', tag_padding_top)

        if(tag_padding_top != padding_top) {
          // 强制缩小 tag_margin_top 直到 1
          margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
          tag_margin_top = margin_top <= 1 ? 1 : margin_top;
          console.error('强制缩小 tag_margin_top 直到 1', tag_margin_top)

          if(tag_margin_top != margin_top) {
            console.error('tagConfig 我尽力了');
          }
        }
      } else {
        // 相等则说明找到了合适的值
        console.log('tagConfig 值完全合适', {height, item_height, tag_row_count, tag_font_size, tag_margin_top})
        // alert('值完全合适')
      }

      console.log('tagConfig 上下计算结果', tag_row_count, tag_font_size, tag_margin_top, tag_padding_top)

      // 开放给用户设置
      let tag_line_count = this.config.tag_line_count;

      let tag_margin_right = tag_margin_top;
      let tag_padding_left = tag_margin_top;

      console.log('tagConfig 最后结果', {
        tag_row_count,
        tag_line_count,

        tag_font_size,

        tag_margin_top,
        tag_margin_right,

        tag_padding_top,
        tag_padding_left,

        height: (tag_padding_top*2+tag_font_size)+'px',
        width: 'calc(100% / '+tag_line_count+' - '+(tag_padding_left*2+1*2+tag_margin_right)+'px)',
        margin: tag_margin_top+'px '
              + tag_margin_right+'px 0px 0px',
        padding: tag_padding_top+'px '
                +tag_padding_left+'px',

        item_height: tag_row_count*(tag_font_size+tag_padding_top*2+tag_margin_top+border*2)+tag_margin_top,
      })

      return {
        tag_row_count,
        tag_line_count,

        tag_font_size,

        tag_margin_top,
        tag_margin_right,

        tag_padding_top,
        tag_padding_left,
      }
    },

    currentTemporary() {
      if(this.list.length <= 0 || this.currentIndex >= this.list.length) return null;
      return this.list[ this.currentIndex ];
    },
    currentStorageIndex() {
      return this.storageList.findIndex(temporary => {
        return temporary.id == this.currentTemporary.id;
      });
    },

    isActiveWorkspace() {
      return this.activeWorkspace.type == 'temporary';
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
          '--list-explain-highlight-color': this.config.list_explain_focus_highlight_color,
          '--list-explain-highlight-weight': this.config.list_explain_focus_highlight_weight,
        }
      } else {
        return {
          'background-color': this.config.list_background_color,
          'color': this.config.list_font_color,
          '--list-highlight-color': this.config.list_highlight_color,
          '--list-highlight-weight': this.config.list_highlight_weight,
          '--list-explain-highlight-color': this.config.list_explain_highlight_color,
          '--list-explain-highlight-weight': this.config.list_explain_highlight_weight,
        }
      }
    },

    hideOperationButton() {
      console.log('mousemove', this.lock)

      this.isShowOperationButton = false;
    },
    mainEnter(event) {
      console.log('temporary:mainEnter', event);
      // 注意切换工作区时是 非Active的，但依然要绑定，因为会 mousemove，不然就监听不到了
      event.target.addEventListener('scroll', this.hideOperationButton);
    },
    mainLeave(event) {
      console.log('temporary:mainLeave', event);
      event.target.removeEventListener('scroll', this.hideOperationButton);
      this.isShowOperationButton = true;
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
      console.log('copy', this.currentTemporary)

      if(this.currentTemporary == null) return;

      // 工作区切换
      if(this.workspaceSwitch) return

      let urls = this.currentTemporary.tabs.reduce((accumulator, temporary, index) => {
        if(index == 0) return temporary.url;
        else return accumulator+"\n"+temporary.url;
      }, '');
      console.log('copy2', urls, urls == '')
      if(urls == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: urls,
        count: this.currentTemporary.tabs.length,
      })
    },

    search(keyword) {
console.log('temporary.search', keyword, '|', this.storageKeyword);
      // 无参数时则强制刷新
      if(keyword != undefined) {
        if(this.storageKeyword == keyword.trim()) return;
        this.storageKeyword = keyword.trim();
      }
console.log('temporary.search2', keyword, '|',  this.storageKeyword);

      // 展示工作区
      if(this.workspaceSwitch) {
        this.showWorkspaceList();
        return;
      }

      // 查找
      let keywords = this.storageKeyword.toUpperCase().split(/\s+/);
      let filterList = this.storageList.filter(temporary => {
        for(let tab of temporary.tabs) {
          let isMatch = true;
          for(let keyword of keywords) {
            // 关键词需全部匹配
            let title = tab.title.toUpperCase();
            let url = tab.url.toUpperCase();
            if(title.indexOf(keyword) == -1
            && url.indexOf(keyword) == -1) {
              isMatch = false;
              break;
            }
          }
          // 只要有一个搜到就成功
          if(isMatch) {
            return true;
          }
        }
        return false;
      })

      // 列表赋值
      this.cacheList = filterList;
      this.list = this.cacheList.slice(0, this.config.list_page_count);
      this.currentIndex = this.list.length > 0 ? 0 : -1;
      this.scrollDisabled = this.list.length >= this.cacheList.length;

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
    },
    load() {
      // 加载数据
      this.list.push(...this.cacheList.slice(this.list.length, this.list.length+this.config.list_page_count))
      this.scrollDisabled = this.list.length >= this.cacheList.length;
    },
    add(callback) {
      if( ! this.isFinish) return;
      if(this.isOperating) return;
      this.isOperating = true;

      new Promise((resolve) => {
        // 获取当前窗口的所有标签
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          let highlightCount = tabs.reduce((accumulator, tab) => {
            return accumulator+( ! tab.active && tab.highlighted ? 1 : 0);
          }, 0)

          resolve(highlightCount)
        })
      }).then((highlightCount) => {
        console.log({highlightCount})

        const h = this.$createElement;
        let message = null;
        if(highlightCount > 0) {
          message = h('p', {style: {'text-align': 'center'}}, [
            h('el-button', {props: {size: 'mini', type: 'info', plain: true}, on: {click: () => this._add('not-selected', callback)}}, '保存非选中标签页'),
            h('el-button', {class: 'autofocus', props: {size: 'mini', plain: true}, on: {click: () => this._add('selected', callback)}}, '保存选中标签页'),
            h('div', {style: {margin: '10px 0 0 0'}}, null),
            h('el-button', {props: {size: 'mini', type: 'primary', plain: true, round: true}, on: {click: () => this._add('all', callback)}}, '保存全部标签页'),
          ])
        } else {
          message = h('p', {style: {'text-align': 'center'}}, [
            h('el-button', {props: {size: 'mini'}, on: {click: () => this._add('left', callback)}}, '保存左侧标签页'),
            h('el-button', {props: {size: 'mini'}, on: {click: () => this._add('only-this', callback)}}, '仅保存此标签页'),
            h('el-button', {props: {size: 'mini'}, on: {click: () => this._add('right', callback)}}, '保存右侧标签页'),
            h('div', {style: {margin: '10px 0'}}, null),
            h('el-button', {props: {size: 'mini', type: 'info', plain: true}, on: {click: () => this._add('except-this', callback)}}, '保存除此标签页以外的标签页'),
            h('div', {style: {margin: '10px 0 0 0'}}, null),
            h('el-button', {class: 'autofocus', props: {size: 'mini', type: 'primary', plain: true, round: true}, on: {click: () => this._add('all', callback)}}, '保存全部标签页'),
          ])
        }

        this.$msgbox({
          title: '注意：标签页保存后将被自动关闭',
          message: message,
          dangerouslyUseHTMLString: true,
          showConfirmButton: false,
          showCancelButton: false,
          closeOnClickModal: true,
          customClass: 'window-message-box',
          center: false,
          callback: (action, instance, done) => {
            console.log('callback', action, instance, done);
            // 其实只有取消会调到这里，
            if(action == 'cancel') {
              callback(false);
              this.isOperating = false;
            }
          }
        });
        this.$nextTick(() => {
          // 由于弹框是 createElement 创建的，此时 button 还没有被渲染，所以要再放到下一个事件流中
          this.$nextTick(() => {
            document.querySelector('.el-button.autofocus').focus();
          })
        })
      })
    },
    _add(type, callback) {
      let currentWindowId = -1;

      new Promise((resolve) => {
        // 获取当前窗口的所有标签
        chrome.tabs.query({
          currentWindow: true
        }, tabs => {
          currentWindowId = tabs[0].windowId;
          resolve(tabs)
        })
      }).then((tabs) => {
        // 提取需要保存的标签
        if(type == 'all') return tabs;

        if(type == 'only-this') return [ tabs.find((tab) => { return tab.active; }) ];
        if(type == 'except-this') return tabs.filter((tab) => { return ! tab.active; });
        if(type == 'left') return tabs.slice(0, tabs.findIndex((tab) => { return tab.active; }));
        if(type == 'right') return tabs.slice(tabs.findIndex((tab) => { return tab.active; })+1);

        if(type == 'selected') return tabs.filter((tab) => { return tab.highlighted; });
        if(type == 'not-selected') return tabs.filter((tab) => { return ! tab.highlighted; });

        return [];
      }).then((tabs) => {
        if(tabs.length <= 0) return tabs;

        if(tabs.some(tab => ! tab.url && ! tab.pendingUrl)) {
          return Promise.reject();
        }

        // 新增数据
        this.storageList.unshift({
          id: nanoid(),
          lastVisitTime: new Date().getTime(),
          tabs: tabs.map(tab => {
            // 去除末尾 /
            tab.url = tab.url == '' && tab.pendingUrl
                    ? tab.pendingUrl.replace(/(\/*$)/g,"")
                    : tab.url.replace(/(\/*$)/g,"");

            return {
              icon: tab.favIconUrl,
              url: tab.url,
              title: tab.title,
            }
          }),
        });

        // 保存数据
        return new Promise((resolve) => {
          chrome.storage.local.set({temporary: this.storageList}, () => {
            resolve(tabs);
          });
        })
      }).then((tabs) => {
        if(type == 'all') {
          // 关闭当前窗口（这样恢复时才不会出现一个标签一个标签关闭的情况）
          chrome.windows.remove(currentWindowId);
        } else if(tabs.length > 0){
          // 关闭保存的标签
          chrome.tabs.remove(tabs.map(tab => {
            return tab.id;
          }))
        }

        // 这样列表才会被触发更新，不能为 undefined，否则会报错，不自动选择第二项
        this.storageKeyword = ' ';
        callback(true);

        this.$msgbox.close();
        this.isOperating = false;

        this.statusTip('临时窗口添加成功');

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'temporary', operation: 'add'});
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
      if(this.currentTemporary == null) return;

      // 工作区切换
      if(this.workspaceSwitch) {
        this.changeWorkspace();
        return;
      }

      let urls = this.currentTemporary.tabs.map(tab => tab.url);
      let blankTabId = -1;

      // 打开新窗口
      new Promise(resolve => {
        // 获取当前标签信息
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          // 记录空白标签
          if(tabs[0].url == "chrome://newtab/") {
            blankTabId = tabs[0].id;
          }
          resolve();
        })
      }).then(() => {
        // 更新数据（移除该临时窗口）
        this.storageList.splice(this.currentStorageIndex, 1);
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);
        return new Promise(resolve => {
          chrome.storage.local.set({temporary: this.storageList}, () => {
            // 让 all 保持数据同步
            chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'temporary', operation: 'delete'});
            resolve();
          });
        })
      }).then(() => {
        if(keyType == 'meta/ctrl') {
          // 当前窗口打开，且不关闭
          // 不自动关闭空白标签页，有隔离作用
          blankTabId = -1;
          return Promise.all(urls.map((url) => {
            return new Promise((resolve) => {
              chrome.tabs.create({url: url, active: false}, (tab) => {
                resolve(tab.index);
              });
            });
          }))
        } else if(keyType == 'alt') {
          // 当前窗口打开，且不关闭，也不进行存储更新
          // 会高亮标签
          blankTabId = -1;
          return new Promise((resolve) => {
            Promise.all(urls.map((url) => {
              return new Promise((resolve2) => {
                chrome.tabs.create({url: url, active: false}, (tab) => {
                  resolve2(tab.index);
                });
              });
            })).then((indexs) => {
              chrome.tabs.highlight({tabs: indexs})
              resolve(indexs);
            })
          })
        } else {
          // 直接回车 或 shift 方式打开（panel 只支持一个网页，没法玩）
          //let type = this._device.platform != '' && event.shiftKey ? 'panel' : 'normal';
          let type = 'normal';
          return new Promise(resolve => {
            // 新建新窗口（先不激活，否则无法存储数据）
            chrome.windows.create({ url: urls, focused: true, type: type }, window => {
              resolve(window)
            })
          })
        }
      }).then((window) => {
        // 关闭空白标签
        if(blankTabId != -1) {
          chrome.tabs.remove(blankTabId);
        }
      })
    },
    changeWorkspace() {
      let keywords;
      let keyword = this.workspaceStorageKeyword.toUpperCase().split(/\s+/)[0];
      if(this.workspaceList.some(workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 )) {
        keywords = this.workspaceStorageKeyword.split(/\s+/).slice(1).join(' ');
      } else {
        keywords =  this.workspaceStorageKeyword.split(/\s+/).join(' ');
      }
      this.input(keywords, this.currentTemporary.type, true);
    },
    choice(index) {
      return this.$refs.list.choice(index);
    },
    openTab(i, keyType) {
      // 先删除标签
      let url = this.currentTemporary.tabs[i].url;
      if(this.storageList[this.currentStorageIndex].tabs.length == 1) {
        this.storageList.splice(this.currentStorageIndex, 1);
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);
      } else {
        this.storageList[this.currentStorageIndex].tabs.splice(i , 1);
      }
      chrome.storage.local.set({temporary: this.storageList}, () => {
        // 再打开
        this.$open(url, keyType);

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'temporary', operation: 'delete'});

        this.focus();
      });
    },
    deleteTab(i) {
      if(this.currentTemporary.tabs.length == 1) {
        this.deleteTemporary();
        return;
      }

      this.storageList[this.currentStorageIndex].tabs.splice(i , 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
        this.focus();

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'temporary', operation: 'delete'});
      });
    },
    deleteTemporary() {
      this.storageList.splice(this.currentStorageIndex, 1);
      chrome.storage.local.set({temporary: this.storageList}, () => {
        this.cacheList.splice(this.currentIndex, 1);
        this.list.splice(this.currentIndex, 1);

        // 让 all 保持数据同步
        chrome.runtime.sendMessage({ type: 'global_data_change', workspace: 'temporary', operation: 'delete'});
      });
    },
  },
  mounted() {
    // todo
    window.t = this;

    // 获取本地数据
    chrome.storage.local.get({temporary: []}, items => {
      this.storageList = items.temporary;

      this.isFinish = true;
      this.$emit('finish');

      // 更新列表
      // this.search();
    });

    // 保持数据同步
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if(request.type == 'data_change' && request.workspace == 'temporary') {
        // 默认全部但不包括自己
        if(request.exclude == undefined) return;
        // 被排除了则不处理
        if(request.exclude.indexOf('temporary') != -1) return;
console.log('temporary:data_change', this.isActiveWorkspace)

        // 重新获取数据
        chrome.storage.local.get({temporary: []}, items => {
          this.storageList = items.temporary;

          // 当前工作区是本工作区则刷新列表，否则记录一下
          if(this.isActiveWorkspace) {
            this.search();
          } else {
            // 这样列表才会被触发更新，不能为 undefined，否则会报错，不自动选择第二项
            this.storageKeyword = ' ';
          }
        });
      }
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
  padding: 5px;
  text-align: center;
  cursor: default;
}
.list >>> .list-item .image {
  /* background-color: #c0c4cb; */
  border-radius: 5px;
  border: 2px solid #c0c4cb;
  text-align: center;
  display: flex;
  /* box-shadow: 1px 1px 2px 2px #ebeef5; */
  flex-direction: column;
  /* justify-content: space-evenly; */
  justify-content: center;
}
.image .a {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* font-size: 16px; */
  font-size: 12px;
  /* transform : scale(16/12, 16/12); */
}
.image .b {
  overflow: hidden;
  white-space: nowrap;
  font-size: 12px;
  /* transform : scale(0.5,0.5); */
}
.list >>> .list-item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  /*align-items: flex-start;*/ /* flex-wrap = wrap 才有效 */

  /* flex-direction: column;
  flex-wrap: nowrap;
  align-content: normal;
  justify-content: center; */

  /* flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start; */

/*
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start; */
}

.list >>> .list-item .main.scroll{
  overflow-x: overlay;
}
/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
.list >>> .list-item .main.scroll::-webkit-scrollbar {
  height: 10px;
  background: transparent;
}
/*定义滑块圆角*/
.list >>> .list-item .main.scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(115 115 115 / 50%);
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

.list >>> .list-item .right .el-icon-copy-document {
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

.el-tag {
  line-height: 1;
  overflow: hidden;
  box-sizing: content-box;
  cursor: pointer;
  display:flex;
  align-items: center;
}
.el-tag .el-image{
  /* vertical-align: middle; */

}
.el-tag .tab-title {
  display: inline-block;
  vertical-align: top;
  overflow: hidden;
  /* vertical-align: middle; */

  /* display: inline-block;
  flex: 1;
  overflow: hidden; */
  /* text-overflow: ellipsis;
  white-space: nowrap; */
}
</style>
<style>
.temporary .el-tag .el-icon-close {
  top: 1px;
}

.temporary .title strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
.temporary .sub-title strong {
  color: var(--list-explain-highlight-color);
  font-weight: var(--list-explain-highlight-weight);
}
</style>