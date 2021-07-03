export default [{
  name: 'workspace',
  title: '工作区',
  icon: 'el-icon-s-home',
  children: [
    {
      'name': 'general',
      'title': '总览',
    },
    {
      'name': 'all',
      'title': '全部',
    },
    {
      'name': 'export',
      'title': '导入导出',
      'redirect': { 'name': 'export-workspace' },
    },
  ]
},
{
  name: 'theme',
  title: '主题',
  icon: 'el-icon-s-shop',
  children: [
    {
      'name': 'general',
      'title': ' 总览',
      'children': [
        {
          'name': 'test',
          'path': 'test',
          'component': () => import('@/components/options/Test.vue'),
        },
        {
          'name': 'test2',
          'path': 'test2',
          'component': () => import('@/components/options/Test2.vue'),
        },
      ]
    },
    {
      'name': 'export',
      'title': '导入导出',
      'redirect': { 'name': 'export-theme' },
    },
  ]
},
{
  name: 'export',
  title: '导入导出',
  icon: 'el-icon-download',
  children: [
    {
      'name': 'workspace',
      'title': ' 工作区',
    },
    {
      'name': 'theme',
      'title': '主题',
    },
  ]
},
{
  name: 'help',
  title: '帮助',
  icon: 'el-icon-question',
  children: [
    {
      'name': 'workspace',
      'title': '工作区',
    },
    {
      'name': 'keymap',
      'title': '快捷键',
    },
  ]
},
{
  name: 'other',
  title: '其它',
  icon: 'el-icon-more',
  children: [
    {
      'name': 'thanks',
      'title': '鸣谢',
    },
    {
      'name': 'support',
      'title': '支持一下',
    },
    {
      'name': 'share',
      'title': '分享',
    },
    {
      'name': 'advertising',
      'title': '广告',
    },
    {
      'name': 'about',
      'title': '关于',
    },
  ]
}]