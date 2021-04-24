<template>
  <el-container id="app">
    <el-header>
      <h3
        style="display: flex;justify-content: center;">
        <img
          src="./assets/icon_128.png"
          style="wdith:25px;height: 25px;margin-right: 10px;" />
        <span>SaveTabs</span>
      </h3>
    </el-header>
    <el-main style="width: 700px;margin:auto;">
      <el-row type="flex" justify="center">
        <el-col :span="24">
          <el-tabs v-model="activeName" type="border-card" tab-position="top" align="left">
            <el-tab-pane label="页面布局" name="first">

              <el-divider>列表项</el-divider>

              <div class="item">
                <span>宽度</span>
                <el-slider
                    v-model="form.width"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="380"
                    :max="780"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>
              <div class="item">
                <span>高度</span>
                <el-slider
                    v-model="form.item_height"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="39"
                    :max="198"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>
              <div class="item">
                <span>个数</span>
                <el-slider
                    v-model="form.item_show_count"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="1"
                    :max="13"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>
              <div class="item">
                <span>每页数量</span>
                <el-slider
                    v-model="form.list_page_count"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="2"
                    :max="1000"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>

              <el-divider>字体大小</el-divider>

              <div class="item">
                <span>标题</span>
                <el-slider
                    v-model="form.list_font_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="128"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>

              <div class="item">
                <span>副标题</span>
                <el-slider
                    v-model="form.list_explain_font_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="128"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>

              <div class="item">
                <span>状态栏</span>
                <el-slider
                    v-model="form.list_state_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="100"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>

              <div class="item">
                <span>快捷键</span>
                <el-slider
                    v-model="form.list_keymap_size"
                    :show-input="true"
                    input-size="mini"
                    :step="1"
                    :min="12"
                    :max="128"></el-slider>
                <i class="el-icon-refresh-right"></i>
              </div>

            </el-tab-pane>

            <el-tab-pane label="颜色配置" name="ss">
              <el-form ref="form" :model="form" label-width="110px" :inline="true" size="mini">

                <el-divider>{{ lang('listItem') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="form.list_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('stateColor')">
                  <el-color-picker v-model="form.list_state_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('fontColor')">
                  <el-color-picker v-model="form.list_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="页面背景">
                  <el-color-picker v-model="form.background_color"></el-color-picker>
                </el-form-item>

                <el-divider>{{ lang('listItemSelected') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="form.list_focus_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('fontColor')">
                  <el-color-picker v-model="form.list_focus_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('stateColor')">
                  <el-color-picker v-model="form.list_focus_state_color"></el-color-picker>
                </el-form-item>

                <el-divider>{{ lang('currentWindowItem') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="form.list_current_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('fontColor')">
                  <el-color-picker v-model="form.list_current_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('stateColor')">
                  <el-color-picker v-model="form.list_current_state_color"></el-color-picker>
                </el-form-item>

                <el-divider>{{ lang('currentWindowItemSelected') }}</el-divider>

                <el-form-item :label="lang('backgroundColor')">
                  <el-color-picker v-model="form.list_current_focus_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('fontColor')">
                  <el-color-picker v-model="form.list_current_focus_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item :label="lang('stateColor')">
                  <el-color-picker v-model="form.list_current_focus_state_color"></el-color-picker>
                </el-form-item>

                <el-form-item style="float:right;">
                  <input type="file" id="upload" style="display:none">
                  <el-button :title="lang('loadExplain')" @click="load">{{ lang('load') }}</el-button>
                  <el-button :title="lang('shareExplain')" @click="share">{{ lang('share') }}</el-button>
                  <el-button @click="reset">{{ lang('reset') }}</el-button>
                  <el-popconfirm :title="lang('storeConfirm')" @confirm="store">
                  <el-button type="primary" slot="reference" style="margin-left:10px;">{{ lang('store') }}</el-button>
                  </el-popconfirm>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="工作区" name="seconssd">

              <el-divider>{{ '展示顺序' }}</el-divider>

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
                      color: config.pinned
                    && config.activeWorkspaceType == type
                    && allWorkspaces[type].isEnabled
                    ? 'gray' : '#c0c4cc'}"
                    style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  ></svg-icon>
                  <span
                    style="flex: 1; "
                    :style="{ color: config.show_workspace_name
                            ? '' : 'white'}">{{ allWorkspaces[type].title }}</span>
                  <span
                    :style="{
                      color: config.pinned
                    && config.activeWorkspaceType == type
                    && allWorkspaces[type].isEnabled
                    ? 'gray' : '#c0c4cc',}"
                    @click="toPin(type)">
                    <svg-icon
                      name="thumbtack-solid"
                      :style="{transform: config.pinned
                                        && config.activeWorkspaceType == type
                                        && allWorkspaces[type].isEnabled
                                        ? 'rotate(0)' : 'rotate(90deg)'}"
                      style="cursor:pointer;height: 20px;vertical-align: -0.5em;"></svg-icon>
                  </span>
                </li>
                <!-- <li
                  v-for="type in config.workspaces"
                  :key="type">
                  <svg-icon
                    :name="allWorkspaces[type].svg"
                    :style="{
                      color: config.pinned
                    && config.activeWorkspaceType == type
                    && allWorkspaces[type].isEnabled
                    ? 'gray' : '#c0c4cc'}"
                    style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  ></svg-icon>
                  {{ allWorkspaces[type].title }}
                  <el-checkbox v-model="allWorkspaces[type].isEnabled"></el-checkbox>
                </li>
                <li
                  v-for="type in disabledWorkspaces"
                  :key="type">
                  <svg-icon
                    :name="allWorkspaces[type].svg"
                    :style="{
                      color: config.pinned
                    && config.activeWorkspaceType == type
                    && allWorkspaces[type].isEnabled
                    ? 'gray' : '#c0c4cc'}"
                    style="width:16px;margin-right: 10px;vertical-align: -0.50em"
                  ></svg-icon>
                  {{ allWorkspaces[type].title }}
                  <el-checkbox v-model="allWorkspaces[type].isEnabled"></el-checkbox>
                </li> -->
              </ul>

              <el-divider>{{ '其它选项' }}</el-divider>

              <el-checkbox
                size="medium"
                :border="true"
                v-model="config.themeMode"
                true-label="dark"
                false-label="light"
                @change="changeThemeMode">暗黑模式</el-checkbox>
              <el-checkbox
                size="medium"
                :border="true"
                v-model="config.show_workspace_name">显示工作区标题</el-checkbox>
              <el-checkbox
                size="medium"
                :border="true"
                v-model="config.button_follow_workspace">操作按钮跟随工作区顺序</el-checkbox>
              <div style="margin-bottom: 30px;"></div>

            </el-tab-pane>
            <el-tab-pane :label="'数据备份'" name="second">

              <el-divider>{{ lang('groupData') }}</el-divider>

              <el-popover
                placement="bottom-start"
                :title="lang('explain')"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                :content="lang('clearDataExplain')">
                <el-button slot="reference" icon="el-icon-delete" @click="clearData">{{ lang('clearData') }}</el-button>
              </el-popover>
              <input type="file" id="upload2" style="display:none">
              <el-popover
                placement="bottom-start"
                :title="lang('explain')"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                :content=" lang('importExplain') ">
                <el-button slot="reference" icon="el-icon-upload2" @click="leadIn">{{ lang('import') }}</el-button>
              </el-popover>
              <el-popover
                placement="bottom-start"
                :title="lang('explain')"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                :content="lang('exportExplain')">
                <el-button slot="reference" icon="el-icon-download" @click="leadOut">{{ lang('export') }}</el-button>
              </el-popover>
              <div style="margin-top: 30px;"></div>


              <el-divider style="margin-top: 10px;">{{ lang('keySettings') }}</el-divider>

              <el-popover
                placement="bottom-start"
                :title="lang('explain')"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                :content="lang('addKeysExplain')">
                <el-button slot="reference" icon="el-icon-key" @click="openTab('chrome://extensions/configureCommands')">{{ lang('addKeys') }}</el-button>
              </el-popover>


            </el-tab-pane>
            <el-tab-pane :label="lang('praise')" name="third">
              <el-row>
                <el-col :span="24" style="text-align:center;margin-top: 20px;color:gray;">
                  {{ lang('thankYou') }}
                </el-col>
              </el-row>
              <el-row class="praise" :gutter="20" style="margin-top: 50px">
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/WeChatPay.png" style="width:100%;" />
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/PayPal.png" style="width:100%;cursor: pointer;" @click="openTab('https://www.paypal.com/paypalme/hzhcocong')" />
                  </el-card>
                </el-col>
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/Alipay.png" style="width:100%;" />
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

