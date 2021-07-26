import advertising_config from "@/config/advertising_config.json"

const COUNTRY = {
  CHINA: 1,
  OTHER: 2,
}

let advertising = {
    storageList: [],
    cacheList: [],

    country: chrome.i18n.getMessage('@@ui_locale'),
    searchAdvertising: [],

    isInit: false,

    init: function(localConfig) {
      let country = this.country == 'zh_CN' ? COUNTRY.CHINA : COUNTRY.OTHER;

      this.searchAdvertising = [{
          "name": "京东",
          "formate": "https://union-click.jd.com/jdc?type=union&p=JF8BAGoKGloXWwIKUlZeOE8nAl8JKx9KBVhdDxxtUQ5SQmQWBR1TGxlZAUEPVhcnV20AE14RDQZXBwtVDU1HVGYAGwwRWAYDBwkPCh5CAjg4RB9IADYBVV5ZCE0XBm4PK2sVXDYyZG5tOEonM184&t=W1dCFBBFC0RUQUpADgpQTFs=&e=&tu=http%3A%2F%2Fsearch.jd.com%2FSearch%3Fkeyword%3D{query}%26enc%3Dutf-8",
          "pic": "JD.png",
          "country": 1,
      }, {
          "name": "Amazon",
          "formate": "https://www.amazon.com/gp/search?ie=UTF8&tag=cocong-20&linkCode=ur2&linkId=17322288f8b3f551908623e03d8f3638&camp=1789&creative=9325&index=aps&keywords={query}",
          "pic": "amazon.png",
          "country": 2,
      }].filter(item => item.country == country);

      this.storageList = advertising_config.filter(item => item.country == country);
      this.storageList.unshift(...this.searchAdvertising);

      // 小心，这里污染了广告
      this.storageList.forEach((item, index) => {
        item.type = 'advertising';
        item.realIndex = index;
      })

      this.isInit = true;
    },

    search({keywords, length, config, localConfig, originKeyword}) {
      return new Promise((resolve) => {
        if(this.isInit) resolve();
        else resolve(this.init(localConfig))
      }).then(() => {
        // 查找
        let filterList = this.storageList.filter(advertising => {
          if(advertising.formate != undefined) {
            advertising.url = encodeURI(advertising.formate).replace(new RegExp(encodeURI('{query}'), 'g'), encodeURIComponent(originKeyword));
            return true;
          }

          let name = advertising.name.toUpperCase();
          // 找出不匹配的过滤掉
          return ! keywords.some((keyword) => {
            // 不匹配则为 -1
            return name.indexOf(keyword) == -1;
          });
        })

        // 列表赋值
        this.cacheList = filterList;

        return this.cacheList.slice(0, length);
      })
    },
    load({start, length}) {
      // 加载数据
      return new Promise(resolve => {
        resolve(this.cacheList.slice(start, start+length));
      })
    },

    up(index, keyType) {
      if(keyType == 'meta/ctrl') {
        // 无操作
        return Promise.resolve();
      } else {
        return Promise.resolve({ type: 'up' });
      }
    },
    down(index, keyType) {
      if(keyType == 'meta/ctrl') {
        // 这个操作和鼠标点击或者直接回车是差不多的，区别是 keyType 会被强制为默认的
        return this.openWindow(index, '');
      } else {
        return Promise.resolve({ type: 'down' });
      }
    },
    copy(index) {
      let currentItem = this.cacheList[index];

      let url = currentItem.url;
      if(url == '') return;

      chrome.runtime.sendMessage({
        type: 'copy',
        data: url,
        count: 1,
      })
    },

    openWindow(index, keyType) {
      let currentItem = this.cacheList[index];

      return new Promise(resolve => {
        window.$open(currentItem.url, keyType, (tab, type) => {
          resolve();
        })
      })
    },

  }

  export default advertising;