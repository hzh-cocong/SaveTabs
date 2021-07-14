<template>
  <div
    class="temporary-item"
    :style="{
      backgroundColor: isSelected
                      ? currentThemeConfig.list_focus_background_color
                      : currentThemeConfig.list_background_color,
      color: isSelected
            ? currentThemeConfig.list_focus_font_color
            : currentThemeConfig.list_font_color,

      '--list-highlight-color': isSelected
                              ? currentThemeConfig.list_focus_highlight_color
                              : currentThemeConfig.list_highlight_color,
      '--list-highlight-weight': isSelected
                                ? currentThemeConfig.list_focus_highlight_weight
                                : currentThemeConfig.list_highlight_weight,
    }">
    <span
      class="left"
      style="position: relative"
      :style="{
        width: currentThemeConfig.item_height+'px',
        padding: (currentThemeConfig.item_height*1/10)+'px', }">
      <div class="image">
        <div class="a" :style="{ fontSize: (currentThemeConfig.item_height*2/5)+'px' }">{{ item.tabs.length}}</div>
        <!-- <div class="b" :style="{ fontSize: (currentThemeConfig.item_height*1/8)+'px' }">{{ lang('temporaryTabTip') }}</div> -->
      </div>
      <svg-icon
        class="workspace-logo"
        :name="projectConfig.allWorkspaces[ 'temporary' ].svg"
        :style="{ color: isSelected
                        ? currentThemeConfig.list_focus_icon_color
                        : currentThemeConfig.list_icon_color,
                  width: currentThemeConfig.item_height/4+'px',
                  height: currentThemeConfig.item_height/4+'px', }"></svg-icon>
    </span>
    <div
      class="main"
      :class="{ scroll: isActive }"
      :style="{
        'flex-direction': ! isSelected ? 'column' : 'column',
        'justify-content': ! isSelected ? 'space-evenly' : 'flex-start',
        'flex-wrap': ! isSelected ? 'nowrap' : 'wrap',
        'align-content': ! isSelected ? 'normal' : 'flex-start',
        'align-items': ! isSelected ? 'normal' : 'flex-start',
        }"
      @mouseenter="mainEnter"
      @mouseleave="mainLeave">
          <!-- :title="tab.title+'\r\n'+tab.url" -->
      <template v-if="isSelected">
        <el-tag
          v-for="(tab, i) in item.tabs"
          :key="i"
          :style="{ height: tagConfig.tag_font_size+'px',
                    width: 'calc(100% / '+(storageKeyword == '' || item.tabs.length > tagConfig.tag_line_count ? tagConfig.tag_line_count : item.tabs.length)
                                          +' - '+(tagConfig.tag_padding_left*2+1*2+tagConfig.tag_margin_right)+'px)',
                    margin: tagConfig.tag_margin_top+'px '
                          + tagConfig.tag_margin_right+'px 0px 0px',
                    padding: tagConfig.tag_padding_top+'px '
                            +tagConfig.tag_padding_left+'px' }"
          type='info'
          :effect="'light'"
          :closable="false"
          :disable-transitions="true"
          :hit="false">
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
            <div slot="placeholder" class="image-slot"></div>
          </el-image>
          <div
            class="title"
            :style="{ fontSize: tagConfig.tag_font_size+'px',
                      width: 'calc(100% - '
                            +( tagConfig.tag_font_size+tagConfig.tag_padding_left*1
                              + (isActive ? 20 : 0) )
                            +'px' }"
            v-html="highlight(tab.title, storageKeyword, '<strong>', '</strong>')
                  || highlight(tab.url, storageKeyword, '<strong>', '</strong>')"></div>
        </el-tag>
      </template>
      <template v-else>
        <div
        class="title"
        style="display:flex; overflow: hidden; align-items: center;"
        :style="{ fontSize: currentThemeConfig.list_font_size+'px' }">
          <el-image
            v-if="isLoad"
            :src="getIcon(item.tabs[0].icon, item.tabs[0].url, currentThemeConfig.list_font_size)"
            fit="cover"
            :style="{ width: currentThemeConfig.list_font_size+'px',
                      height: currentThemeConfig.list_font_size+'px' }"
            :scroll-container="$parent.$el"
            :lazy="index >= currentThemeConfig.item_show_count">
            <div slot="error" class="image-slot">
              <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
            </div>
            <div slot="placeholder" class="image-slot"></div>
          </el-image>
          <span
            style="margin-left: 5px;flex: 1; overflow: hidden; text-overflow: ellipsis;"
            v-html="isSelected || storageKeyword != ''
                  ? ( highlight(item.tabs[0].title, storageKeyword, '<strong>', '</strong>')
                    || highlight(item.tabs[0].url, storageKeyword, '<strong>', '</strong>'))
                  : (beautifyTitle(item.tabs[0].title) || getDomain(item.tabs[0].url))"></span>
        </div>
        <div
          class="sub-title"
          :style="{
            fontSize: currentThemeConfig.list_explain_font_size+'px',
            color: isSelected
                  ? currentThemeConfig.list_explain_focus_font_color
                  : currentThemeConfig.list_explain_font_color,
            marginLeft: (currentThemeConfig.list_font_size+5)+'px' }"
            v-html="storageKeyword == ''
                  ? getDomain(item.tabs[0].url)
                  : highlight(item.tabs[0].url, storageKeyword, '<strong>', '</strong>')"></div>
      </template>
    </div>

    <div
      class="right"
      :style="{ paddingLeft: isActive ? '5px' : '10px' }"
      @click.stop>
      <template v-if="isActive && isShowOperationButton">
        <svg-icon
          class="el-icon-close hover"
          :name="projectConfig.allWorkspaces[ 'temporary' ].svg"
          @click.native.stop="switchTo(getKeyType($event))"></svg-icon>
      </template>
      <template v-if=" ! isActive">
        <span
          :style="{
            fontSize: currentThemeConfig.list_state_size+'px',
            color: isSelected
              ? currentThemeConfig.list_focus_state_color
              : currentThemeConfig.list_state_color,
          }">{{ timeShow(item.lastVisitTime) }}</span>
      </template>
      <template v-if=" ! isActive">
        <span
          v-if="isSelected"
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: currentThemeConfig.list_focus_keymap_color,
          }">↩</span>
        <span
          v-else
          :style="{
            fontSize: currentThemeConfig.list_keymap_size+'px',
            color: showIndex <= 0
                ? 'transparent'
                : currentThemeConfig.list_keymap_color }">
          <font>{{ (_device.platform == 'Mac' ? '⌘' : 'Alt+') }}</font>
          <font
            style="display:inline-block;text-align:left;"
            :style="{ width: (currentThemeConfig.list_keymap_size/2)+'px' }">{{ showIndex }}</font>
        </span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TemporaryItem',
  inject: ['input'],
  props: {
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
    index: {
      type: Number,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    showIndex: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    storageKeyword: {
      type: String,
      required: false,
      default: '',
    }
  },
  data(){
    return {
      isShowOperationButton: true,
    }
  },
  computed: {
    // 行数尽可能多，字体尽可能大
    tagConfig() {
      console.log('temporaryItem:computed:tagConfig')

      let item_height = this.currentThemeConfig.item_height;
      let border = 1; // 上下左右

      let tag_margin_top_min = 3;
      let tag_font_size_min = 12;
      let tag_row_count_min = 1;

      let tag_margin_top_max = 10;
      let tag_font_size_max = this.currentThemeConfig.list_font_size;

      let tag_row_count = tag_row_count_min;
      let row_count = Math.floor((item_height-tag_margin_top_min)/(tag_margin_top_min*3+tag_font_size_min+border*2));
      if(row_count > tag_row_count_min) {
        tag_row_count = row_count;
      }

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

      let height = (tag_margin_top*3+tag_font_size+border*2)*tag_row_count+tag_margin_top;
      if(height < item_height) {
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
            if(tag_padding_top != padding_top) {
              // 强制缩小 tag_margin_top 直到 1
              margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
              tag_margin_top = margin_top <= 1 ? 1 : margin_top;
            }
          }
        }
      } else if(height > item_height) {
        // 空间不够，此时全部值都应该是最小值

        // 强制缩小 tag_padding_top 直到 1
        let padding_top = ((item_height-tag_margin_top)/tag_row_count-tag_font_size-tag_margin_top-border*2)/2;
        tag_padding_top = padding_top <= 1 ? 1 : padding_top;

        if(tag_padding_top != padding_top) {
          // 强制缩小 tag_margin_top 直到 1
          margin_top=(item_height-tag_row_count*(tag_font_size+tag_padding_top*2+border*2))/(1+tag_row_count);
          tag_margin_top = margin_top <= 1 ? 1 : margin_top;
        }
      }

      // 开放给用户设置
      let tag_line_count = this.currentThemeConfig.tag_line_count;

      let tag_margin_right = tag_margin_top;
      let tag_padding_left = tag_margin_top;

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
  },
  methods: {
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

    switchTo(keyType) {
      if(keyType == 'meta/ctrl') {
        this.input(null, 'temporary');
      } else if(keyType == '') {
        this.input(this.item.tabs[0].title || this.item.tabs[0].url, 'temporary');
      }
    }
  }
}
</script>

