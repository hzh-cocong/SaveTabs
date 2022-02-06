export default [{
  name: 'workspace',
  title: 'workspace',
  icon: 'el-icon-s-home',
  children: [
    {
      'name': 'general',
      'title': 'general',
    },
    {
      'name': 'all',
      'title': 'all',
    },
    {
      'name': 'export',
      'title': 'importOrExport',
      'redirect': { 'name': 'export-workspace' },
    },
  ]
},
{
  name: 'theme',
  title: 'theme',
  icon: 'el-icon-s-shop',
  children: [
    {
      'name': 'general',
      'title': 'general',
    },
    {
      'name': 'adjust',
      'title': 'adjust',
    },
    {
      'name': 'export',
      'title': 'importOrExport',
      'redirect': { 'name': 'export-theme' },
    },
  ]
},
{
  name: 'export',
  title: 'importOrExport',
  icon: 'el-icon-download',
  children: [
    {
      'name': 'workspace',
      'title': 'workspace',
    },
    {
      'name': 'theme',
      'title': 'theme',
    },
  ]
},
{
  name: 'help',
  title: 'help',
  icon: 'el-icon-question',
  children: [
    // {
    //   'name': 'workspace',
    //   'title': 'workspace',
    // },
    {
      'name': 'keymap',
      'title': 'keymap',
    },
    {
      'name': 'tool',
      'title': 'tool',
    },
  ]
},
{
  name: 'other',
  title: 'other',
  icon: 'el-icon-more',
  children: [
    {
      'name': 'thanks',
      'title': 'thanks',
    },
    {
      'name': 'support',
      'title': 'support',
    },
    {
      'name': 'share',
      'title': 'share',
    },
    // {
    //   'name': 'advertising',
    //   'title': 'advertising',
    // },
    {
      'name': 'about',
      'title': 'about',
    },
  ]
}]