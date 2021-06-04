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
  }

  // if(window.tabs.length > 1) {
  //   // 直接交换
  //   console.log('exchangeTab', '直接交换');
  //   chrome.tabs.move(target.id, {windowId: destination.windowId, index: destination.index+1}, () => {
  //     chrome.tabs.move(destination.id, {windowId: target.windowId, index: target.index}, () => {
  //       // // 如果被选中的标签以前是活跃的，则要激活当前标签
  //       // if(destination.active) {
  //       //   chrome.tabs.update(target.id, {active: true}, () => {
  //       //     chrome.tabs.update(destination.id, {active: true})
  //       //   })
  //       // }
  //     })
  //   })
  // }

  // chrome.tabs.move(destination.id, {windowId: target.windowId, index: target.index+1}, () => {
  //   chrome.tabs.move(target.id, {windowId: destination.windowId, index: destination.index}, () => {
  //     // 如果被选中的标签以前是活跃的，则要激活当前标签
  //     if(destination.active) {
  //       chrome.tabs.update(target.id, {active: true}, () => {
  //         chrome.tabs.update(destination.id, {active: true})
  //       })
  //     }
  //   })
  // })


  //   chrome.windows.get(this.selectedTab.windowId, {populate: true}, (window) => {
  //     console.log('jjjjj', window)
  //     if(window.tabs.length > 1) {
  //       // 直接交换
  //       chrome.tabs.move(this.selectedTabId, {windowId: this.currentWindowId, index: this.activeTab.index+1}, () => {
  //         chrome.tabs.move(this.activeTabId, {windowId: this.selectedTab.windowId, index: this.selectedTab.index}, () => {
  //           // 如果被选中的标签以前是活跃的，则要激活当前标签
  //           if(this.selectedTab.active) {
  //             // // 让后台激活标签
  //             // console.log('aaaaaaaaaaaaaaaaaaaa');
  //             // chrome.runtime.sendMessage({
  //             //     type: 'activeTab',
  //             //     tabId: this.activeTabId,
  //             //     windowId: this.activeTab.windowId,
  //             // }, (gggggggggg) => {
  //             //   console.log('gggggg', gggggggggg);
  //             // })
  //             // 当前窗口已关闭，无法激活
  //             // chrome.tabs.update(this.activeTabId, {active: true});
  //           }
  //         });
  //       });
  //     } else if(window.tabs.length == 1 && this.currentTabCount == 1) {
  //       // 无需交换，直接切换过去就行了
  //       console.log('jjjjjjjjjjjjjjjjjjjj', this.selectedTab.windowId, this.currentWindowId);
  //       chrome.windows.update(this.selectedTab.windowId, { focused: true});
  //     } else {
  //       // 先创建空白页，否则可能会引起浏览器崩溃
  //       chrome.tabs.create({windowId: this.selectedTab.windowId}, (tab) => {
  //         // 再进行交换
  //         chrome.tabs.move(this.selectedTabId, {windowId: this.currentWindowId, index: this.activeTab.index+1}, () => {
  //           chrome.tabs.move(this.activeTabId, {windowId: this.selectedTab.windowId, index: this.selectedTab.index}, () => {
  //             // 如果被选中的标签以前是活跃的，则要激活当前标签
  //             if(this.selectedTab.active) {
  //               // // 让后台激活标签
  //               // console.log('aaaaaaaaaaaaaaaaaaaa');
  //               // chrome.runtime.sendMessage({
  //               //     type: 'activeTab',
  //               //     tabId: this.activeTabId,
  //               //     windowId: this.activeTab.windowId,
  //               // }, (gggggggggg) => {
  //               //   console.log('gggggg', gggggggggg);
  //               // })
  //               // 当前窗口已关闭，无法激活
  //               // chrome.tabs.update(this.activeTabId, {active: true});
  //             }
  //           });
  //         })
  //       })
  //     }
  //   })
  // }





  // if(request.type == 'activeTab') {
  //   console.log('kkkkkkkk', request);
  //   chrome.tabs.update(request.tabId, {active: true}, (tab) => {
  //     sendResponse(['gggg', tab]);
  //   });
  //   return;
  // }
})



// if(this.selectedTab.windowId == this.currentWindowId) {
//   // 当前窗口内切换
//   chrome.tabs.move(this.selectedTabId, {index: this.activeTab.index}, () => {
//     chrome.tabs.move(this.activeTabId, {index: this.selectedTab.index}, () => {
//       chrome.tabs.update(this.selectedTabId, {active: true});
//     });
//   });
// } else {
//   // 多个窗口间的切换

//   // 先查询被选中的标签的窗口信息
//   chrome.windows.get(this.selectedTab.windowId, {populate: true}, (window) => {
//     console.log('jjjjj', window)
//     if(window.tabs.length > 1) {
//       // 直接交换
//       chrome.tabs.move(this.selectedTabId, {windowId: this.currentWindowId, index: this.activeTab.index+1}, () => {
//         chrome.tabs.move(this.activeTabId, {windowId: this.selectedTab.windowId, index: this.selectedTab.index}, () => {
//           // 如果被选中的标签以前是活跃的，则要激活当前标签
//           if(this.selectedTab.active) {
//             // // 让后台激活标签
//             // console.log('aaaaaaaaaaaaaaaaaaaa');
//             // chrome.runtime.sendMessage({
//             //     type: 'activeTab',
//             //     tabId: this.activeTabId,
//             //     windowId: this.activeTab.windowId,
//             // }, (gggggggggg) => {
//             //   console.log('gggggg', gggggggggg);
//             // })
//             // 当前窗口已关闭，无法激活
//             // chrome.tabs.update(this.activeTabId, {active: true});
//           }
//         });
//       });
//     } else if(window.tabs.length == 1 && this.currentTabCount == 1) {
//       // 无需交换，直接切换过去就行了
//       console.log('jjjjjjjjjjjjjjjjjjjj', this.selectedTab.windowId, this.currentWindowId);
//       chrome.windows.update(this.selectedTab.windowId, { focused: true});
//     } else {
//       // 先创建空白页，否则可能会引起浏览器崩溃
//       chrome.tabs.create({windowId: this.selectedTab.windowId}, (tab) => {
//         // 再进行交换
//         chrome.tabs.move(this.selectedTabId, {windowId: this.currentWindowId, index: this.activeTab.index+1}, () => {
//           chrome.tabs.move(this.activeTabId, {windowId: this.selectedTab.windowId, index: this.selectedTab.index}, () => {
//             // 如果被选中的标签以前是活跃的，则要激活当前标签
//             if(this.selectedTab.active) {
//               // // 让后台激活标签
//               // console.log('aaaaaaaaaaaaaaaaaaaa');
//               // chrome.runtime.sendMessage({
//               //     type: 'activeTab',
//               //     tabId: this.activeTabId,
//               //     windowId: this.activeTab.windowId,
//               // }, (gggggggggg) => {
//               //   console.log('gggggg', gggggggggg);
//               // })
//               // 当前窗口已关闭，无法激活
//               // chrome.tabs.update(this.activeTabId, {active: true});
//             }
//           });
//         })
//       })
//     }
//   })
// }
