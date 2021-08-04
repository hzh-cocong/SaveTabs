import Vue from 'vue'
let validate = require("validate.js");

// 颜色校验（允许为空）
validate.validators.color = function (value) {
  if(value == undefined) return undefined;

  if(/^(#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})|rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\))$/.test(value)) {
    return undefined;
  }
  return 'invalid color'
};

// 数组校验（允许为空）
validate.validators.array = function (arrayItems, itemConstraints) {
  if(arrayItems == undefined) return undefined;
  if( ! Array.isArray(arrayItems)) return { errors: 'not array' };
  if(arrayItems.length <= 0) return undefined;// return { errors: 'can\'t not be empty' };
  const arrayItemErrors = arrayItems.reduce((errors, item, index) => {
    const error = validate(item, itemConstraints)
    if (error) errors[index] = { error: error }
    return errors
  }, [])

  return arrayItemErrors.length == 0 ? undefined : { errors: arrayItemErrors }
}

// 对 对象 的 key 和 value 进行循环校验（允许为空）
validate.validators.object_array = function (value, options) {
  if(value == undefined) return undefined;
  if( ! (value instanceof Object) || Array.isArray(value)) return "not object";

  let keys = Object.keys(value);
  for(let key of keys) {
    const error = validate({ key }, { key: options.key });
    if(error) return error;
  }

  let values = Object.values(value);
  for(let value of values) {
    const error = validate({ value }, { value: options.value });
    if(error) return error;
  }
  return undefined;
}

// 关联校验
  // Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script
  // 暂时去掉，后面再想办法
validate.validators.association = function (/*self, options, _, attributes*/) {
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

const MyPlugin = {
  install(Vue) {
    Vue.prototype.$validate = validate;
  }
}
Vue.use(MyPlugin)