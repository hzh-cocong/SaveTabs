<template>
  <div class="export-workspace">
    <el-row :gutter="20">
      <el-col :md="12">
        <el-card
          class="box-card"
          :header="lang('windowData')"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-delete"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="clearData('window')">{{ lang('clearData') }}</el-button>
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadIn('window')">{{ lang('import') }}</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;"
            @click="leadOut('window')">{{ lang('export') }}</el-button>
        </el-card>
      </el-col>
      <el-col :md="12">
        <el-card
          class="box-card"
          :header="lang('noteData')"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-delete"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="clearData('note')">{{ lang('clearData') }}</el-button>
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadIn('note')">{{ lang('import') }}</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;"
            @click="leadOut('note')">{{ lang('export') }}</el-button>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :md="12">
        <el-card
          class="box-card"
          :header="lang('temporaryData')"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-delete"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="clearData('temporary')">{{ lang('clearData') }}</el-button>
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadIn('temporary')">{{ lang('import') }}</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;"
            @click="leadOut('temporary')">{{ lang('export') }}</el-button>
        </el-card>
      </el-col>
      <el-col :md="12">
        <el-card
          class="box-card"
          :header="lang('allData')"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-delete"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="clearData('all')">{{ lang('clearData') }}</el-button>
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadIn('all')">{{ lang('import') }}</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;"
            @click="leadOut(Object.keys(workspaceAttributes))">{{ lang('export') }}</el-button>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :md="12">
        <el-card
          class="box-card"
          header="其它"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-star-on"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="$open('chrome://bookmarks')">{{ lang('bookmarkManagement') }}</el-button>
          <el-button
            icon="el-icon-timer"
            style="margin-bottom: 10px;margin-left: 0;"
            @click="$open('chrome://history')">{{ lang('historyManagement') }}</el-button>
        </el-card>
      </el-col>
    </el-row>

    <input type="file" id="upload" style="display:none">

  </div>
</template>

<script>

import { nanoid } from 'nanoid'
import projectConfig from '@/config/project_config.json'

export default {
  name: 'ExportWorkspace',
  inject: [
    'download',
  ],
  data() {
    return {
      workspaceAttributes: projectConfig.workspaceAttributes,
    }
  },
  methods: {
    leadOut(type) {
      let types = Array.isArray(type) ? type : [ type ];
      let keys = types.reduce((accumulator, type) => {
        accumulator[ this.workspaceAttributes[type].key ] = [];
        return accumulator;
      }, {});
console.log('leadOut', type, types, keys)
      chrome.storage.local.get(keys, items => {
        let data = types.reduce((accumulator, type) => {
          let key = this.workspaceAttributes[ type ].key;
          let attributesArray = this.workspaceAttributes[ type ].attributes.array;
          let attributes = Object.keys(attributesArray).reduce((accumulator, key) => {
            accumulator[ key ] = true;
            return accumulator;
          }, {});

          accumulator[ type ] = items[ key ].map(row => {
            return this.$validate.cleanAttributes(row, attributes);
          })
          return accumulator;
        }, {});
console.log('leadOut.data', data)
        this.download('SaveTabs'
                      +this.$validate.capitalize(Array.isArray(type) ? 'all' : type)
                      +'Data.json'
                      , JSON.stringify(data));
      })
    },
    leadIn(type) {
      let uploadNode = document.getElementById('upload');
      uploadNode.setAttribute('data-type', type);
      uploadNode.click();
    },
    clearData(type) {
      let keys = [];
      if(type == 'all') {
        for(let t in this.workspaceAttributes) {
          keys.push(this.workspaceAttributes[t].key);
        }
      } else {
        keys.push(this.workspaceAttributes[type].key);
      }

      this.$confirm(this.lang('clearDataConfirm')+this.$validate.capitalize(this.lang(type))+this.lang('clearDataConfirm2'), this.lang(type), {
        confirmButtonText: this.lang('sure'),
        cancelButtonText: this.lang('cancel'),
        type: 'warning',
        center: true
      }).then(() => {
        chrome.storage.local.remove(keys, () => {
          this.$message({
            type: 'success',
            message: this.$validate.capitalize(this.lang(type))+this.lang('clearDataSuccess')
          });
        });
      }).catch(() => {
      });
    },
  },
  mounted() {
    // 导入数据
    let fileInput = document.getElementById('upload');
    fileInput.addEventListener('change', (event) => {
      if (fileInput.files.length === 0) {
        return;
      }

      let type = event.target.getAttribute('data-type');

      const reader = new FileReader();
      reader.readAsText(fileInput.files[0]);
      reader.onload = () => {
        // 这样才能重复导入相同的文件
        fileInput.value = "";

        // 最初的校验
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

        // 精准校验

        // 构造数据存储的 key
        let types = type == 'all' ? Object.keys(this.workspaceAttributes) : [ type ];
        let keys = types.reduce((accumulator, type) => {
          accumulator[ this.workspaceAttributes[type].key ] = [];
          return accumulator;
        }, {});

        // 开始校验

        // 空数据校验
        let types2 = [ ...types ];
        for(let type of types) {
          if(data[type] == undefined
          || ( Array.isArray(data[type])
            && data[type].length == 0)) {
            delete keys[ this.workspaceAttributes[type].key ];
            types2.splice(types2.indexOf(type), 1);
            continue;
          }
        }
        types = types2;
        if(types.length == 0) {
          this.$message({
            type: 'info',
            message: this.lang('noDataImport')
          });
          return;
        }
console.log('upload', types)
        // 数据格式校验
        for(let type of types) {
          let attributes = {};
          attributes[ type ] = this.workspaceAttributes[ type ].attributes;
          console.log('vvv', type, attributes[ type ])
          if(this.$validate(data, attributes) != undefined){
            console.log('vvv2', this.$validate(data, attributes));
            this.$message({
              type: 'warning',
              message: this.lang('invalidFileFormat')
            });
            return;
          }
        }
        // 过滤数据
        let data2 = {};
        for(let type of types) {
          data2[ this.workspaceAttributes[ type ].key ] = data[type].map((item) => {
            let attributesArray = this.workspaceAttributes[ type ].attributes.array;
            let attributes = Object.keys(attributesArray).reduce((accumulator, key) => {
              accumulator[ key ] = true;
              return accumulator;
            }, {});
            let item2 = this.$validate.cleanAttributes(item, attributes);

            if(attributesArray['tabs'] != undefined) {
              let attributesArray2 = attributesArray['tabs'].array;
              let attributes2 = Object.keys(attributesArray2).reduce((accumulator, key) => {
                accumulator[ key ] = true;
                return accumulator;
              }, {});
              item2['tabs'] = item.tabs.map((tabs) => {
                return this.$validate.cleanAttributes(tabs, attributes2);
              })
            }

            item2['id'] = nanoid();

            return item2;
          })
        }
console.log('update', keys)
        // 保存数据
        let total = 0;
        chrome.storage.local.get(keys, items => {
          console.log('update', items, data2)
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
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.export-workspace {
  padding:20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>