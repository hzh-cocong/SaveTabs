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
function executeScript({tabId=null, onlyInjection=false} = {}) {
  chrome.tabs.executeScript(tabId, { file: "js/injected_script.js" }, () => {
    // 捕获错误，这样插件就不会显示错误
    const error = chrome.runtime.lastError;
    if( ! (error && error.message)) return;

    // window.open toggle
    let windows = chrome.extension.getViews({type: 'tab'});
    if(windows.length > 0) {
      windows.forEach(window => window.close());
      return;
    }

    if(onlyInjection) return;

    chrome.storage.sync.get({'config': {}}, items => {
      chrome.windows.getCurrent((w) => {
        let config = items.config;
        let width = config.width+config.border_width*2+config.padding_width*2;
        let height = config.item_height*config.item_show_count+(config.toolbar_height+10*2)+config.padding_width*2+config.border_width*2+10;
        let left = w.left+(w.width-width)/2;
        let top = w.top+120;

        height += 28; // 窗口标题栏
        height += 30; // 底部状态栏

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
    chrome.browserAction.setPopup({ popup: ''})
  }
})
chrome.storage.sync.get({'config': {}}, items => {
  // if(items.config.show_tab_index) {
  //   showTabIndex = true;
  // }

  console.log('fff', items, Object.keys(items.config))
  // 这个新版本的都弹出，往后的才不弹出
  isFirstInstall = items.config.theme_id === undefined || Object.keys(items.config).length == 0;
})

let activeTabs = new Set();
let activeWindows = new Map();

chrome.tabs.onCreated.addListener((tab)=>{
  console.log('listener.tabs.onCreated', tab);
  activeTabs.add(tab.id);
  activeWindows.set(tab.windowId, tab.id);
})
chrome.tabs.onActivated.addListener(({tabId, windowId})=>{
  let currentWindowId = Array.from(activeWindows.keys()).pop();
  let activeTabId = activeWindows.get(windowId);

  activeWindows.set(windowId, tabId);
console.log('listener.tabs.onActivated', tabId, windowId, currentWindowId, activeTabId);
  if(activeTabId != undefined
    && currentWindowId != undefined
    && currentWindowId != windowId) return;
console.log('listener.tabs.onActivated2', tabId, windowId, currentWindowId, activeTabId);
  activeTabs.delete(tabId);
  activeTabs.add(tabId);
})
chrome.tabs.onRemoved.addListener((tabId)=>{
  console.log('listener.tabs.onRemoved', tabId);
  activeTabs.delete(tabId);
})
chrome.tabs.onMoved.addListener((tabId) => {
  console.log('listener.tabs.onMoved', tabId);
  activeTabs.delete(tabId);
  activeTabs.add(tabId);
})
chrome.tabs.onDetached.addListener((tabId) => {
  console.log('listener.tabs.onDetached', tabId);
  activeTabs.delete(tabId);
  activeTabs.add(tabId);
})
chrome.windows.onFocusChanged.addListener((windowId)=>{
  console.log('listener.tabs.windows.onFocusChanged', windowId);
  let tabId = activeWindows.get(windowId);
  if(tabId != undefined) {
    activeTabs.delete(tabId);
    activeTabs.add(tabId);
  }
  if(windowId != -1) {
    activeWindows.delete(windowId);
    activeWindows.set(windowId, tabId);
  }

  // console.log('ffff', Array.from(activeWindows.keys()).reverse());
  // if(showTabIndex) {
  //   toHideIndex(
  //     windowId == -1 || activeWindows.size == 1
  //   ? Array.from(activeWindows.keys()).reverse()[0]
  //   : Array.from(activeWindows.keys()).reverse()[1]
  //   );
  // }
})
chrome.windows.onRemoved.addListener((windowId)=>{
  console.log('window.onRemoved', windowId)
  activeWindows.delete(windowId);
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background.onMessage', request, sender)

  if(request.type == 'download') {
    var filename = request.filename;
    let tabs = request.tabs;
    generate(filename, tabs);
  } else if(request.type == 'getActiveTabIds') {
    sendResponse([...activeTabs]);
  } else if(request.type == 'getActiveWindowIds') {
    console.log('getActiveWindowIds', [...activeWindows.keys()])
    sendResponse([...activeWindows.keys()]);
  } else if(request.type == 'exchangeTab') {
    let target = request.target;
    let destination = request.destination;
    console.log('exchangeTab', target, destination);

    if(target.windowId == destination.windowId) {
      console.log('exchangeTab', '当前窗口内切换');
      // 当前窗口内切换
      chrome.tabs.move(destination.id, {index: target.index}, () => {
        chrome.tabs.move(target.id, {index: destination.index}, () => {
          chrome.tabs.update(destination.id, {active: true});
        });
      });
    } else {
      // 多个窗口间的切换
      console.log('exchangeTab', '多个窗口间的切换');

      // 先查询被选中的标签的窗口信息
      chrome.windows.get(destination.windowId, {populate: true}, (window) => {
        // 新增标签，防止在交换过程中因为焦点变化而导致顺序混乱
        console.log('exchangeTab', '新增标签，防止在交换过程中因为焦点变化而导致顺序混乱');

        chrome.tabs.create({windowId: target.windowId, index: target.index+1, active: false}, (tab) => {
          console.log('exchangeTab', '空白页创建完成', target.index+1, destination.index+1, tab);
          // 直接交换
          chrome.tabs.move(target.id, {windowId: destination.windowId, index: destination.index+1}, () => {
            chrome.tabs.move(destination.id, {windowId: target.windowId, index: target.index+1}, () => {
              // 关闭空白页面
              console.log('exchangeTab', '关闭空白页面', target.index+1, destination.index+1, tab);
              chrome.tabs.remove(tab.id);
            })
          })
        })
      })
    }
  } else if(request.type == 'closeExtension') {
    console.log('closeExtension', sender, sender.tab && sender.tab.id)

    // 弹出菜单没有tab
    if(sender.tab == undefined) {
      let windows = chrome.extension.getViews({type: 'popup'});
      windows.forEach(window => window.close());
      console.log('close:popup', windows);
      return;
    }

    // window.open 关闭整个窗口
    // if(sender.frameId == 0) { // 点击遮罩也是 frameId = 0，所以不能用这个做判断
    if(sender.frameId == 0 && sender.url == chrome.extension.getURL("savetabs.html")) {
      let windows = chrome.extension.getViews({type: 'tab'});
      windows.forEach(window => window.close());
      console.log('close:window.open')
      return;
    }

    console.log('close:inject')
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
  }
})

chrome.browserAction.onClicked.addListener(() => {
  console.log('9999999999999999999999999')
  executeScript();
})

chrome.commands.onCommand.addListener(command => {
  console.log('command', command);

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

      console.log('mmmmmmmmmmmm', result);
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

      console.log('mmmmmmmmmmmm2', result);
    })
  }
})

console.log('a',isFirstInstall);
chrome.runtime.onInstalled.addListener(() => {
  console.log('b',isFirstInstall);
  if(isFirstInstall) {
    chrome.tabs.create({
      url: chrome.extension.getURL("options.html"),
  });
  }
})

// 插件刷新、升级、安装、浏览器重启，该脚本都会重新执行，临时变量会丢失，所以也不用太过于担心数据量的问题
// alert('hello background.js')