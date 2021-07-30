<template>
  <div class="workspace-general">
    <el-card class="box-card" :header="lang('workspaceOrder')">
      <ul class="list workspaces">
        <li
          class="list-item"
          v-for="(type, index) in sortedWrokspaces"
          :key="type+'|'+index"
          :class="{ disabled: ! allWorkspaces[type].isEnabled, enabled: allWorkspaces[type].isEnabled }">
          <el-checkbox
            :value="allWorkspaces[type].isEnabled"
            style="margin-right: 10px;"
            @change="changeWorkspaceState(type)"></el-checkbox>
          <svg-icon
            :name="allWorkspaces[type].svg"
            :style="{
              color: localConfig.pinned
            && localConfig.active_workspace_type == type
            && allWorkspaces[type].isEnabled
            ? 'gray' : '#c0c4cc'}"
            style="width:16px;margin-right: 10px;vertical-align: -0.50em"
          ></svg-icon>
          <span
            style="flex: 1;"
            :style="{
              color: localConfig.active_workspace_type == type ? '#409eff' : '#606266',
              'font-weight': localConfig.active_workspace_type == type ? '700' : 'normal'
            }">{{ lang(allWorkspaces[type].title) }}</span>
          <!-- <i
            v-if="localConfig.active_workspace_type == type"
            class="el-icon-check"
            style="margin: 0 10px;color: #67c23a;font-weight: 900;"></i> -->
          <span
            :style="{
              color: localConfig.pinned
            && localConfig.active_workspace_type == type
            && allWorkspaces[type].isEnabled
            ? 'gray' : '#c0c4cc',}"
            @click="toPin(type)">
            <svg-icon
              name="thumbtack-solid"
              :style="{transform: localConfig.pinned
                                && localConfig.active_workspace_type == type
                                && allWorkspaces[type].isEnabled
                                ? 'rotate(0)' : 'rotate(90deg)'}"
              style="cursor:pointer;height: 20px;vertical-align: -0.5em;"></svg-icon>
          </span>
        </li>
      </ul>
    </el-card>

    <el-card class="box-card" :header="lang('buttonOrder')">
      <ul class="list button">
        <li
          class="list-item"
          :title="disabledOperationButtons.indexOf(type) == -1 ? '' : lang('enableWorkspaceTip')"
          v-for="type of sortedOperationButtons"
          :class="{ disabled: disabledOperationButtons.indexOf(type) != -1,
                    enabled: disabledOperationButtons.indexOf(type) == -1 }"
          :key="type">
          <i :class="allWorkspaces[type].icon_simple"></i>
        </li>
      </ul>
    </el-card>

    <el-card class="box-card" :header="lang('commonFunctions')" :body-style="{paddingBottom: '10px'}">

      <el-radio-group
        :value="localConfig.popup"
        size="medium"
        border
        style="display: block;float:left;margin-right: 20px;margin-bottom: 10px;"
        @change="popupChange(true)">
        <el-radio-button :label="true">
          <svg-icon
            name="fly-brands"
            class="popup"
          ></svg-icon> {{ lang('popup') }}
        </el-radio-button>
        <el-radio-button :label="false">
          <svg-icon
            name="ship-solid"
            class="popup"
          ></svg-icon> {{ lang('inject') }}
        </el-radio-button>
      </el-radio-group>

      <el-checkbox
        :value="localConfig.theme_mode"
        size="medium"
        border
        true-label="dark"
        false-label="light"
        style="margin-right: 20px;margin-bottom: 10px;"
        @change="changeThemeMode">{{ lang('darkMode') }}</el-checkbox>

      <el-checkbox
        :value="localConfig.keymap_left_and_right"
        border
        size="medium"
        style="margin-right: 20px;margin-left: 0px;margin-bottom: 10px;"
        @change="keymapLeftAndRightChange">{{ lang('openLeftAndRightShortcuts') }}</el-checkbox>

      <el-input
        :value="syncConfig.workspace_change_word"
        size="medium"
        style="width: 300px;margin-right: 20px;margin-bottom: 10px;"
        @input="workspaceChangeWordSync"
        @change="setWorkspaceChangeWord"
        @focus="$event.target.select()">
        <template slot="append">
          <span style="cursor:default;">{{ lang('workspaceSwitchingKeywords') }}</span>
        </template>
      </el-input>

    </el-card>

    <el-card class="box-card" :header="lang('startupSpeed')">
      <el-select v-model="speed">
        <el-option value="smooth" :label="lang('gentle')"></el-option>
        <el-option value="fast" :label="lang('fast')"></el-option>
      </el-select>
    </el-card>

  </div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
  name: 'WorkspaceGeneral',
  inject: [
    'changeWorkspaceState',
    'toPin',
    'workspaceSort',
    'OperateButtonSort',
    'changeThemeMode',
    'popupChange',
    'keymapLeftAndRightChange',
    'workspaceChangeWordSync',
    'setWorkspaceChangeWord',
    // 'editSyncConfig',
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
      speed: localStorage.getItem('speed') == 'fast' ? 'fast' : 'smooth',
    }
  },
  computed: {
    allWorkspaces() {
      return this.projectConfig.allWorkspaces;
    },
    disabledWorkspaces() {
      let disabledWorkspaces = [];
      for(let type in this.allWorkspaces) {
        if(this.syncConfig.workspaces.indexOf(type) == -1) {
          disabledWorkspaces.push(type);
        }
      }
      return disabledWorkspaces;
    },
    sortedWrokspaces() {
      return this.syncConfig.workspaces.concat(this.disabledWorkspaces);
    },

    allOperationButtons() {
      return this.projectConfig.allOperationButtons;
    },
    disabledOperationButtons() {
      let disabledOperationButtons = [];
      for(let type of this.allOperationButtons) {
        if(this.syncConfig.operationButtons.indexOf(type) == -1) {
          disabledOperationButtons.push(type);
        }
      }
      return disabledOperationButtons;
    },
    sortedOperationButtons() {
      return this.syncConfig.operationButtons.concat(this.disabledOperationButtons);
    }
  },
  watch: {
    speed(newVal, oldValue) {
      localStorage.setItem('speed', newVal);
      this.$message({
        type: 'success',
        message: this.lang('modifySuccess'),
        duration: 1000,
      });
    }
  },
  methods: {
  },
  mounted() {
    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.list.workspaces'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: this.workspaceSort,
    })

    Sortable.create(document.querySelector('.list.button'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: this.OperateButtonSort,
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.workspace-general {
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
  cursor: move;
}
.list-item:first-child {
  margin-top: 0;
}
.list-item:last-child {
  margin-bottom: 0;
}
.list-item.disabled {
  color: #c0c4cc;
  border-color: #ebeef5;
  cursor: not-allowed;
}
/* .list-item.ghost {
} */
.list-item.chosen{
  color: #3a8ee6;
  border-color: #66b1ff;
  background-color:#ecf5ff;
  opacity: 1;
  box-shadow: 2px 3px 3px #bfd9f7;
}

.list.button .list-item {
  display: inline-block;
  margin: 0 5px;
  padding: 10px 20px;
  /* border-left: 0; */
}

.workspace-general >>> .svg-icon.popup {
  cursor:pointer;
  width: 12px;
  height: 12px;
}

.divider {
  margin: 10px 0;
}
</style>

<style>

</style>