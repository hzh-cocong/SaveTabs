function generate(filename, tabs)
{
  var href = '';
  tabs.forEach(tab => {
      href += `    <a href="${tab.url}">${tab.title}</a><br/>\n`;
  });

  var data = `<!DOCTYPE>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <title>SaveTabs</title>
</head>
<body>
${href}
    <script>
        var res = new Object();
        document.querySelectorAll('a').forEach(function(el){
            var res2 = window.open(el.getAttribute('href'));
            if(res2 == null) {
                res = null;
            }
        })
        if(res != null) {
            window.close()
        };
    </script>
</body>
</html>`;

  download(filename, data);
}

function download(filename, data, path)
{
  var urlObject = window.URL || window.webkitURL || window;
  var blob = new Blob([data], {type: "text/html"});
  var url = urlObject.createObjectURL(blob);

  chrome.downloads.download({
      url: url,
      filename: filename,
      //saveAs: false,
  }, (downloadId) => {
  });
}

// 新建窗口，如果窗口存在，则关闭窗口
function executeScript({tabId=null, onlyInjection=false, callback=undefined} = {}) {
  chrome.tabs.executeScript(tabId, { file: "js/injected_script.js" }, () => {
    // 捕获错误，这样插件就不会显示错误
    const error = chrome.runtime.lastError;
    if( ! (error && error.message)) {
      callback != undefined && callback();
      return;
    }

    // 这里还是专心执行脚本吧，避免混乱
    // window.open toggle
    // let windows = chrome.extension.getViews({type: 'tab'});
    // if(windows.length > 0) {
    //   windows.forEach(window => {
    //     // 避免把 options 页面也给关闭了
    //     if(window.location.href.indexOf(chrome.extension.getURL("savetabs.html")) == 0) {
    //       window.close();
    //     }
    //   });
    //   return;
    // }

    if(onlyInjection) return;

    chrome.storage.local.get({'config': {}}, items => {
      if(items.config.theme_inject == undefined) {
        window.open(chrome.extension.getURL("options.html"));
        // window.open(chrome.extension.getURL("options.html"), "extension_popup", `width=200,height=200,left=0,top=0,menubar=no,status=no,scrollbars=no,resizable=no`);
        // 不支持
        // chrome.tabs.create({
        //   url: chrome.extension.getURL("options.html"),
        // });
        return;
      }

      chrome.windows.getCurrent((w) => {
        let currentThemeConfig = items.config.theme_inject.config;
        let width =  currentThemeConfig.width
                    +currentThemeConfig.border_width*2
                    +currentThemeConfig.padding_width*2;
        let height = currentThemeConfig.item_height*currentThemeConfig.item_show_count
                    +(currentThemeConfig.toolbar_height+10*2)
                    +currentThemeConfig.padding_width*2
                    +currentThemeConfig.border_width*2+10;

        if(currentThemeConfig.statusbar_show == true) height += 30; // 底部状态栏
        // height += 28; // 窗口标题栏

        // let left = w.left+(w.width-width)/2;
        // let top = w.top+120;

        // let offset = 79-28;// 浏览器标题栏 和 窗口标题栏 的编译叠加（不含书签栏）
        let offset = items.config.adjust_window_top; // 51

        // 使用百分比
        if(currentThemeConfig.width_fill == true) {
          width =  w.width*currentThemeConfig.width_percentage/100;
        }
        if(currentThemeConfig.height_fill == true) {
          height = (w.height-offset-28)*currentThemeConfig.height_percentage/100;
          // height += 28; // 窗口标题栏
        }

        height += items.config.adjust_window_height; // 28
        width += items.config.adjust_window_width;

        // 水平位置
        // currentThemeConfig.position_horizontal_align='right';
        let left;
        if(currentThemeConfig.position_horizontal_align == 'center') left = w.left+(w.width-width)/2+currentThemeConfig.position_horizontal_distance;
        else if(currentThemeConfig.position_horizontal_align == 'left') left = w.left+currentThemeConfig.position_horizontal_distance;
        else if(currentThemeConfig.position_horizontal_align == 'right') left = w.left+w.width-width-currentThemeConfig.position_horizontal_distance;
        else left = w.left+(w.width-width)/2; // 不应该出现这种情况

        // 垂直位置
        // currentThemeConfig.position_vertical_align='center';
        // currentThemeConfig.position_vertical_align='top';
        // currentThemeConfig.position_vertical_distance=10;
        let top;
        if(currentThemeConfig.position_vertical_align == 'center') top = w.top+(w.height-offset-height)/2+offset+currentThemeConfig.position_vertical_distance;
        else if(currentThemeConfig.position_vertical_align == 'top') top = w.top+currentThemeConfig.position_vertical_distance+offset;
        else if(currentThemeConfig.position_vertical_align == 'bottom') top = w.top+w.height-height-currentThemeConfig.position_vertical_distance;
        else top = w.top+(w.height-height)/2; // 不应该出现这种情况

        window.open(chrome.extension.getURL("savetabs.html"), "extension_popup", `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,scrollbars=no,resizable=no`);
      })
    })
  })
}

