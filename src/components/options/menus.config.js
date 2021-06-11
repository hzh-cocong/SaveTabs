export default [{
  name: 'workspace',
  title: '工作区',
  icon: 'el-icon-s-home',
  children: [{
    'name': 'general',
    'title': '总览',
  },
  {
    'name': 'all',
    'title': '全部',
  },
  {
    'name': 'window',
    'title': '窗口',
  },
  {
    'name': 'note',
    'title': '便签',
  },
  {
    'name': 'temporary',
    'title': '临时窗口',
  },
  {
    'name': 'tab',
    'title': '活跃标签',
  },
  {
    'name': 'bookmark',
    'title': '书签',
  },
  {
    'name': 'hisotory',
    'title': '历史记录',
  },
  {
    'name': 'export',
    'title': '导入导出',
  },]
},
{
  name: 'theme',
  title: '主题',
  icon: 'el-icon-s-shop',
  children: [{
    'name': 'general',
    'title': ' 总览',
  }, {
    'name': 'export',
    'title': '导入导出',
  }]
},
{
  name: 'export',
  title: '导入导出',
  icon: 'el-icon-download',
  children: [{
    'name': 'workspace',
    'title': ' 工作区',
  }, {
    'name': 'theme',
    'title': '主题',
  }]
},
{
  name: 'help',
  title: '帮助',
  icon: 'el-icon-s-help',
  children: [{
    'name': 'workspace',
    'title': '工作区',
  }, {
    'name': 'keymap',
    'title': '快捷键',
  }]
},
{
  name: 'other',
  title: '更多',
  icon: 'el-icon-more',
  children: [{
    'name': 'thanks',
    'title': '鸣谢',
  }, {
    'name': 'support',
    'title': '支持一下',
  }, {
    'name': 'version',
    'title': '版本',
  }, {
    'name': 'about',
    'title': '关于',
  }, {
    'name': 'advertising',
    'title': '广告',
  }, {
    'name': 'share',
    'title': '分享',
  }]
}]