<template>
  <div
    class="workspace-all"
    v-loading="syncConfig.workspaces.indexOf('all') == -1"
    element-loading-text="请先开启该工作区"
    @click="openWorkspaceAll">
    <el-card class="box-card" header="智能排序">
      <el-checkbox
        :value="localConfig.all_sort_auto"
        size="medium"
        border
        true-label="dark"
        false-label="light"
        @change="changeAutoSort">除“置顶”和“置底”外，最后访问的列表所对应的工作区将排在最前面</el-checkbox>
    </el-card>
    <el-card class="box-card" :body-style="{paddingBottom: '10px'}">
      <template slot="header">
        <span style="margin-right: 10px;line-height:31px;">列表顺序</span>
        <el-popover
          placement="top"
          width="430"
          trigger="hover">
          <div>默认：将按设置的数量交错展示多个工作区的内容。</div>
          <div>置顶：将出现在最开始的位置，并一直持续到内容结束，<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    若有多个置顶则按设置的数量交错展示。</div>
          <div>置底：只有置顶和默认工作区的内容都展示完了才开始输出内容，<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    若有多个置底，则按设置的数量交错展示。</div>
          <i class="el-icon-question"  slot="reference" style="color: gray;"></i>
        </el-popover>
      </template>
      <ul class="list topWorkspaces" ref="topWorkspaces">
        <li
          class="list-item enabled"
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
            class="handle">{{ lang(allWorkspaces[workspace.type].title) }}</span>

          <i
            class="el-icon-top active"
            style="margin-right: 5px;"
            title="点击取消置顶"
            @click="allIncludeChangeTop(workspace.type, 0)"></i>
          <i
            class="el-icon-bottom"
            title="点击置底"
            @click="allIncludeChangeTop(workspace.type, -1)"></i>
          <el-input-number
            :value="workspace.count"
            :min="1"
            :max="1000"
            :precision="0"
            size="mini"
            title="每次展示多少行"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"
            @click.native="$event.target.select && $event.target.select();"
            @change="allIncludeCountChange(workspace.type, $event==undefined ? topRecommendCount : $event)"></el-input-number>
          <el-tooltip
            :content="workspace.only_search ? '仅在搜索时出现' : '非搜索时仍旧展示内容'"
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
            :title="localConfig.all_sort_auto ? '智能排序' : ''"
            >{{ lang(allWorkspaces[workspace.type].title) }}</span>

          <i
            class="el-icon-top"
            style="margin-right: 5px;"
            title="点击置顶"
            @click="allIncludeChangeTop(workspace.type, 1)"></i>
          <i
            class="el-icon-bottom"
            title="点击置底"
            @click="allIncludeChangeTop(workspace.type, -1)"></i>
          <el-input-number
            :value="workspace.count"
            :min="1"
            :max="1000"
            :precision="0"
            size="mini"
            title="每次展示多少行"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"
            @click.native="$event.target.select && $event.target.select();"
            @change="allIncludeCountChange(workspace.type, $event==undefined ? topRecommendCount : $event)"></el-input-number>
          <el-tooltip
            :content="workspace.only_search ? '仅在搜索时出现' : '非搜索时仍旧展示内容'"
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
          class="list-item enabled"
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
            class="handle">{{ lang(allWorkspaces[workspace.type].title) }}</span>

          <i
            class="el-icon-top"
            style="margin-right: 5px;"
            title="点击置顶"
            @click="allIncludeChangeTop(workspace.type, 1)"></i>
          <i
            class="el-icon-bottom active"
            title="点击取消置底"
            @click="allIncludeChangeTop(workspace.type, 0)"></i>
          <el-input-number
            :value="workspace.count"
            :min="1"
            :max="1000"
            :precision="0"
            size="mini"
            title="每次展示多少行"
            style="width: 100px;margin-right: 10px;margin-left: 20px;"
            @click.native="$event.target.select && $event.target.select();"
            @change="allIncludeCountChange(workspace.type, $event==undefined ? topRecommendCount : $event)"></el-input-number>
          <el-tooltip
            :content="workspace.only_search ? '仅在搜索时出现' : '非搜索时仍旧展示内容'"
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
        <span style="margin-right: 20px;line-height:31px;">搜索引擎</span>
        <el-tooltip
          :content="isSearchEngineEnabled ? '仅在搜索不到内容时出现' : '不展示搜索引擎'"
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
      title="添加搜索引擎"
      @open="$refs.searchEngineForm && $refs.searchEngineForm.clearValidate()">
      <el-form ref="searchEngineForm" :model="searchEngineForm" :rules="searchEngineRules" label-width="90px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="searchEngineForm.name" placeholder="例如：百度"></el-input>
        </el-form-item>
        <el-form-item label="搜索 URL" prop="formate">
          <el-input v-model="searchEngineForm.formate" placeholder="例如：https://www.baidu.com/s?ie=utf-8&wd={query}"></el-input>
        </el-form-item>
        <el-form-item style="margin-bottom: 0;">
          <div style="font-size: 12px;
                      color: rgb(144, 147, 153);
                      margin-top: -15px;
                      line-height:1.4">在网站上执行搜索并复制结果 URL，并用 {query} 替换搜索关键词</div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button style="float:left;" @click="testSearchEngineForm">测 试</el-button>

        <el-button @click="searchEngineVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSearchEngineForm">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
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
      }
    }
  },
  computed: {
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

        this.$prompt('', '请输入关键词进行测试', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '',
          inputValue: 'SaveTabs',
          inputValidator: ( value ) => {
            // value = value == null ? '' : value.trim();

            // // 窗口名不允许为空
            // if(value == '') {
            //   return this.lang('emptyGroupName');
            // }

            // // 窗口名不允许重复，自己的不算
            // for(let i in this.storageList) {
            //   if(i != this.currentStorageIndex && this.storageList[i].name == value) {
            //     return this.lang('groupNameRepeat');
            //   }
            // }

            return true;
          }
        }).then(({ value }) => {
          value = value.trim();

          let url = encodeURI(this.searchEngineForm.formate).replace(new RegExp(encodeURI('{query}'), 'g'), encodeURIComponent(value));
          console.log(url)
          this.$open(this.searchEngineForm.formate)

          return false;
        }).catch(() => {
        });
      });
    },
  },
  mounted() {
    // todo
    window.wa = this;
    console.log('mounted:WorkspaceAll');


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

      //   console.log('onUpdate',newIndex, oldIndex, ul, newLi, oldLi);

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

      //   console.log('onUpdate',newIndex, oldIndex, ul, newLi, oldLi);

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
  border-color: #ebeef5;
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