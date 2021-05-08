<template>
  <el-container id="app">
    <el-header>
      <h3
        style="display: flex;justify-content: center; align-items: center;">
        <img
          src="./assets/icon-128.png"
          style="wdith:25px;height: 25px;margin-right: 10px;" />
        <span>SaveTabs</span>
      </h3>
    </el-header>
    <el-main style="width: 700px;margin:auto;">
      <el-row type="flex" justify="center">
        <el-col :span="24">
          <el-tabs v-model="activeName" type="border-card" tab-position="top" align="left">
            <el-tab-pane :label="lang('pageLayout')" name="page">

              <el-divider>{{lang('page') }}</el-divider>

              <div class="item">
                <span>{{lang('border') }}</span>
                <el-slider
                    v-model="pageConfig.border_width"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="0"
                    :max="188"
                    @change="changeSize('border_width')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('border_width')"></i>
              </div>

              <el-divider>{{ lang('listItem') }}</el-divider>

              <div class="item">
                <span>{{ lang('width') }}</span>
                <el-slider
                    v-model="pageConfig.width"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="380"
                    :max="780"
                    @change="changeSize('width')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('width')"></i>
              </div>
              <div class="item">
                <span>{{ lang('height') }}</span>
                <el-slider
                    v-model="pageConfig.item_height"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="39"
                    :max="198"
                    @change="changeSize('item_height')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('item_height')"></i>
              </div>
              <div class="item">
                <span>{{ lang('count') }}</span>
                <el-slider
                    v-model="pageConfig.item_show_count"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="1"
                    :max="13"
                    @change="changeSize('item_show_count')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('item_show_count')"></i>
              </div>
              <div class="item">
                <span>{{ lang('pageCount') }}</span>
                <el-slider
                    v-model="pageConfig.list_page_count"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="2"
                    :max="1000"
                    @change="changeSize('list_page_count')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('list_page_count')"></i>
              </div>

              <el-divider>{{ lang('fontSize') }}</el-divider>

              <div class="item">
                <span>{{ lang('titleSize') }}</span>
                <el-slider
                    v-model="pageConfig.list_font_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="128"
                    @change="changeSize('list_font_size')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('list_font_size')"></i>
              </div>

              <div class="item">
                <span>{{ lang('subtitleSize') }}</span>
                <el-slider
                    v-model="pageConfig.list_explain_font_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="128"
                    @change="changeSize('list_explain_font_size')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('list_explain_font_size')"></i>
              </div>

              <div class="item">
                <span>{{ lang('statusSize') }}</span>
                <el-slider
                    v-model="pageConfig.list_state_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="100"
                    @change="changeSize('list_state_size')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('list_state_size')"></i>
              </div>

              <div class="item">
                <span>{{ lang('keymapSize') }}</span>
                <el-slider
                    v-model="pageConfig.list_keymap_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="128"
                    @change="changeSize('list_keymap_size')"></el-slider>
                <i class="el-icon-refresh-right" @click="resetSize('list_keymap_size')"></i>
              </div>

            </el-tab-pane>

            <el-tab-pane :label="lang('colorSetting')" name="color">
              <el-form ref="form" :model="colorConfig" label-width="110px" :inline="true" size="mini">

                <el-divider>{{ lang('listItem') }}</el-divider>

                <el-form-item :label="lang('pageBackgroundColor')">
                  <el-color-picker v-model="colorConfig.background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('pageBorderColor')">
                  <el-color-picker v-model="colorConfig.border_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('keymapColor')">
                  <el-color-picker v-model="colorConfig.list_keymap_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('keymapFocusColor')">
                  <el-color-picker v-model="colorConfig.list_focus_keymap_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="colorConfig.list_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('titleColor')">
                  <el-color-picker v-model="colorConfig.list_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('statusColor')">
                  <el-color-picker v-model="colorConfig.list_state_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('subtitleColor')">
                  <el-color-picker v-model="colorConfig.list_explain_font_color"></el-color-picker>
                </el-form-item>

                <el-divider>{{ lang('listItemSelected') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="colorConfig.list_focus_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('titleColor')">
                  <el-color-picker v-model="colorConfig.list_focus_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('statusColor')">
                  <el-color-picker v-model="colorConfig.list_focus_state_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('subtitleColor')">
                  <el-color-picker v-model="colorConfig.list_explain_focus_font_color"></el-color-picker>
                </el-form-item>

                <el-divider>{{ lang('currentWindowItem') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="colorConfig.list_current_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('titleColor')">
                  <el-color-picker v-model="colorConfig.list_current_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('statusColor')">
                  <el-color-picker v-model="colorConfig.list_current_state_color"></el-color-picker>
                </el-form-item>

                <el-divider>{{ lang('currentWindowItemSelected') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="colorConfig.list_current_focus_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('titleColor')">
                  <el-color-picker v-model="colorConfig.list_current_focus_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('statusColor')">
                  <el-color-picker v-model="colorConfig.list_current_focus_state_color"></el-color-picker>
                </el-form-item>

                <el-form-item style="float:right;">
                  <input type="file" id="upload" style="display:none">
                  <el-button :title="lang('loadExplain')" @click="load">{{ lang('load') }}</el-button>
                  <el-button :title="lang('shareExplain')" @click="share">{{ lang('share') }}</el-button>
                  <el-button @click="resetColor">{{ lang('reset') }}</el-button>
                  <el-popconfirm :title="lang('storeConfirm')" @confirm="storeColor">
                  <el-button type="primary" slot="reference" style="margin-left:10px;">{{ lang('store') }}</el-button>
                  </el-popconfirm>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane :label="lang('workspace')" name="workspace">

              <el-divider>{{ lang('displayOrder') }}</el-divider>

              <ul class="list">
                <li
                  class="list-item"
                  v-for="type in sortedWrokspaces"
                  :key="type"
                  :class="{ disabled: ! allWorkspaces[type].isEnabled, enabled: allWorkspaces[type].isEnabled }">
                  <el-checkbox
                    v-model="allWorkspaces[type].isEnabled"
                    style="margin-right: 10px;"
                    @change="changeWorkspaceState(type)"></el-checkbox>
                  <svg-icon
                    :name="allWorkspaces[type].svg"
                    :style="{
                      color: workspacesConfig.pinned
                    && workspacesConfig.active_workspace_type == type
                    && allWorkspaces[type].isEnabled
                    ? 'gray' : '#c0c4cc'}"
                    style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  ></svg-icon>
                  <span
                    style="flex: 1; "
                    :style="{ color: workspacesConfig.show_workspace_name
                            ? '' : 'white'}">{{ lang(allWorkspaces[type].title) }}</span>
                  <span
                    :style="{
                      color: workspacesConfig.pinned
                    && workspacesConfig.active_workspace_type == type
                    && allWorkspaces[type].isEnabled
                    ? 'gray' : '#c0c4cc',}"
                    @click="toPin(type)">
                    <svg-icon
                      name="thumbtack-solid"
                      :style="{transform: workspacesConfig.pinned
                                        && workspacesConfig.active_workspace_type == type
                                        && allWorkspaces[type].isEnabled
                                        ? 'rotate(0)' : 'rotate(90deg)'}"
                      style="cursor:pointer;height: 20px;vertical-align: -0.5em;"></svg-icon>
                  </span>
                </li>
              </ul>

              <el-divider>{{ lang('otherOptions') }}</el-divider>

              <el-checkbox
                size="medium"
                :border="true"
                v-model="workspacesConfig.theme_mode"
                true-label="dark"
                false-label="light"
                @change="changeThemeMode">{{ lang('darkMode') }}</el-checkbox>
              <el-checkbox
                size="medium"
                :border="true"
                v-model="workspacesConfig.show_workspace_name"
                @change="showWorkspaceName">{{ lang('showWorkspaceTitle') }}</el-checkbox>
              <el-checkbox
                size="medium"
                :border="true"
                v-model="workspacesConfig.button_follow_workspace"
                @change="followWorkspaceOrder">{{ lang('buttonFollow') }}</el-checkbox>
              <div style="margin-bottom: 30px;"></div>

            </el-tab-pane>
            <el-tab-pane :label="lang('otherFunctions')" name="other">

              <el-divider>{{ lang('windowData') }}</el-divider>

              <input type="file" id="upload2" style="display:none">

              <el-button icon="el-icon-delete" @click="clearData('window')">{{ lang('clearData') }}</el-button>
              <el-button icon="el-icon-upload2" @click="leadIn('window')">{{ lang('import') }}</el-button>
              <el-button icon="el-icon-download" @click="leadOut('window')">{{ lang('export') }}</el-button>

              <div style="margin-top: 30px;"></div>

              <el-divider>{{ lang('noteData') }}</el-divider>

              <el-button icon="el-icon-delete" @click="clearData('note')">{{ lang('clearData') }}</el-button>
              <el-button icon="el-icon-upload2" @click="leadIn(
                'note')">{{ lang('import') }}</el-button>
              <el-button icon="el-icon-download" @click="leadOut('note')">{{ lang('export') }}</el-button>

              <div style="margin-top: 30px;"></div>

              <el-divider>{{ lang('temporaryData') }}</el-divider>

              <el-button icon="el-icon-delete" @click="clearData('temporary')">{{ lang('clearData') }}</el-button>
              <el-button icon="el-icon-upload2" @click="leadIn('temporary')">{{ lang('import') }}</el-button>
              <el-button icon="el-icon-download" @click="leadOut('temporary')">{{ lang('export') }}</el-button>

              <div style="margin-top: 30px;"></div>

              <el-divider>{{ lang('allData') }}</el-divider>

              <el-button icon="el-icon-delete" @click="clearData('all')">{{ lang('clearData') }}</el-button>
              <el-button icon="el-icon-upload2" @click="leadIn('all')">{{ lang('import') }}</el-button>
              <el-button icon="el-icon-download" @click="leadOut('all')">{{ lang('export') }}</el-button>

              <div style="margin-top: 30px;"></div>

              <el-divider style="margin-top: 10px;">{{ lang('otherSetting') }}</el-divider>

              <el-button icon="el-icon-key" @click="$open('chrome://extensions/configureCommands')">{{ lang('addKeys') }}</el-button>

              <el-button icon="el-icon-star-on" @click="$open('chrome://bookmarks/')">{{ lang('bookmarkManagement') }}</el-button>

              <el-button icon="el-icon-timer" @click="$open('chrome://history/')">{{ lang('historyManagement') }}</el-button>

            </el-tab-pane>
            <el-tab-pane :label="lang('support')" name="praise">
              <el-row>
                <el-col :span="24" style="text-align:center;margin-top: 20px;color:gray;">
                  {{ lang('thankYou') }}
                </el-col>
              </el-row>
              <el-row class="praise" :gutter="20" style="margin-top: 50px">
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/WeChatPay.gif" style="width:100%;" />
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/PayPal.gif" style="width:100%;cursor: pointer;" @click="$open('https://www.paypal.com/paypalme/hzhcocong')" />
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/Alipay.gif" style="width:100%;" />
                  </el-card>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                <p class="describe">{{ lang('advice1')}} <a href="https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno" target="_blank">{{ lang('chromeWebStore') }}</a> {{ lang('advice2') }}</p>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>

import { nanoid } from 'nanoid'
import userConfig from './config/user_config.json'
import projectConfig from './config/project_config.json'
import Sortable from 'sortablejs';
var validate = require("validate.js");

export default {
  name: 'app',
  data: () => ({
    activeName: "page",

    allWorkspaces: projectConfig.allWorkspaces,
    colorAttributes: projectConfig.colorAttributes,
    workspaceAttributes: projectConfig.workspaceAttributes,

    storageConfig: JSON.parse(JSON.stringify(userConfig)),
    pageConfig: JSON.parse(JSON.stringify(userConfig)),
    colorConfig: JSON.parse(JSON.stringify(userConfig)),
    workspacesConfig: JSON.parse(JSON.stringify(userConfig)),
  }),
  computed: {
    disabledWorkspaces() {
      let disabledWorkspaces = [];
      for(let type in this.allWorkspaces) {
        if(this.workspacesConfig.workspaces.indexOf(type) == -1) {
          disabledWorkspaces.push(type);
        }
      }
      return disabledWorkspaces;


      // return Object.keys( this.allWorkspaces).filter(type => {
      //   if(this.workspacesConfig.workspaces.indexOf(type) == -1) {
      //     // this.allWorkspaces[type].isEnabled = false;

      //     return true;
      //   } else {
      //     return false;
      //   }
      // })
    },
    sortedWrokspaces() {
      return this.workspacesConfig.workspaces.concat(this.disabledWorkspaces);
    }
  },
  methods: {
    store: function() {
      chrome.storage.sync.set({'config': this.storageConfig}, () => {
        this.$message({
          type: 'success',
          message: this.lang('saveSuccess'),
          duration: 1000,
        });
      });
    },

    changeSize(field) {
      let config = {};

      // 每页数量必须要大于个数
      if(field == 'item_show_count' || field == 'list_page_count') {
        if(this.pageConfig['item_show_count'] >= this.pageConfig['list_page_count']) {
          if(field == 'item_show_count') {
            this.pageConfig['list_page_count'] = this.pageConfig['item_show_count']+1;
          } else {
            this.pageConfig['item_show_count'] = this.pageConfig['list_page_count']-1;
          }
          config['list_page_count'] = this.pageConfig['list_page_count'];
          config['item_show_count'] = this.pageConfig['item_show_count'];
        } else {
          config[ field ] = this.pageConfig[ field ];
        }
      } else {
        config[ field ] = this.pageConfig[ field ];
      }

      validate.extend(this.storageConfig, config);
      this.store();
    },
    resetSize(field) {
      let config = {};

      config[ field ] = userConfig[ field ];
      this.pageConfig[ field ] = userConfig[ field ];

      // 每页数量必须要大于个数
      if(field == 'item_show_count' || field == 'list_page_count') {
        if(this.pageConfig['item_show_count'] >= this.pageConfig['list_page_count']) {
          if(field == 'item_show_count') {
            this.pageConfig['list_page_count'] = this.pageConfig['item_show_count']+1;
          } else {
            this.pageConfig['item_show_count'] = this.pageConfig['list_page_count']-1;
          }
          config['list_page_count'] = this.pageConfig['list_page_count'];
          config['item_show_count'] = this.pageConfig['item_show_count'];
        }
      }

      validate.extend(this.storageConfig, config);
      this.store();
    },

    storeColor() {
      validate.extend(this.storageConfig, {
        list_font_color: this.colorConfig.list_font_color,
        list_background_color: this.colorConfig.list_background_color,
        list_state_color: this.colorConfig.list_state_color,
        list_keymap_color: this.colorConfig.list_keymap_color,
        list_explain_focus_font_color: this.colorConfig.list_explain_focus_font_color,
        list_explain_font_color: this.colorConfig.list_explain_font_color,
        list_focus_background_color: this.colorConfig.list_focus_background_color,
        list_focus_font_color: this.colorConfig.list_focus_font_color,
        list_focus_state_color: this.colorConfig.list_focus_state_color,
        list_focus_keymap_color: this.colorConfig.list_focus_keymap_color,
        list_current_background_color: this.colorConfig.list_current_background_color,
        list_current_font_color: this.colorConfig.list_current_font_color,
        list_current_state_color: this.colorConfig.list_current_state_color,
        list_current_focus_background_color: this.colorConfig.list_current_focus_background_color,
        list_current_focus_font_color: this.colorConfig.list_current_focus_font_color,
        list_current_focus_state_color: this.colorConfig.list_current_focus_state_color,
        background_color: this.colorConfig.background_color,
        border_color: this.colorConfig.border_color,
      });
      this.store();
    },
    resetColor() {
      this.$confirm(this.lang('resetConfirm'), this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        validate.extend(this.storageConfig, {
          list_font_color: userConfig.list_font_color,
          list_background_color: userConfig.list_background_color,
          list_state_color: userConfig.list_state_color,
          list_keymap_color: userConfig.list_keymap_color,
          list_explain_focus_font_color: userConfig.list_explain_focus_font_color,
          list_explain_font_color: userConfig.list_explain_font_color,
          list_focus_background_color: userConfig.list_focus_background_color,
          list_focus_font_color: userConfig.list_focus_font_color,
          list_focus_state_color: userConfig.list_focus_state_color,
          list_focus_keymap_color: userConfig.list_focus_keymap_color,
          list_current_background_color: userConfig.list_current_background_color,
          list_current_font_color: userConfig.list_current_font_color,
          list_current_state_color: userConfig.list_current_state_color,
          list_current_focus_background_color: userConfig.list_current_focus_background_color,
          list_current_focus_font_color: userConfig.list_current_focus_font_color,
          list_current_focus_state_color: userConfig.list_current_focus_state_color,
          background_color: userConfig.background_color,
          border_color: userConfig.border_color,
        });
        this.colorConfig = this.storageConfig;
        this.store();
      }).catch(() => {
      });
    },

    updateWorkspace() {
      validate.extend(this.storageConfig, {
        workspaces: this.workspacesConfig.workspaces,
        active_workspace_type: this.workspacesConfig.active_workspace_type,
        pinned: this.workspacesConfig.pinned
      });
      this.store();
    },

    changeThemeMode() {
      document.querySelector('html').style.filter = this.workspacesConfig.theme_mode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
      validate.extend(this.storageConfig, { theme_mode: this.workspacesConfig.theme_mode});
      this.store();
    },
    showWorkspaceName() {
      validate.extend(this.storageConfig, { show_workspace_name: this.workspacesConfig.show_workspace_name});
      this.store();
    },
    followWorkspaceOrder() {
      validate.extend(this.storageConfig, { button_follow_workspace: this.workspacesConfig.button_follow_workspace});
      this.store();
    },
    changeWorkspaceState(type) {
      let workspace = this.allWorkspaces[type];
      if(workspace.isEnabled) {
        // 可能已经存在了
        // if(this.workspacesConfig.workspaces.indexOf(type) >= 0) return;
        this.workspacesConfig.workspaces.push(type);
        this.updateWorkspace();
        return;
      }

      if(this.workspacesConfig.workspaces.length <= 1) {
        // 此时页面还刷新，要等一会儿，不然事件不同步
        setTimeout(() => {
          this.$set(this.allWorkspaces[type], 'isEnabled', true);
        }, 1);
        this.$message({
          type: 'warning',
          message: this.lang('workspaceCountLimit'),
        });
        return;
      }

      let index = this.workspacesConfig.workspaces.indexOf(type);
      this.workspacesConfig.workspaces.splice(index, 1);
      if(this.workspacesConfig.pinned && this.workspacesConfig.active_workspace_type == type) {
        this.workspacesConfig.pinned = false;
      }

      this.updateWorkspace();
    },
    toPin(type) {
      if(this.allWorkspaces[type].isEnabled == false) {
        this.$message({
          type: 'warning',
          message: this.lang('workspaceEnable'),
        });
        return;
      }

      if( ! this.workspacesConfig.pinned) {
        this.workspacesConfig.active_workspace_type = type;
        this.workspacesConfig.pinned = true;
        this.updateWorkspace();
        return;
      }

      if(this.workspacesConfig.active_workspace_type == type) {
        this.workspacesConfig.pinned = false;
        this.updateWorkspace();
        return;
      }

      // this.config.pinned = true;
      this.workspacesConfig.active_workspace_type = type;

      this.updateWorkspace();
    },

    share() {
      let whitelist = {};
      for(let type in this.colorAttributes) {
        whitelist[ type ] = true;
      }

      this.download('SaveTabsConfig.json', JSON.stringify(validate.cleanAttributes(
        this.storageConfig, whitelist
      )));
    },
    load() {
      document.getElementById('upload').click();
    },

    leadOut(type) {
      let allKeys = {};
      for(let t in this.workspaceAttributes) {
        allKeys[ this.workspaceAttributes[t].key ] = [];
      }

      let keys = {}
      if(type == 'all') {
        keys = allKeys;
      } else {
        keys[ this.workspaceAttributes[type].key ] = [];
      }

      chrome.storage.local.get(keys, items => {
        let data = {};
        if(type == 'all') {
          Object.keys(this.workspaceAttributes).forEach(type => {
            let key = this.workspaceAttributes[ type ].key;
            let attributesArray = this.workspaceAttributes[ type ].attributes.array;
            let attributes = {};
            for(let t in attributesArray) {
              attributes[ t ] = true;
            }
            data[ type ] = items[ key ].map(row => {
              return validate.cleanAttributes(row, attributes);
            })
          })
        } else {
          let key = this.workspaceAttributes[ type ].key;
          let attributesArray = this.workspaceAttributes[ type ].attributes.array;
          let attributes = {};
          for(let t in attributesArray) {
            attributes[ t ] = true;
          }
          data[ type ] = items[ key ].map(row => {
            return validate.cleanAttributes(row, attributes);
          })
        }

        this.download('SaveTabs'+validate.capitalize(type)+'Data.json', JSON.stringify(data));
      })
    },
    leadIn(type) {
      let uploadNode = document.getElementById('upload2');
      uploadNode.setAttribute('data-type', type);
      uploadNode.click();
    },
    clearData: function(type) {
      let keys = [];
      if(type == 'all') {
        for(let t in this.workspaceAttributes) {
          keys.push(this.workspaceAttributes[t].key);
        }
      } else {
        keys.push(this.workspaceAttributes[type].key);
      }

      this.$confirm(this.lang('clearDataConfirm')+validate.capitalize(this.lang(type))+this.lang('clearDataConfirm2'), this.lang(type), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        chrome.storage.local.remove(keys, () => {
          this.$message({
            type: 'success',
            message: validate.capitalize(this.lang(type))+this.lang('clearDataSuccess')
          });
        });
      }).catch(() => {
      });
    },
    download: function(filename, data) {
      var urlObject = window.URL || window.webkitURL || window;
      var blob = new Blob([data], {type: "application/json"});
      var url = urlObject.createObjectURL(blob);

      chrome.downloads.download({
          url: url,
          filename: filename,
          //saveAs: false,
      });
    }
  },
  mounted: function(){
    let activeName = this.getUrlParam('type');
    if(['page', 'color', 'workspace', 'other', 'praise'].indexOf(activeName) != -1) {
      this.activeName = activeName;
    }

    //创建拖拽对象
    // this.sortable =
    Sortable.create(document.querySelector('.list'), {
      // sort: this.isEditOrder, //是否可进行拖拽排序
      animation: 150,
      // 过滤器，不需要进行拖动的元素
      // filter: ".disabled",
      // ghostClass: 'ghost',
      draggable: '.enabled',
      chosenClass: 'chosen',
      //拖拽完成，移除拖拽之前的位置上的元素，在拖拽之后的位置上添加拖拽元素
      onEnd: ({ newIndex, oldIndex }) => {
        if(newIndex == oldIndex) {
          return;
        }
        if(newIndex >= this.workspacesConfig.workspaces.length) {
          newIndex = this.workspacesConfig.workspaces.length-1;
        }
        this.workspacesConfig.workspaces.splice(newIndex, 0, this.workspacesConfig.workspaces.splice(oldIndex , 1)[0]);

        this.updateWorkspace();
      }
    })


    chrome.storage.sync.get({'config': {}}, items => {
      Object.assign(this.storageConfig, items.config);
      Object.assign(this.pageConfig, items.config);
      Object.assign(this.colorConfig, items.config);
      Object.assign(this.workspacesConfig, items.config);

      if(this.workspacesConfig.theme_mode == 'dark') {
        document.querySelector('html').style.filter = 'invert(1) hue-rotate(180deg)';
      }

      Object.keys( this.allWorkspaces).filter(type => {
        if(this.workspacesConfig.workspaces.indexOf(type) == -1) {
          this.allWorkspaces[type].isEnabled = false;
        }
      })
    });

    // 颜色校验
    validate.validators.color = function(value) {
      if(value == null || value == undefined) {
        return undefined;
      }
      if(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value)) {
        return undefined;
      }
      return 'invalid color'
    };
    // 数组校验
    validate.validators.array = (arrayItems, itemConstraints) => {
      if( ! Array.isArray(arrayItems)) return { errors: 'not array' };
      if(arrayItems.length <= 0) return { errors: 'can\'t not be empty' };
      const arrayItemErrors = arrayItems.reduce((errors, item, index) => {
        const error = validate(item, itemConstraints)
        if (error) errors[index] = { error: error }
        return errors
      }, [])

      return arrayItemErrors.length == 0 ? null : { errors: arrayItemErrors }
    }

    let fileInput = document.getElementById('upload');
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        fileInput.value = "";

        let data = reader.result;
        try {
          data = JSON.parse(data);
        } catch(e) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }

        if(validate(data, this.colorAttributes) != undefined) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }

        let whitelist = {};
        for(let type in this.colorAttributes) {
          whitelist[ type ] = true;
        }

        data = validate.cleanAttributes(data, whitelist);

        validate.extend(this.colorConfig, data);

        this.$message({
          type: 'success',
          message: this.lang('settingImportMessage')
        });
      };
      reader.readAsText(fileInput.files[0]);
    });

    let fileInput2 = document.getElementById('upload2');
    fileInput2.addEventListener('change', (event) => {
      if (fileInput2.files.length === 0) {
        return;
      }

      let type = event.target.getAttribute('data-type');

      const reader = new FileReader();
      reader.onload = () => {
        fileInput2.value = "";

        let data = reader.result;
        try {
          data = JSON.parse(data);
        } catch(e) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }

        let allKeys = {};
        for(let t in this.workspaceAttributes) {
          allKeys[ this.workspaceAttributes[t].key ] = [];
        }

        let keys = {}
        if(type == 'all') {
          keys = allKeys;
        } else {
          keys[ this.workspaceAttributes[type].key ] = [];
        }

        let data2 = {};
        if(type == 'all') {
          // 检查数据
          let emptyCount = 0;
          for(let t2 of Object.keys(this.workspaceAttributes)) {
            if(data[t2] == undefined
            || (Array.isArray(data[t2])
              && data[t2].length == 0)) {
              delete keys[ this.workspaceAttributes[t2].key ];
              emptyCount++;
              continue;
            }

            let attributes = {};
            attributes[ t2 ] = this.workspaceAttributes[ t2 ].attributes
            if(validate(data, attributes) != undefined){
              this.$message({
                type: 'warning',
                message: this.lang('invalidFileFormat')
              });
              return;
            }
          }

          if(emptyCount == Object.keys(this.workspaceAttributes).length) {
            this.$message({
                type: 'info',
                message: this.lang('noDataImport')
              });
              return;
          }

          for(let type of Object.keys(this.workspaceAttributes)) {
            if(data[type] == undefined) continue;

            // 过滤数据
            data2[ this.workspaceAttributes[ type ].key ] = data[type].map((item) => {
              let attributesArray = this.workspaceAttributes[ type ].attributes.array;
              let attributes = {};
              for(let t in attributesArray) {
                attributes[ t ] = true;
              }
              let item2 = validate.cleanAttributes(item, attributes);

              if(attributesArray['tabs'] != undefined) {
                let attributesArray2 = attributesArray['tabs'].array;
                let attributes2 = {};
                for(let t in attributesArray2) {
                  attributes2[ t ] = true;
                }
                item2['tabs'] = item.tabs.map((tabs) => {
                  return validate.cleanAttributes(tabs, attributes2);
                })
              }

              item2['id'] = nanoid();

              return item2;
            })
          }

        } else {
          // 兼容旧版数据
          if(type == 'window') {
            if(data[type] == undefined && Array.isArray(data)) {
              let d = {};
              d[ type ] = data;
              data = d;
            }
          }

          // 检查数据
          if(data[type] == undefined
          || (Array.isArray(data[type])
            && data[type].length == 0)) {
              this.$message({
                type: 'info',
                message: this.lang('noDataImport')
              });
              return;
            }

          let attributes = {};
          attributes[ type ] = this.workspaceAttributes[ type ].attributes;
          if(validate(data, attributes) != undefined){
            this.$message({
              type: 'warning',
              message: this.lang('invalidFileFormat')
            });
            return;
          }

          // 过滤数据
          data2[ this.workspaceAttributes[ type ].key ] = data[type].map((item) => {
            let attributesArray = this.workspaceAttributes[ type ].attributes.array;
            let attributes = {};
            for(let t in attributesArray) {
              attributes[ t ] = true;
            }
            let item2 = validate.cleanAttributes(item, attributes);

            if(attributesArray['tabs'] != undefined) {
              let attributesArray2 = attributesArray['tabs'].array;
              let attributes2 = {};
              for(let t in attributesArray2) {
                attributes2[ t ] = true;
              }
              item2['tabs'] = item.tabs.map((tabs) => {
                return validate.cleanAttributes(tabs, attributes2);
              })
            }

            item2['id'] = nanoid();

            return item2;
          })
        }

        // 保存数据
        let total = 0;
        chrome.storage.local.get(keys, items => {
          for(let type in items) {
            total += data2[ type ].length;
            items[type].unshift(...data2[ type ]);
          }
          chrome.storage.local.set(items, () => {
            this.$message({
              type: 'success',
              message: this.lang('groupImportedSuccess')
                      +total
                      +this.lang('groupImportedSuccess2')
            });
          });
        });

      }
      reader.readAsText(fileInput2.files[0]);
    });
  }
}
</script>

