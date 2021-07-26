let search = {
  workspaceList: [],
  cacheList: [],

  storageKeyword: '',
  config: [],

  parent: {},

  isInit: false,

  init: function() {
    this.workspaceList = this.config.workspaces.filter(
      workspace => workspace != 'all'
    ).map(workspace => ({
      type: 'toggle',
      workspace: workspace,
      name: this.parent.lang(workspace) + ( this.parent.lang(workspace) == workspace ? '' : ` (${workspace}) `),
    }));

    this.isInit = true;
  },

  search({length, config, originKeyword, parent}) {
    this.config = config;
    this.parent = parent;

    return new Promise((resolve) => {
      if(this.isInit) resolve();
      else resolve(this.init())
    }).then(() => {
      this.storageKeyword = originKeyword;

      let keyword = this.workspaceStorageKeyword().toUpperCase().split(/\s+/)[0];
      let filterList =  this.workspaceList.filter( workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 );

      // 搜不到则展示全部工作区
      let keywords = filterList.length > 0
                    ? this.workspaceStorageKeyword().split(/\s+/).slice(1).join(' ')
                    : this.workspaceStorageKeyword().split(/\s+/).join(' ');
      filterList = filterList.length > 0 ? filterList : this.workspaceList

      // 列表赋值
      this.cacheList = filterList.map((workspace, index) => {
        workspace.tip = keywords == '' ? '' : `Search ${workspace.workspace} for '<strong>${keywords.escape()}</strong>'`;
        workspace.realIndex = index;
        return workspace;
      })

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
  copy() {
    // do nothing
  },

  openWindow(index, keyType) {
    let currentItem = this.cacheList[index];
    return new Promise(resolve => {
      let keywords;
      let keyword = this.workspaceStorageKeyword().toUpperCase().split(/\s+/)[0];
      if(this.workspaceList.some(workspace => workspace.name.toUpperCase().indexOf(keyword) != -1 )) {
        keywords = this.workspaceStorageKeyword().split(/\s+/).slice(1).join(' ');
      } else {
        keywords =  this.workspaceStorageKeyword().split(/\s+/).join(' ');
      }
      // this.input(keywords, currentItem.workspace);
      resolve({ type: 'input', keywords, workspace: currentItem.workspace});
    })
  },

  workspaceStorageKeyword() {
    return this.storageKeyword.substr(this.config.workspace_change_word.length).trim();
  },
}

export default search;