<template>
  <div
    class="workspace-all"
    v-loading="syncConfig.workspaces.indexOf('all') == -1"
    :element-loading-text="lang('enableWorkspaceTip')"
    @click="openWorkspaceAll">
    <el-card class="box-card" :header="lang('smartSorting')">
      <el-checkbox
        :value="localConfig.all_sort_auto"
        size="medium"
        border
        true-label="dark"
        false-label="light"
        @change="changeAutoSort">{{ lang('smartSortingTip') }}</el-checkbox>
    </el-card>
    <el-card class="box-card" :body-style="{paddingBottom: '10px'}">
      <template slot="header">
        <span style="margin-right: 10px;line-height:31px;">{{ lang('listOrder') }}</span>
        <el-popover
          placement="top"
          width="430"
          trigger="hover">
          <div>{{ lang('listOrderTip1') }}</div>
          <div>{{ lang('listOrderTip2') }}</div>
          <div>{{ lang('listOrderTip3') }}</div>
          <i class="el-icon-question"  slot="reference" style="color: gray;"></i>
        </el-popover>
      </template>
      <ul class="list topWorkspaces" ref="topWorkspaces">
        <li
          class="list-item"
          :class="{ disabled: localConfig.all_sort_auto,
                    enabled: ! localConfig.all_sort_auto, }"
          v-for="(workspace, index) in topWorkspaces"
          :key="workspace.type+'|'+index">
          <el-checkbox
            :value="true"
            style="margin-right: 10px;"
            @change="allIncludeRemove(workspace.type)"></el-checkbox>
          <svg-icon
            :name="allWorkspaces[workspace.type].svg"
            style="width:16px;margin-right: 10px;color:#c0c4cc;vertical-align: -0.50em"
          ></svg-icon>
          <span
            class="handle"
            :title="localConfig.all_sort_auto ? lang('smartSorting') : ''"
            >{{ lang(allWorkspaces[workspace.type].title) }}</span>

          <i
            class="el-icon-top active"
            style="margin-right: 5px;"
            :title="lang('cancelToTop')"
            @click="allIncludeChangeTop(workspace.type, 0)"></i>
          <i
            class="el-icon-bottom"
            :title="lang('toBottom')"
            @click="allIncludeChangeTop(workspace.type, -1)"></i>
          <el-input-number
            :value="workspace.count"
            :min="1"
            :max="1000"
            :precision="0"
            size="mini"
            :title="lang('rowsTip')"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"
            @click.native="$event.target.select && $event.target.select();"
            @change="allIncludeCountChange(workspace.type, $event==undefined ? topRecommendCount : $event)"></el-input-number>
          <el-tooltip
            :content="workspace.only_search ? lang('searchingMatchTip') : lang('searchingNoMatchTip')"
            placement="top">
            <el-switch
              :value=" ! workspace.only_search"
              active-color="#13ce66"
              inactive-color="gray"
              :key="workspace.type+'|'+index"
              @change="allIncludeChangeSearchState(workspace.type, ! $event)">
            </el-switch>
          </el-tooltip>
        </li>
      </ul>
      <ul class="list normalWorkspaces" ref="normalWorkspaces">
        <li
          class="list-item"
          :class="{ disabled: localConfig.all_sort_auto,
                    enabled: ! localConfig.all_sort_auto, }"
          v-for="(workspace, index) in normalWorkspaces"
          :key="workspace.type+'|'+index">
          <el-checkbox
            :value="true"
            style="margin-right: 10px;"
            @change="allIncludeRemove(workspace.type)"></el-checkbox>
          <svg-icon
            :name="allWorkspaces[workspace.type].svg"
            style="width:16px;margin-right: 10px;color:#c0c4cc;vertical-align: -0.50em"
          ></svg-icon>
          <span
            class="handle"
            :title="localConfig.all_sort_auto ? lang('smartSorting') : ''"
            >{{ lang(allWorkspaces[workspace.type].title) }}</span>

          <i
            class="el-icon-top"
            style="margin-right: 5px;"
            :title="lang('toTop')"
            @click="allIncludeChangeTop(workspace.type, 1)"></i>
          <i
            class="el-icon-bottom"
            :title="lang('toBottom')"
            @click="allIncludeChangeTop(workspace.type, -1)"></i>
          <el-input-number
            :value="workspace.count"
            :min="1"
            :max="1000"
            :precision="0"
            size="mini"
            :title="lang('rowsTip')"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"
            @click.native="$event.target.select && $event.target.select();"
            @change="allIncludeCountChange(workspace.type, $event==undefined ? topRecommendCount : $event)"></el-input-number>
          <el-tooltip
            :content="workspace.only_search ? lang('searchingMatchTip') : lang('searchingNoMatchTip')"
            placement="top">
            <el-switch
              :value=" ! workspace.only_search"
              :key="workspace.type+'|'+index"
              active-color="#13ce66"
              inactive-color="gray"
              @change="allIncludeChangeSearchState(workspace.type, ! $event)">
            </el-switch>
          </el-tooltip>
        </li>
      </ul>
      <ul class="list bottomWorkspaces" ref="bottomWorkspaces">
        <li
          class="list-item"
          :class="{ disabled: localConfig.all_sort_auto,
                    enabled: ! localConfig.all_sort_auto, }"
          v-for="(workspace, index) in bottomWorkspaces"
          :key="workspace.type+'|'+index">
          <el-checkbox
            :value="true"
            style="margin-right: 10px;"
            @change="allIncludeRemove(workspace.type)"></el-checkbox>
          <svg-icon
            :name="allWorkspaces[workspace.type].svg"
            style="width:16px;margin-right: 10px;color:#c0c4cc;vertical-align: -0.50em"
          ></svg-icon>
          <span
            class="handle"
            :title="localConfig.all_sort_auto ? lang('smartSorting') : ''"
            >{{ lang(allWorkspaces[workspace.type].title) }}</span>

          <i
            class="el-icon-top"
            style="margin-right: 5px;"
            :title="lang('toTop')"
            @click="allIncludeChangeTop(workspace.type, 1)"></i>
          <i
            class="el-icon-bottom active"
            :title="lang('cancelToBottom')"
            @click="allIncludeChangeTop(workspace.type, 0)"></i>
          <el-input-number
            :value="workspace.count"
            :min="1"
            :max="1000"
            :precision="0"
            size="mini"
            :title="lang('rowsTip')"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"
            @click.native="$event.target.select && $event.target.select();"
            @change="allIncludeCountChange(workspace.type, $event==undefined ? topRecommendCount : $event)"></el-input-number>
          <el-tooltip
            :content="workspace.only_search ? lang('searchingMatchTip') : lang('searchingNoMatchTip')"
            placement="top">
            <el-switch
              :value=" ! workspace.only_search"
              active-color="#13ce66"
              inactive-color="gray"
              :key="workspace.type+'|'+index"
              @change="allIncludeChangeSearchState(workspace.type, ! $event)">
            </el-switch>
          </el-tooltip>
        </li>
      </ul>
      <ul class="list disabledWorkspaces" ref="disabledWorkspaces">
        <li
          class="list-item disabled"
          :class="{ disabled: ! isSearchEngineEnabled,
                    enabled: isSearchEngineEnabled, }"
          v-for="(type, index) in disabledWorkspaces"
          :key="index">
          <el-checkbox
            :value="false"
            style="margin-right: 10px;"
            @change="allIncludeAdd(type)"></el-checkbox>
          <svg-icon
            :name="allWorkspaces[type].svg"
            style="width:16px;margin-right: 10px;color:#c0c4cc;vertical-align: -0.50em"
          ></svg-icon>
          <span
            class="handle">{{ lang(allWorkspaces[type].title) }}</span>

          <i
            class="el-icon-top disabled"
            style="margin-right: 5px;"></i>
          <i
            class="el-icon-bottom disabled"></i>
          <el-input-number
            disabled
            size="mini"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"></el-input-number>
          <el-switch
            disabled
            active-color="#13ce66"
            inactive-color="gray">
          </el-switch>
        </li>
      </ul>
    </el-card>
    <el-card class="box-card" :body-style="{paddingBottom: '10px'}">
      <template slot="header">
        <span style="margin-right: 20px;line-height:31px;">{{ lang('searchEngine') }}</span>
        <el-tooltip
          :content="isSearchEngineEnabled ? lang('searchEngineEnableTip') : lang('searchEngineDisableTip')"
          placement="top">
          <el-switch
            :value="isSearchEngineEnabled"
            active-color="#13ce66"
            inactive-color="gray"
            @change="searchEngineEnabled">
          </el-switch>
        </el-tooltip>
        <el-button
          v-if="isSearchEngineEnabled"
          icon="el-icon-plus"
          circle size="mini"
          style="margin-left: 20px;"
          @click="searchEngineForm={name: '', formate: '', type:'add'}; searchEngineVisible=true"></el-button>
        <span
          v-if="isSearchEngineEnabled && isSearchEngineChange"
          style="display:inline-block;border-left: 1px solid lightgray;height: 30px;margin: 0 20px;">
          <el-tooltip
            placement="right"
            :content="lang('restoreDefaultSettings')">
            <i
            class="el-icon-refresh-right hover2"
            style="margin-left: 20px;line-height: 30px;"
            @click="resetSearchEngine(JSON.parse(JSON.stringify(userLocalConfig.all_search_engine)))"></i>
          </el-tooltip>
        </span>
      </template>
      <ul class="list search" ref="searchEngineList">
        <li
          class="list-item"
          :class="{ disabled: ! isSearchEngineEnabled,
                    enabled: isSearchEngineEnabled, }"
          v-for="(engine, index) in allSearchEngine"
          :key="engine.name+'|'+index">
          <span class="left handle">
            <el-image
              :src="getIcon('', engine.formate, 30)"
              style="width:100%; height: 100%;"
              fit="cover"
              lazy>
              <div slot="error">
                <img src="@/assets/fallback.png" style="width:100%; height: 100%;" />
              </div>
              <div slot="placeholder"></div>
            </el-image>

          </span>

          <div class="main handle">
            <div class="title">{{ engine.name }}</div>
            <div
              class="sub-title"
              :style="{ color: isSearchEngineEnabled ? '#909399' : '#c0c4cc' }"
              >{{ engine.formate }}</div>
          </div>

          <div class="right">
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              plain
              :disabled=" ! isSearchEngineEnabled"
              @click.stop="searchEngineForm=Object.assign({'type': 'edit', 'index': index}, engine);searchEngineVisible=true;"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              plain
              :disabled=" ! isSearchEngineEnabled"
              @click.stop="deleteSearchEngine(index)"></el-button>
          </div>
        </li>
      </ul>
    </el-card>

    <el-dialog
      :visible.sync="searchEngineVisible"
      :append-to-body="true"
      width="80%"
      class="window-group"
      :title="lang('addSearchEngine')"
      @open="$refs.searchEngineForm && $refs.searchEngineForm.clearValidate()">
      <el-form ref="searchEngineForm" :model="searchEngineForm" :rules="searchEngineRules" label-width="100px">
        <el-form-item :label="lang('name')" prop="name">
          <el-input v-model="searchEngineForm.name" placeholder="Google"></el-input>
        </el-form-item>
        <el-form-item :label="lang('searchURL')" prop="formate">
          <el-input v-model="searchEngineForm.formate" placeholder="https://www.google.com/search?q={query}"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 0;">
          <div style="font-size: 12px;
                      color: rgb(144, 147, 153);
                      margin-top: -15px;
                      line-height:1.4">{{ lang('searchURLTip') }}</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button style="float:left;" @click="testSearchEngineForm">{{ lang('test' )}}</el-button>

        <el-button @click="searchEngineVisible = false">{{ lang('cancel') }}</el-button>
        <el-button type="primary" @click="submitSearchEngineForm">{{ lang('sure') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import userLocalConfig from '@/config/user_local_config.json'
import Sortable from 'sortablejs';

export default {
  name: 'WorkspaceAll',
  inject: [
    'changeAutoSort',
    'allIncludeRemove',
    'allIncludeAdd',
    'allIncludeCountChange',
    'allIncludeChangeTop',
    'allIncludeChangeSearchState',
    'allIncludeSort',

    'searchEngineEnabled',
    'deleteSearchEngine',
    'addSearchEngine',
    'editSearchEngine',
    'searchEngineSort',
    'resetSearchEngine',
  ],
  props: {
    syncConfig: {
      type: Object,
      required: true,
    },
    localConfig: {
      type: Object,
      required: true,
    },
    projectConfig: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      searchEngineVisible: false,
      searchEngineForm: {},
      searchEngineRules: {
        name: [
          { required: true, message: ' ', trigger: 'blur' },
        ],
        formate: [
          { required: true, message: ' ', trigger: 'blur' },
        ],
      },
      userLocalConfig: userLocalConfig,
    }
  },
  computed: {
    isSearchEngineChange() {
      return JSON.stringify(this.localConfig.all_search_engine) != JSON.stringify(userLocalConfig.all_search_engine);
    },
    allWorkspaces() {
      return this.projectConfig.allWorkspaces;
    },
    topWorkspaces() {
      return this.localConfig.all_include.filter((item) => {
        return item.is_top == 1 && item.type != 'search';
      })
    },
    normalWorkspaces() {
      return this.localConfig.all_include.filter((item) => {
        return item.is_top == 0 && item.type != 'search';
      })
    },
    bottomWorkspaces() {
      return this.localConfig.all_include.filter((item) => {
        return item.is_top == -1 && item.type != 'search';
      })
    },
    disabledWorkspaces() {
      let disabledWorkspaces = [];
      for(let type in this.allWorkspaces) {
        if(type == 'all') continue;
        if(this.localConfig.all_include.findIndex(item => item.type == type) == -1) {
          disabledWorkspaces.push(type);
        }
      }
      return disabledWorkspaces;
    },

    isSearchEngineEnabled() {
      return this.localConfig.all_include.some((item) => {
        return item.type == 'search';
      })
    },
    allSearchEngine() {
      return this.localConfig.all_search_engine;
    },

    topRecommendCount() {
      if(this.topWorkspaces.length >= 2) return 3;
      if(this.localConfig.popup == true) {
        return this.localConfig.theme_popup.config.item_show_count+1;
      } else {
        return this.localConfig.theme_inject.config.item_show_count+1;
      }
    }
  },
  methods: {
    openWorkspaceAll() {
      if(this.syncConfig.workspaces.indexOf('all') != -1) return;

      window.location.href="/options.html#/workspace-general";
    },

    submitSearchEngineForm() {
      this.$refs.searchEngineForm.validate((valid) => {
        if( ! valid) return false;
        if(this.searchEngineForm.type == 'add') {
          this.addSearchEngine(this.searchEngineForm);
        } else {
          this.editSearchEngine(this.searchEngineForm.index, this.searchEngineForm);
        }
        this.$nextTick(() => this.searchEngineVisible=false)
      });
    },
    testSearchEngineForm() {
      this.$refs.searchEngineForm.validate((valid) => {
        if( ! valid) return false;

        this.$prompt('', this.lang('keywordInputTip'), {
          confirmButtonText: this.lang('sure'),
          cancelButtonText: this.lang('cancel'),
          inputPlaceholder: '',
          inputValue: 'SaveTabs',
          // inputValidator: ( value ) => {
          //   return true;
          // }
        }).then(({ value }) => {
          value = value.trim();

          let url = encodeURI(this.searchEngineForm.formate).replace(new RegExp(encodeURI('{query}'), 'g'), encodeURIComponent(value));
          this.$open(url)

          return false;
        }).catch(() => {
        });
      });
    },
  },
  mounted() {
    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.list.topWorkspaces'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      handle: ".handle",
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: ({newIndex, oldIndex }) => {
        if(newIndex == oldIndex) {
          return;
        }

        if(newIndex >= this.topWorkspaces.length) {
          newIndex = this.topWorkspaces.length-1;
        }

        this.allIncludeSort({
          newIndex: this.localConfig.all_include.findIndex(item => {
            return item.type == this.topWorkspaces[newIndex].type;
          }),
          oldIndex: this.localConfig.all_include.findIndex(item => {
            return item.type == this.topWorkspaces[oldIndex].type;
          })
        });
      },
      // 列表内元素顺序更新的时候触发
      // onUpdate: (/**Event*/evt) => {
      //   // 还原为运来的Dom，让vue自己去更新，否则又会被移回去
      //   let newIndex = evt.newIndex;
      //   let oldIndex = evt.oldIndex;

      //   let ul = this.$refs.topWorkspaces;
      //   let newLi = ul.children[newIndex];
      //   let oldLi = ul.children[oldIndex];

      //   // 先删除移动的节点
      //   ul.removeChild(newLi);

      //   // 再插入移动的节点到原有节点，还原了移动的操作
      //   if(newIndex > oldIndex) {
      //       ul.insertBefore(newLi,oldLi);
      //   } else {
      //       ul.insertBefore(newLi,oldLi.nextSibling);
      //   }
      // },
    })

    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.list.normalWorkspaces'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      handle: ".handle",
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: ({newIndex, oldIndex }) => {
        if(newIndex == oldIndex) {
          return;
        }

        if(newIndex >= this.normalWorkspaces.length) {
          newIndex = this.normalWorkspaces.length-1;
        }

        this.allIncludeSort({
          newIndex: this.localConfig.all_include.findIndex(item => {
            return item.type == this.normalWorkspaces[newIndex].type;
          }),
          oldIndex: this.localConfig.all_include.findIndex(item => {
            return item.type == this.normalWorkspaces[oldIndex].type;
          })
        });
      },
    })

    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.list.bottomWorkspaces'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      handle: ".handle",
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: ({newIndex, oldIndex }) => {
        if(newIndex == oldIndex) {
          return;
        }

        if(newIndex >= this.bottomWorkspaces.length) {
          newIndex = this.bottomWorkspaces.length-1;
        }

        this.allIncludeSort({
          newIndex: this.localConfig.all_include.findIndex(item => {
            return item.type == this.bottomWorkspaces[newIndex].type;
          }),
          oldIndex: this.localConfig.all_include.findIndex(item => {
            return item.type == this.bottomWorkspaces[oldIndex].type;
          })
        });
      },
    })

    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.list.search'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      handle: ".handle",
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: this.searchEngineSort,
      // key 改变可以避免这一点
      // // 列表内元素顺序更新的时候触发
      // onUpdate: (/**Event*/evt) => {
      //   // 还原为运来的Dom，让vue自己去更新，否则又会被移回去
      //   let newIndex = evt.newIndex;
      //   let oldIndex = evt.oldIndex;

      //   let ul = this.$refs.searchEngineList;
      //   let newLi = ul.children[newIndex];
      //   let oldLi = ul.children[oldIndex];

      //   // 先删除移动的节点
      //   ul.removeChild(newLi);

      //   // 再插入移动的节点到原有节点，还原了移动的操作
      //   if(newIndex > oldIndex) {
      //       ul.insertBefore(newLi,oldLi);
      //   } else {
      //       ul.insertBefore(newLi,oldLi.nextSibling);
      //   }
      // },
    })

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.workspace-all {
  padding:20px;
}