export default {
  name: 'app',
  data: () => ({
    activeName: 'first',
    form: {},

    config: userConfig,
    allWorkspaces: projectConfig.allWorkspaces,
    // disabledWorkspaces: [],
  }),
  computed: {
    disabledWorkspaces() {
      console.log('get.disabledWorkspaces');
      return Object.keys( this.allWorkspaces).filter(type => {
        if(this.config.workspaces.indexOf(type) == -1) {
          this.allWorkspaces[type].isEnabled = false;

          return true;
        } else {
          return false;
        }
      })
      // return Object.keys( this.allWorkspaces).filter(type => {
      //   return this.config.workspaces.indexOf(type) == -1;
      // });
    },
    sortedWrokspaces() {
      return this.config.workspaces.concat(this.disabledWorkspaces);
    }
  },
  methods: {
    changeThemeMode() {
      document.querySelector('.list').style.filter = this.config.themeMode == 'dark' ? 'invert(1) hue-rotate(180deg)' : '';
      chrome.storage.sync.set({'config': this.config}, () => {
        this.$message({
          type: 'success',
          message: this.lang('saveSuccess')
        });
      });
    },
    changeWorkspaceState(type) {
      let workspace = this.allWorkspaces[type];
      if(workspace.isEnabled) {
        // 可能已经存在了
        if(this.config.workspaces.indexOf(type) >= 0) return;

        this.config.workspaces.push(type);
        return;
      }

      if(this.config.workspaces.length <= 1) {
        this.$set(workspace, 'isEnabled', true); // 事件并未取消
        this.$message({
          type: 'warning',
          message: '至少要有一个工作区',
        });
        return;
      }

      let index = this.config.workspaces.indexOf(type);
      this.config.workspaces.splice(index, 1);
      if(this.config.pinned && this.config.activeWorkspaceType == type) {
        this.config.pinned = false;
      }
    },
    toPin(type) {
      let workspace = this.allWorkspaces[type];
      if(workspace.isEnabled == false) {
        this.$message({
          type: 'warning',
          message: '请先启用该工作区',
        });
        return;
      }

      if( ! this.config.pinned) {
        this.config.activeWorkspaceType = type;
        this.config.pinned = true;
        return;
      }

      if(this.config.activeWorkspaceType == type) {
        this.config.pinned = false;
        return;
      }

      // this.config.pinned = true;
      this.config.activeWorkspaceType = type;
    },
    store: function() {
      chrome.storage.sync.set({'config': this.form}, () => {
        this.$message({
          type: 'success',
          message: this.lang('saveSuccess')
        });
      });
    },
    reset: function() {
      this.$confirm(this.lang('resetConfirm'), this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        this.form = JSON.parse(JSON.stringify(this.config));
        chrome.storage.sync.set({'config': this.form}, () => {
          this.$message({
            type: 'success',
            message: this.lang('restored')
          });
        });
      }).catch(() => {
      });
    },
    openTab: function(url) {
      chrome.tabs.create({
        url: url
      });
    },
    share: function() {
      this.download('SaveTabsConfig.json', JSON.stringify(this.form));
    },
    load: function() {
      document.getElementById('upload').click();
    },
    leadOut: function() {
      chrome.storage.local.get({'list': []}, items => {
        let data = items.list.map((group) => {
          delete group.isActive
          delete group.id;
          delete group.windowId;
          return group;
        });
        this.download('SaveTabsWindowData.json', JSON.stringify(data));
      })
    },
    leadIn: function() {
      document.getElementById('upload2').click();
    },
    clearData: function() {
      this.$confirm(this.lang('clearDataConfirm'), this.lang('tip'), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        chrome.storage.local.remove("list", () => {
          this.$message({
            type: 'success',
            message: this.lang('clearDataSuccess')
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
    // todo
    window.vue = this;

    // Object.keys(this.allWorkspaces).filter(type => {
    //   if(this.config.workspaces.indexOf(type) == -1) {
    //     this.allWorkspaces[type].isEnabled = false;
    //   }
    // });

    // this.disabledWorkspaces = Object.keys( projectConfig.allWorkspaces).filter(type => {
    //   if(userConfig.workspaces.indexOf(type) == -1) {
    //     this.allWorkspaces[type].isEnabled = false;

    //     return true;
    //   } else {
    //     return false;
    //   }
    //   // return userConfig.workspaces.indexOf(type) == -1;
    // });

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
        console.log(newIndex, oldIndex);
        if(newIndex >= this.config.workspaces.length) {
          newIndex = this.config.workspaces.length-1;
        }
        this.config.workspaces.splice(newIndex, 0, this.config.workspaces.splice(oldIndex , 1)[0]);
      },
      // onMove: (a,b) => {
      //   console.log(a, b, b.target.className)
      //   // if(b.target.className.indexOf('disabled') >= 0) {
      //   //   console.log('==================', b.target.className.indexOf('disabled') >= 0)
      //   //   return false;
      //   // }
      //   // return 1;
      //   // return false;
      //   // return false;
      //   // return 1;
      // }
    })


    this.form = JSON.parse(JSON.stringify(this.config));
    chrome.storage.sync.get({'config': {}}, items => {
      Object.assign(this.form, items.config);

      if(this.config.themeMode == 'dark') {
        console.error('fjsssssssssssssssssssssssjjj8u9898')
        document.querySelector('html').style.filter = 'invert(1) hue-rotate(180deg)';
      }

    });

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
        if(Object.keys(data).length != Object.keys(this.form).length) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }
        for(let key in this.form) {
          if(data[key] == undefined) {
            this.$message({
              type: 'warning',
              message: this.lang('invalidFileFormat')
            });
            return;
          }
        }

        this.form = data;

        this.$message({
          type: 'success',
          message: this.lang('settingImportMessage')
        });
      };
      reader.readAsText(fileInput.files[0]);
    });

    let fileInput2 = document.getElementById('upload2');
    fileInput2.addEventListener('change', () => {
      if (fileInput2.files.length === 0) {
        return;
      }

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

        let check = {
          "name":"",
          "tabs":[
            {
              "icon":"",
              "title":"",
              "url":""
            }
          ],
        }
        if( ! (data instanceof Array)) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }
        for(let group of data) {
          if(group.constructor !== Object) {
            this.$message({
              type: 'warning',
              message: this.lang('invalidFileFormat')
            });
            return;
          }
          if(Object.keys(group).length != Object.keys(check).length) {
            this.$message({
              type: 'warning',
              message: this.lang('invalidFileFormat')
            });
            return;
          }
          for(let key in check) {
            if(group[key] == undefined) {
              this.$message({
                type: 'warning',
                message: this.lang('invalidFileFormat')
              });
              return;
            }
          }

          if( ! (group['tabs'] instanceof Array)) {
            this.$message({
              type: 'warning',
              message: this.lang('invalidFileFormat')
            });
            return;
          }
          for(let tab of group['tabs']) {
            if(tab.constructor !== Object) {
              this.$message({
                type: 'warning',
                message: this.lang('invalidFileFormat')
              });
              return;
            }
            if(Object.keys(tab).length != Object.keys(check['tabs'][0]).length) {
              this.$message({
                type: 'warning',
                message: this.lang('invalidFileFormat')
              });
              return;
            }
            for(let key in check['tabs'][0]) {
              if(tab[key] == undefined) {
                this.$message({
                  type: 'warning',
                  message: this.lang('invalidFileFormat')
                });
                return;
              }
            }
          }
        }

        data = data.map((group) => {
          group.isActive = false
          group.id = nanoid();
          group.windowId = 0;
          return group;
        });

        chrome.storage.local.get({'list': []}, items => {
          items.list.unshift(...data);
          chrome.storage.local.set({list: items.list}, () => {
            this.$message({
              type: 'success',
              message: this.lang('groupImportedSuccess')
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
.item span {
  width: 100px;
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
  margin-top: 60px;
  color: #636363;
}

.list {
  padding: 0;
  margin: 0;
  overflow: scroll;
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
}
</style>