// let showTabIndex = false;
// let isShowIndex = false;
// function toShowIndex(windowId) {
//   // if( ! showTabIndex) return;

//   // if(windowId == -1) return;
//   if( ! (windowId >= 0)) return;

//   isShowIndex = true;

//   chrome.windows.get(windowId, {populate: true}, (window) => {
//     let length = window.tabs.length;
//     window.tabs.filter(tab => {
//       return tab.status == 'complete'
//           && ( tab.index+1 <= 8
//               || tab.index+1 == length );
//     }).forEach((tab) => {
//       chrome.tabs.sendMessage(tab.id, {
//         type: 'show-index',
//         index: tab.index+1 > 9 ? 9 : tab.index+1,
//       })
//     })
//   })
// }
// function toHideIndex(windowId, force=false) {
//   // if( ! showTabIndex) return;

//   if( ! isShowIndex && ! force) return;

//   // if(windowId == -1) return;
//   if( ! (windowId >= 0)) return;

//   isShowIndex = false;

//   chrome.windows.get(windowId, {populate: true}, (window) => {
//     let length = window.tabs.length;
//     window.tabs.filter(tab => {
//       return tab.status == 'complete'
//           && ( tab.index+1 <= 8
//               || tab.index+1 == length );
//     }).forEach((tab) => {
//       chrome.tabs.sendMessage(tab.id, {
//         type: 'hide-index'
//       })
//     })
//   })
// }

let isFirstInstall = false;
chrome.storage.local.get({'config': {}}, items => {
  if(items.config.popup == false) {
    chrome.browserAction.setPopup({ popup: '' });
  }

  // 这个新版本的都弹出，往后的才不弹出
  isFirstInstall = items.config.theme_popup == undefined;
})
// chrome.storage.sync.get({'config': {}}, items => {
//   // if(items.config.show_tab_index) {
//   //   showTabIndex = true;
//   // }
// })

let activeTabs = new Set();
let activeWindows = new Map();