.box-card {
  margin-bottom: 20px;
}

.list {
  padding: 0;
  margin: 0;
  overflow: auto;

  /* 禁止选择 */
  -moz-user-select:none; /*火狐*/
  -webkit-user-select:none; /*webkit浏览器*/
  -ms-user-select:none; /*IE10*/
  -khtml-user-select:none; /*早期浏览器*/
  user-select:none;
}
.list-item {
  padding: 10px;
  background-color: white;
  border: 1px solid gray;
  margin: 10px 0;
  display: flex;
  align-items: center;
  /* cursor: move; */
}
.list-item:first-child {
  margin-top: 0;
}
/* .list-item:last-child {
  margin-bottom: 0;
} */
/* .list-item.ghost {
} */
.list-item.chosen{
  color: #3a8ee6;
  border-color: #66b1ff;
  background-color:#ecf5ff;
  opacity: 1;
  box-shadow: 2px 3px 3px #bfd9f7;
}
.list-item .handle {
  cursor: move;
}
.list-item.disabled,
.list-item.disabled .handle{
  color: #c0c4cc;
  border-color: #ebeef5 !important;
  cursor: not-allowed !important;
}

/* .list.normalWorkspaces,
.list.bottomWorkspaces,
.list.disabledWorkspaces {
  margin-top: 10px;
} */

