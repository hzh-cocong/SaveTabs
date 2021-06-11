
import menus from './menus.config.js'

export default menus.reduce((accumulator, menu) => {
  accumulator.push(...menu.children.map((submenu) => {
    let name = menu.name+'-'+submenu.name;
    let path = '/'+name;

    // import 不支持变量
    // let componentPath = './'
    //                   + menu.name[0].toLocaleUpperCase().concat(menu.name.slice(1))
    //                   + submenu.name[0].toLocaleUpperCase().concat(submenu.name.slice(1))
    //                   + '.vue';
    return {
      name: name,
      path: path,
      component: () => import('./'
                              + menu.name[0].toLocaleUpperCase().concat(menu.name.slice(1))
                              + submenu.name[0].toLocaleUpperCase().concat(submenu.name.slice(1))
                              + '.vue'),
    }
  }))
  return accumulator;
}, [{ name: 'general', path: '/', component: () => import('./General.vue') }])