<style>
#app {
  margin-top: 0;
  text-align:center;
}

.item {
  display: flex;
  align-items: center;
}
.item>span {
  width: 90px;
  margin-left: 10px;
}
.item .el-slider {
  flex: 1;
  margin: 0 20px;
}
.item i {
  cursor: pointer;
}

.el-divider {
  margin: 10px 0 20px 0 !important;
}
.el-tabs__content {
  height: 430px;
}
.box-card {
  padding: 10 10 0 10px;
}
.el-card__body {
  padding: 0 !important;
}
/*
.praise .el-col{
  border: 1px solid red;
} */
.describe {
  margin-top: 80px;
  color: #636363;
}

.list {
  padding: 0;
  margin: 0;
  overflow: auto;
}
.list-item {
  padding: 9px;
  background-color: white;
  border: 1px solid gray;
  margin: 9px;
  display: flex;
  align-items: center;
  cursor: move;
}
.list-item.disabled {
  color: #c0c4cc;
  border-color: #ebeef5;
  cursor: not-allowed;
}
/* .list-item.ghost {
} */
.list-item.chosen{
  border-color: #66b1ff;
  background-color:#ecf5ff;
  opacity: 1;
  box-shadow: 2px 3px 3px #bfd9f7;
}

/* 颜色不允许清空 */
.el-color-picker__panel button.el-button.el-color-dropdown__link-btn.el-button--text.el-button--mini {
  display: none !important;
}
</style>

<style>
body {
  background-color: white;
}
</style>