.list.topWorkspaces .list-item {
  background-color: #FFFFCC;
  border-color: #FFCC00;
}
.list.bottomWorkspaces .list-item {
  background-color: #EEEEEE;
  border-color: #666666;
}
.list.topWorkspaces .handle,
.list.normalWorkspaces .handle,
.list.bottomWorkspaces .handle,
.list.disabledWorkspaces .handle {
  flex: 1;
  color:#606266;
  margin-right: 12px;
  margin-top: -12px;
  margin-bottom: -12px;
  padding: 12px 0;
}
.list.disabledWorkspaces .handle {
  color: #c0c4cc;
  cursor: not-allowed;
}

.list.search .list-item {
  width: 100%;
  height: 56px;
  padding: 0;
  box-sizing: border-box;
  display:flex;
  align-items: center;
  cursor: default;
}
.list.search .list-item .left {
  width: 56px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  /* padding: 10px; */
  text-align: center;
}
.list.search .list-item .main {
  flex: 1;
  text-align: left;
  overflow: hidden;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  /* justify-content: center; */
}
.list.search .list-item .title {
  font-size: 20px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list.search .list-item .sub-title {
  font-size: 12px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list.search .list-item .right {
  padding-left: 10px;
  padding-right: 10px;
  text-align: right;

  height: 100%;
  display:flex;
  flex-direction: row;
  align-items: center;
}

.el-icon-top,
.el-icon-bottom {
  color: #9e9e9e;
  cursor: pointer;
}
.el-icon-top:hover,
.el-icon-bottom:hover {
  color: gray;
}
.el-icon-top.active {
  color: #FF9900;
  font-weight: 900;
}
.el-icon-bottom.active {
  color: #777777;
  font-weight: 900;
}
.el-icon-top.disabled,
.el-icon-bottom.disabled {
  color: #DDDDDD;
  cursor: not-allowed;
}
</style>

<style>

</style>