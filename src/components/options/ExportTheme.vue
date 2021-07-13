<template>
  <div class="export-theme">
    <el-row :gutter="20">
      <el-col :xl="12">
        <el-card
          class="box-card"
          header="主题"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="leadIn">导入（单个或多个主题）</el-button>
          <el-button
            icon="el-icon-download"
            style="margin-bottom: 10px;margin-left: 0;margin-right: 10px;"
            @click="leadOut">导出所有用户主题（不含系统自带主题）</el-button>
        </el-card>
      </el-col>
      <el-col :xl="12">
        <el-card
          class="box-card"
          header="旧版（来自颜色分享）"
          :body-style="{ paddingBottom: '10px' }">
          <el-button
            icon="el-icon-upload2"
            style="margin-bottom: 10px;margin-right: 10px;"
            @click="clearData('note')">导入</el-button>
        </el-card>
      </el-col>
    </el-row>

    <input type="file" id="upload" style="display:none">

  </div>
</template>

<script>

import { nanoid } from 'nanoid'
import projectConfig from '@/config/project_config.json'
var validate = require("validate.js");

export default {
  name: 'ExportTheme',
  inject: [ 'changeTheme' ],
  data() {
    return {
      themeAttribute: projectConfig.themeAttributes,
    }
  },
  methods: {
    leadOut() {
      chrome.storage.local.get({ theme: []}, items => {
console.log('leadOut.items', items)

        let data = validate.cleanAttributes(items.theme, this.themeAttribute);

console.log('leadOut.data', JSON.parse(JSON.stringify(data)))

        // let attributesArray = this.themeAttribute.user_theme_list.array;
        // let attributes = Object.keys(attributesArray).reduce((accumulator, key) => {
        //   accumulator[ key ] = true;
        //   return accumulator;
        // }, {});
        if(data.user_theme_list != undefined) {
          data.user_theme_list = data.user_theme_list.map(theme => {
            return validate.cleanAttributes(theme, this.themeAttribute.user_theme_list.array)
          })
        }

console.log('leadOut.data2', data)

        this.download('SaveTabsThemes.json', JSON.stringify(data));
      })
    },
    leadIn() {
      let uploadNode = document.getElementById('upload');
      uploadNode.click();
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
  mounted() {
    // todo
    window.validate = validate;

    // 颜色校验
    validate.validators.color = function (value) {
      if(value == undefined) return undefined;

      if(/^(#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})|rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\))$/.test(value)) {
        return undefined;
      }
      return 'invalid color'
    };
    // 数组校验
    validate.validators.array = function (arrayItems, itemConstraints) {
      if(arrayItems == undefined) return undefined;
      if( ! Array.isArray(arrayItems)) return { errors: 'not array' };
      if(arrayItems.length <= 0) return undefined;// return { errors: 'can\'t not be empty' };
      const arrayItemErrors = arrayItems.reduce((errors, item, index) => {
        const error = validate(item, itemConstraints)
        if (error) errors[index] = { error: error }
        return errors
      }, [])

      return arrayItemErrors.length == 0 ? null : { errors: arrayItemErrors }
    }
    // 对 对象 的 key 和 value 进行循环校验
    // 暂时没用到
    // validate.validators.object_array = function (value, options) {
    //   if(value == undefined) return undefined; //return "can\'t not be empty";
    //   if( ! (value instanceof Object) || Array.isArray(value)) return "not object";

    //   let keys = Object.keys(value);
    //   for(let key of keys) {
    //     const error = validate({ key }, { key: options.key });
    //     if(error) return error;
    //   }

    //   let values = Object.values(value);
    //   for(let value of values) {
    //     const error = validate({ value }, { value: options.value });
    //     if(error) return error;
    //   }
    //   return undefined;
    // }
    // 关联校验
    validate.validators.association = function (self, options, _, attributes) {
      // Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script
      // 暂时去掉，后面再想办法

//       if(typeof(self) == 'object') return 'formate error';
//       for(let key in options) {
// console.log('validate.validators.association', key, options, _);
//         let value = validate.getDeepObjectValue(attributes, key);
//         if(value == undefined) return undefined;
//         if(typeof(value) == 'object') return 'formate error';
// console.log('validate.validators.association2', key, value);
//         let format = options[key];
//         let func = format.strtr({
//           "[self]": typeof(self)=='string' ? `"${self}"` : self,
//           "[value]": typeof(value)=='string' ? `"${value}"` : value,
//         })
// console.log('validate.validators.association3', func, eval(func));
//         if(eval(func) == false) return 'formate error';
//       }

      return undefined;
    }

    let fileInput = document.getElementById('upload');
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length === 0) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(fileInput.files[0]);
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
console.log('validate33', data,this.themeAttribute,' | ',validate(data, this.themeAttribute))
        if(validate(data, this.themeAttribute) != undefined) {
          this.$message({
            type: 'warning',
            message: this.lang('invalidFileFormat')
          });
          return;
        }


        data = validate.cleanAttributes(data, this.themeAttribute);
        data.user_theme_list = data.user_theme_list == undefined ? [] : data.user_theme_list.map(theme => {
          theme = validate.cleanAttributes(theme, this.themeAttribute.user_theme_list.array)
          theme.id = nanoid();
          return theme;
        })
console.log('export-theme', data);

        // 保存数据
        let total = 0;
        chrome.storage.local.get({ theme: {}}, items => {
          console.log('export-theme2', JSON.parse(JSON.stringify(items.theme)))

          if(Object.keys(items.theme).length != 0) {
            console.log('export-theme21')
            delete items.theme.system_theme_list;
            items.theme.user_theme_list.push(...data.user_theme_list);
          } else {
            console.log('export-theme22')
            items.theme = data;
          }
          total += data.user_theme_list.length;

console.log('export-theme3', items.theme)
          chrome.storage.local.set(items, () => {
            this.changeTheme(items.theme);
            this.$message({
              type: 'success',
              message: `共导入 ${total} 个主题`,
            });
          });
        });
      };
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.export-theme {
  padding:20px;
}
.box-card {
  margin-bottom: 20px;
}
</style>

<style>

</style>