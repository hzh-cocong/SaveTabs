<template>
  <el-container id="app">
    <el-header>
      <h3>SaveTabs</h3>
    </el-header>
    <el-main style="width: 560px;margin:auto;">
      <el-row type="flex" justify="center">
        <el-col :span="24">
          <el-tabs v-model="activeName" type="border-card" tab-position="top" align="left">
            <el-tab-pane label="基本设置" name="first">
              <el-form ref="form" :model="form" label-width="110px" :inline="true" size="mini">

                <el-divider>列表项</el-divider>

                <el-form-item label="背景色">
                  <el-color-picker v-model="form.list_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="状态栏颜色">
                  <el-color-picker v-model="form.list_state_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="字体颜色">
                  <el-color-picker v-model="form.list_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="字体大小">
                  <el-input-number v-model="form.list_font_size" :min="12" :max="50" label="描述文字"></el-input-number>
                </el-form-item>

                <el-divider>列表项（选中时）</el-divider>

                <el-form-item label="背景色">
                  <el-color-picker v-model="form.list_focus_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="字体颜色">
                  <el-color-picker v-model="form.list_focus_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="状态栏颜色">
                  <el-color-picker v-model="form.list_focus_state_color"></el-color-picker>
                </el-form-item>

                <el-divider>当前窗口项</el-divider>

                <el-form-item label="背景色">
                  <el-color-picker v-model="form.list_current_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="字体颜色">
                  <el-color-picker v-model="form.list_current_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="状态栏颜色">
                  <el-color-picker v-model="form.list_current_state_color"></el-color-picker>
                </el-form-item>

                <el-divider>当前窗口项（选中时）</el-divider>

                <el-form-item label="背景色">
                  <el-color-picker v-model="form.list_current_focus_background_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="字体颜色">
                  <el-color-picker v-model="form.list_current_focus_font_color"></el-color-picker>
                </el-form-item>
                <el-form-item label="状态栏颜色">
                  <el-color-picker v-model="form.list_current_focus_state_color"></el-color-picker>
                </el-form-item>

                <el-form-item style="float:right;">
                  <input type="file" id="upload" style="display:none">
                  <el-button title="载入别人分享的配置" @click="load">载入</el-button>
                  <el-button title="导出配置以分享" @click="share">分享</el-button>
                  <el-button @click="reset">重置</el-button>
                  <el-popconfirm title="确定保存？" @confirm="store">
                  <el-button type="primary" slot="reference" style="margin-left:10px;">保存</el-button>
                  </el-popconfirm>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="其它功能" name="second">

              <el-divider>分组数据</el-divider>

              <el-popover
                placement="bottom-start"
                title="说明"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                content="只会删除“分组数据”，基本设置不会受影响">
                <el-button slot="reference" icon="el-icon-delete" @click="clearData">数据清理</el-button>
              </el-popover>
              <input type="file" id="upload2" style="display:none">
              <el-popover
                placement="bottom-start"
                title="说明"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                content="暂时只支持来自“导出”的文件">
                <el-button slot="reference" icon="el-icon-upload2" @click="leadIn">导入</el-button>
              </el-popover>
              <el-popover
                placement="bottom-start"
                title="说明"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                content="本站除了“基本设置”，其余数据（即 分组数据）都只是保存在本地。如果你在其它设备登录，则可以先“导出”数据再在其它设备上“导入”。">
                <el-button slot="reference" icon="el-icon-download" @click="leadOut">导出</el-button>
              </el-popover>
              <div style="margin-top: 30px;"></div>

              <el-divider>快捷键设置</el-divider>

              <el-popover
                placement="bottom-start"
                title="说明"
                width="200"
                trigger="hover"
                style="margin-right:10px;"
                content="快速启动程序，提高使用效率">
                <el-button slot="reference" icon="el-icon-key" @click="openTab('chrome://extensions/configureCommands')">添加快捷键</el-button>
              </el-popover>
            </el-tab-pane>
            <el-tab-pane label="支持一下" name="third">
              <el-row>
                <el-col :span="24" style="text-align:center;margin-top: 20px;">
                  你的鼓励，是我的最大动力。
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
                <p class="describe">你也可以登陆 <a href="https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno/reviews" target="_blank">Chrome 网上应用店</a> 给予好评 或 提供支持性建议</p>
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
    store: function() {
      chrome.storage.sync.set({'config': this.form}, () => {
        this.$message('保存成功');
      });
    },
    reset: function() {
      this.$confirm('确定还原默认配置？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.form = JSON.parse(JSON.stringify(config));
        chrome.storage.sync.set({'config': this.form}, () => {
          this.$message('已还原');
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
      this.$confirm('确定删除分组数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        chrome.storage.local.remove("list", () => {
          this.$message({
            type: 'success',
            message: '分组数据已清除'
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
      console.log(fileInput.files);
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
            message: '不是有效的文件格式'
          });
          return;
        }
        if(Object.keys(data).length != Object.keys(this.form).length) {
          this.$message({
            type: 'warning',
            message: '不是有效的文件格式'
          });
          return;
        }
        for(let key in this.form) {
          if(data[key] == undefined) {
            this.$message({
              type: 'warning',
              message: '不是有效的文件格式'
            });
            return;
          }
        }

        this.form = data;
        console.log(this.form)

        this.$message({
          type: 'success',
          message: '文件载入成功，点击“保存”按钮即可生效'
        });
      };
      reader.readAsText(fileInput.files[0]);
    });

    let fileInput2 = document.getElementById('upload2');
    fileInput2.addEventListener('change', () => {
      console.log(fileInput2.files);
      if (fileInput2.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        console.log('sssfffffffffffff')
        fileInput2.value = "";

        let data = reader.result;
        console.log(data);
        try {
          data = JSON.parse(data);
        } catch(e) {
          this.$message({
            type: 'warning',
            message: '不是有效的文件格式1'
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
            message: '不是有效的文件格式2'
          });
          return;
        }
        for(let group of data) {
          if(group.constructor !== Object) {
            this.$message({
              type: 'warning',
              message: '不是有效的文件格式3'
            });
            return;
          }
          if(Object.keys(group).length != Object.keys(check).length) {
            this.$message({
              type: 'warning',
              message: '不是有效的文件格式4'
            });
            return;
          }
          for(let key in check) {
            if(group[key] == undefined) {
              this.$message({
                type: 'warning',
                message: '不是有效的文件格式5'
              });
              return;
            }
          }

          if( ! (group['tabs'] instanceof Array)) {
            this.$message({
              type: 'warning',
              message: '不是有效的文件格式6'
            });
            return;
          }
          for(let tab of group['tabs']) {
            if(tab.constructor !== Object) {
              this.$message({
                type: 'warning',
                message: '不是有效的文件格式7'
              });
              return;
            }
            if(Object.keys(tab).length != Object.keys(check['tabs'][0]).length) {
              this.$message({
                type: 'warning',
                message: '不是有效的文件格式8'
              });
              return;
            }
            for(let key in check['tabs'][0]) {
              if(tab[key] == undefined) {
                this.$message({
                  type: 'warning',
                  message: '不是有效的文件格式9'
                });
                return;
              }
            }
          }
        }

        console.log('文件格式正确');
        data = data.map((group) => {
          group.isActive = false
          group.id = nanoid();
          group.windowId = 0;
          return group;
        });
        console.log(data);

        chrome.storage.local.get({'list': []}, items => {
          items.list.push(...data);
          chrome.storage.local.set({list: items.list}, () => {
            this.$message({
              type: 'success',
              message: '文件导入成功'
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