<style scoped>
.temporary-item {
  /* margin: 0 11px; */
  border-top: 0;
  border-bottom: 0;
  height:100%;
  display:flex;
  align-items: center;
}
.temporary-item .left {
  height: 100%;
  box-sizing: border-box;
  /* padding: 5px; */
  text-align: center;
  cursor: default;
}
.temporary-item .left .workspace-logo {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 4px 2px 2px 4px;
  border-radius: 2px 0 0 0;
  margin-right: 2px;
  background-color: transparent;
}
.temporary-item .image {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  /* background-color: #c0c4cb; */
  /* border-radius: 5px; */
  border-radius: 2px;
  border: 2px solid #c0c4cb;
  text-align: center;
  /* line-height: normal; */

  display: flex;
  /* box-shadow: 1px 1px 2px 2px #ebeef5; */
  flex-direction: column;
  /* justify-content: space-evenly; */
  justify-content: center;
}
.image .a {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* font-size: 16px; */
  /* font-size: 12px; */
  /* transform : scale(16/12, 16/12); */
}
.image .b {
  overflow: hidden;
  white-space: nowrap;
  /* font-size: 12px; */
  /* transform : scale(0.5,0.5); */
}
.temporary-item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;
  cursor: default;

  height: 100%;
  display: flex;
  /*align-items: flex-start;*/ /* flex-wrap = wrap 才有效 */
}

.temporary-item .main.scroll{
  overflow-x: overlay;
}
/*定义滚动条高宽及背景高宽分别对应横竖滚动条的尺寸*/
.temporary-item .main.scroll::-webkit-scrollbar {
  height: 10px;
  background: transparent;
}
/*定义滑块圆角*/
.temporary-item .main.scroll::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(115 115 115 / 50%);
}

.temporary-item .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.temporary-item .sub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* margin-right: 5px; */
}
.temporary-item .right {
  /* border: 1px solid black; */
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
.temporary-item .right >>> .svg-icon {
  width: 20px;
  height: 20px;
  margin-right: 2px;
  padding: 5px;
  cursor:pointer;
}

.el-tag {
  line-height: 1;
  overflow: hidden;
  box-sizing: content-box;
  cursor: default;
  display:flex;
  align-items: center;
}
.el-tag .tab-title {
  display: inline-block;
  vertical-align: top;
  overflow: hidden;
}
</style>
<style>
.all .temporary-item strong {
  color: var(--list-highlight-color);
  font-weight: var(--list-highlight-weight);
}
</style>