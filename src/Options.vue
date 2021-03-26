<template>
  <el-container id="app">
    <el-header>
      <h3>SaveTabs</h3>
    </el-header>
    <el-main style="width: 560px;margin:auto;">
      <el-row type="flex" justify="center">
        <el-col :span="24">
          <el-tabs v-model="activeName" type="border-card" tab-position="top" align="left">
            <el-tab-pane :label="lang('basicSettings')" name="first">
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
                <el-form-item :label="lang('fontSize')">
                  <el-input-number v-model="form.list_font_size" :min="12" :max="50" label=""></el-input-number>
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
            <el-tab-pane :label="lang('otherFunctions')" name="second">

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

              <el-divider>{{ lang('keySettings') }}</el-divider>

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
                <el-col :span="24" style="text-align:center;margin-top: 20px;">
                  {{ lang('thankYou') }}
                </el-col>
              </el-row>
              <el-row class="praise" :gutter="20" style="margin-top: 50px">
                <el-col :span="8">
                  <el-card class="box-card">
                    <img src="./assets/Alipay.png" style="width:100%;" />
                  </el-card>
                </el-col>
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
import config from './config.json'

export default {
  name: 'app',
  data: () => ({
    activeName: 'first',
    form: {}
  }),
  methods: {
    lang: function(key) {
      return chrome.i18n.getMessage(key);
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
        this.form = JSON.parse(JSON.stringify(config));
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
        this.download('SaveTabsGroupData.json', JSON.stringify(data));
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
    this.form = JSON.parse(JSON.stringify(config));
    chrome.storage.sync.get({'config': {}}, items => {
      Object.assign(this.form, items.config);
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
          items.list.push(...data);
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
  margin-top: 130px;
}
</style>