chrome.tabs.onCreated.addListener((tab)=>{
  activeTabs.add(tab.id);
  activeWindows.set(tab.windowId, tab.id);
})
chrome.tabs.onActivated.addListener(({tabId, windowId})=>{
  let currentWindowId = Array.from(activeWindows.keys()).pop();
  let activeTabId = activeWindows.get(windowId);

  activeWindows.set(windowId, tabId);

  if(activeTabId != undefined
    && currentWindowId != undefined
    && currentWindowId != windowId) return;

  activeTabs.delete(tabId);
  activeTabs.add(tabId);
})
chrome.tabs.onRemoved.addListener((tabId)=>{
  activeTabs.delete(tabId);
})
chrome.tabs.onMoved.addListener((tabId) => {
  activeTabs.delete(tabId);
  activeTabs.add(tabId);
})
chrome.tabs.onDetached.addListener((tabId) => {
  activeTabs.delete(tabId);
  activeTabs.add(tabId);
})
chrome.windows.onFocusChanged.addListener((windowId)=>{
  let tabId = activeWindows.get(windowId);
  if(tabId != undefined) {
    activeTabs.delete(tabId);
    activeTabs.add(tabId);
  }
  if(windowId != -1) {
    activeWindows.delete(windowId);
    activeWindows.set(windowId, tabId);
  }

  // if(showTabIndex) {
  //   toHideIndex(
  //     windowId == -1 || activeWindows.size == 1
  //   ? Array.from(activeWindows.keys()).reverse()[0]
  //   : Array.from(activeWindows.keys()).reverse()[1]
  //   );
  // }
})
chrome.windows.onRemoved.addListener((windowId)=>{
  activeWindows.delete(windowId);
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type == 'download') {
    var filename = request.filename;
    let tabs = request.tabs;
    generate(filename, tabs);
  } else if(request.type == 'getActiveTabIds') {
    sendResponse([...activeTabs]);
  } else if(request.type == 'getActiveWindowIds') {
    sendResponse([...activeWindows.keys()]);
  } else if(request.type == 'exchangeTab') {
    let target = request.target;
    let destination = request.destination;

    if(target.windowId == destination.windowId) {
      // 当前窗口内切换
      chrome.tabs.move(destination.id, {index: target.index}, () => {
        chrome.tabs.move(target.id, {index: destination.index}, () => {
          chrome.tabs.update(destination.id, {active: true});
        });
      });
    } else {
      // 多个窗口间的切换

      // 先查询被选中的标签的窗口信息
      chrome.windows.get(destination.windowId, {populate: true}, (window) => {
        // 新增标签，防止在交换过程中因为焦点变化而导致顺序混乱

        chrome.tabs.create({windowId: target.windowId, index: target.index+1, active: false}, (tab) => {
          // 直接交换
          chrome.tabs.move(target.id, {windowId: destination.windowId, index: destination.index+1}, () => {
            chrome.tabs.move(destination.id, {windowId: target.windowId, index: target.index+1}, () => {
              // 关闭空白页面
              chrome.tabs.remove(tab.id);
            })
          })
        })
      })
    }
  } else if(request.type == 'closeExtension') {
    // 弹出菜单没有tab
    if(sender.tab == undefined) {
      let windows = chrome.extension.getViews({type: 'popup'});
      windows.forEach(window => window.close());
      return;
    }

    // window.open 关闭整个窗口
    // if(sender.frameId == 0) { // 点击遮罩也是 frameId = 0，所以不能用这个做判断
    if(sender.frameId == 0 && sender.url.indexOf(chrome.extension.getURL("savetabs.html")) == 0) {
      let windows = chrome.extension.getViews({type: 'tab'});
      windows.forEach(window => {
        // 避免把 options 页面也给关闭了
        if(window.location.href.indexOf(chrome.extension.getURL("savetabs.html")) == 0) {
          window.close();
        }
      });
      // 这个有可能关不了 Tabs cannot be edited right now (user may be dragging a tab)
      // chrome.tabs.remove(sender.tab.id);
      // 下面这个可能会把 options 页面也给关了
      // let windows = chrome.extension.getViews({type: 'tab'});
      // windows.forEach(window => window.close());
      return;
    }

    executeScript({tabId: sender.tab.id});

    // 关闭 inject-script 创建的窗口
    // chrome.storage.local.get({'info': {}}, items => {
    //   if(items.info.keepOpen) return;
    //   executeScript({tabId: sender.tab.id});
    // });
    // chrome.storage.local.remove('info', () => {
    //   executeScript({tabId: sender.tab.id});
    // });
  } else if(request.type == 'inject') {
    executeScript();
  }
  // else if(request.type == 'to-show-index') {
  //   if(showTabIndex) {
  //     toShowIndex(sender.tab.windowId);
  //   }
  // } else if(request.type == 'to-hide-index') {
  //   if(showTabIndex) {
  //     toHideIndex(sender.tab.windowId, true);
  //   }
  // }
  else if(request.type == 'global_data_change') {
    // sendMessage 应用本身是收不到的，所以要让 background.js 来实现广播
    request.type = 'data_change';
    chrome.runtime.sendMessage(request);
  } else if(request.type == 'copy') {
    // 不行，DOMException: Document is not focused
    // navigator.clipboard.writeText(request.data).then((s) => {
    //   console.log('00000000000001', s, request);
    // }).catch((s) => {
    //   console.log('00000000000002', s, request);
    // })

    // 不行 DOMException: Document is not focused
    // navigator.clipboard.writeText(request.data).then((s) => {
    //     console.log('00000000000001', s, request)
    // }, (s) => {
    //     console.log('00000000000002', s, request)
    // });

    // 可行
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = request.data;
    input.focus();
    input.select();
    try {
      let res = document.execCommand('Copy');
      if(res) {
        chrome.runtime.sendMessage({
          type: 'copySuccessfully',
          data: request.data,
          count: request.count,
        })
      }
    } catch(e) {
    } finally {
      input.remove();
    }
  } else if(request.type == 'restartExtension') {
    // 弹出菜单没有tab
    // 不应该出现
    if(sender.tab == undefined) {
      return;
    }

    // window.open 关闭整个窗口
    // if(sender.frameId == 0) { // 点击遮罩也是 frameId = 0，所以不能用这个做判断
    if(sender.frameId == 0 && sender.url.indexOf(chrome.extension.getURL("savetabs.html")) == 0) {
      let windows = chrome.extension.getViews({type: 'tab'});
      windows.forEach(window => {
        // 避免把 options 页面也给关闭了
        if(window.location.href.indexOf(chrome.extension.getURL("savetabs.html")) == 0) {
          window.close();
        }
      });

      // 重启
      chrome.storage.local.set({'info': {
        show_theme: true,
      }}, () => {
        executeScript({tabId: sender.tab.id});
      })

      return;
    }

    executeScript({tabId: sender.tab.id, callback: () => {
      // 重启
      chrome.storage.local.set({'info': {
        show_theme: true,
      }}, () => {
        executeScript({tabId: sender.tab.id});
      })
    }});
  }
})

