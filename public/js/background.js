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

let activeTabs = new Set();
let activeWindows = new Map();

chrome.tabs.onCreated.addListener((tab)=>{
  activeTabs.add(tab.id);
  activeWindows.set(tab.windowId, tab.id);
})
chrome.tabs.onActivated.addListener(({tabId, windowId})=>{
  activeTabs.delete(tabId);
  activeTabs.add(tabId);
  activeWindows.set(windowId, tabId);
})
chrome.tabs.onRemoved.addListener((tabId)=>{
  activeTabs.delete(tabId);
})
// chrome.tabs.onMoved.addListener((tabId) => {
//   activeTabs.delete(tabId);
//   activeTabs.add(tabId);
// })
// chrome.tabs.onDetached.addListener((tabId) => {
//   activeTabs.delete(tabId);
//   activeTabs.add(tabId);
// })
chrome.windows.onFocusChanged.addListener((windowId)=>{
  let tabId = activeWindows.get(windowId);
  if(tabId != undefined) {
    activeTabs.delete(tabId);
    activeTabs.add(tabId);
  }
})
chrome.windows.onRemoved.addListener((windowId)=>{
  activeWindows.delete(windowId);
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type == 'download') {
    var filename = request.filename;
    let tabs = request.tabs;
    generate(filename, tabs);
    return;
  }
  if(request.type == 'getActiveTabs') {
    sendResponse([...activeTabs]);
    return;
  }
  if(request.type == 'exchangeTab') {
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
        // if(window.tabs.length == 1 && request.targetTabCount == 1) {
        //   // 无需交换，直接切换过去就行了
        //   console.log('exchangeTab', '无需交换，直接切换过去就行了');
        //   chrome.windows.update(destination.windowId, { focused: true});
        //   return;
        // }

        // 新增标签，防止在交换过程中因为焦点变化而导致顺序混乱
        console.log('exchangeTab', '新增标签，防止在交换过程中因为焦点变化而导致顺序混乱');

        chrome.tabs.create({windowId: target.windowId, index: target.index+1, active: false}, (tab) => {
          console.log('exchangeTab', '空白页创建完成', tab);
          // 直接交换
          chrome.tabs.move(target.id, {windowId: destination.windowId, index: destination.index+1}, () => {
            chrome.tabs.move(destination.id, {windowId: target.windowId, index: target.index+1}, () => {
              // 关闭空白页面
              console.log('exchangeTab', '关闭空白页面', tab);
              chrome.tabs.remove(tab.id);
            })
          })
        })
      })
    }
    return;
  }
  if(request.type == 'closeExtension') {
    console.log('closeExtension', sender)

    // 弹出菜单会自己关闭，不用管它
    if(sender.tab == undefined) return;

    // window.open 关闭整个窗口
    if(sender.frameId == 0 && request.windowId) {
      chrome.windows.remove(request.windowId);
      return;
    }

    if(sender.tab != undefined) {
      chrome.tabs.executeScript(sender.tab.id, { file: "js/content_script.js" }, () => {
        // 捕获错误，这样插件就不会显示错误
        const error = chrome.runtime.lastError;
        if( ! (error && error.message)) return;

        // window.open 自己本身触发的切换回导致窗口关闭，加载本身触发，就有可能在窗口关闭的情况下执行，自然执行失败
        console.log("that's impossible", error.message);
      })
    }
    return;
  }
})

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.executeScript(null, { file: "js/content_script.js" }, () => {
    // 捕获错误，这样插件就不会显示错误
    const error = chrome.runtime.lastError;
    if( ! (error && error.message)) return;

    chrome.storage.sync.get({'config': {}}, items => {
      chrome.windows.getCurrent((w) => {
        let config = items.config;
        let width = config.width+config.border_width*2;
        let height = config.item_height*config.item_show_count+(config.toolbar_height+10*2)+config.padding_width*2+config.border_width*2+10;
        let left = w.left+(w.width-width)/2;
        let top = w.top+120;

        height += 28; // 窗口标题栏

        window.open(chrome.extension.getURL("savetabs.html"), "extension_popup", `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,scrollbars=no,resizable=no`);
      })
    })
  })
})

chrome.commands.onCommand.addListener(command => {
  if(command == 'test') {
    chrome.browserAction.getPopup({}, (url)=>{
      if(url != '') {
        chrome.browserAction.setPopup({popup: ''})
      } else {
        chrome.browserAction.setPopup({popup: 'savetabs.html'})
      }
    })
  }
})