chrome.browserAction.onClicked.addListener(() => {
  // 在 window.open 模式下监听不到
  executeScript();
})

chrome.commands.onCommand.addListener(command => {
  if(command.startsWith('open_workspace_')) {
    chrome.runtime.sendMessage({ type: 'isActive',}, (result) => {
      // 捕获错误，这样插件就不会显示错误
      chrome.runtime.lastError;

      let type = command.replace('open_workspace_', '');
      if(result == undefined) {
        // 插件未打开
        chrome.storage.local.set({'info': {
          active_workspace_type: type,
        }}, () => {
          executeScript();
        });
      } else if(result.isActive){
        chrome.runtime.sendMessage({ type: 'to_open_workspace', workspace: type})
      }
    })
  } else if(command.startsWith('add_')) {
    chrome.runtime.sendMessage({ type: 'isActive',}, (result) => {
      // 捕获错误，这样插件就不会显示错误
      chrome.runtime.lastError;

      let type = command.replace('add_', '');
      if(result == undefined) {
        // 插件未打开
        chrome.storage.local.set({'info': {
          active_workspace_type: type,
          add_type: type,
        }}, () => {
          executeScript();
          // todo
          // executeScript({onlyInjection: true});
        });
      } else if(result.isActive){
        chrome.runtime.sendMessage({ type: 'to_add', workspace: type})
      }
    })
  }
})

chrome.runtime.onInstalled.addListener(() => {
  if(isFirstInstall) {
    chrome.tabs.create({
      url: chrome.extension.getURL("options.html"),
    });
  }
})

// 插件刷新、升级、安装、浏览器重启，该脚本都会重新执行，临时变量会丢失，所以也不用太过于担心数据量的问题
// alert('hello background.js')