{
  console.log('bbbbbbbbbbbbbbbbbbbbbbbb0')
  Promise.all([
    new Promise((resolve) => {
      chrome.storage.sync.get({'config': {}}, items => {
        resolve(items.config);
      })
    })
  ]).then(([config]) => {
    console.log('inject:storage.get', config);

    let id = 'container-'+chrome.runtime.id;
    let container = document.getElementById(id);

    if(container != null) {
      // document.body.style.position = 'inherit';
      document.body.style.overflow = 'auto';
      container.remove();

      return;
    }

    // 创建容器
    container = document.createElement('div');
    container.setAttribute('style', `z-index: 2147483647; position: fixed; top: 0; left: 0;  margin: 0;  padding: 0; width: 100vw; height: 100vh; background-color: transparent;overflow:auto;transition: background-color 0.3s ease;`);
    container.id = id;
    container.onclick = function() {
      chrome.runtime.sendMessage({ type: 'closeExtension',})
    }


    // 创建 iframe
    let iframe = document.createElement('iframe');

    let shadow = '0 5px 20px 0 rgba(0, 0, 0, 0.25)';
    let width = config.width+config.border_width*2+config.padding_width*2;
    let height = config.item_height*config.item_show_count+(config.toolbar_height+10*2)+config.padding_width*2+config.border_width*2+10;
    let left = (window.outerWidth-width)/2;
    let top = 50;
    let containerBackgroundColor = "rgba(0, 0, 0, 0.2)";
    let iframeBackgroundColor = config.background_color;
    height += 30; // 底部状态栏

    iframe.src = chrome.extension.getURL("savetabs.html");
    iframe.setAttribute('style', `display:block;
                                  margin:100px auto;
                                  margin-top: ${top}px;
                                  width: ${width}px;
                                  height: ${height}px;
                                  border-radius: 0 0 4px 4px;
                                  background-color: ${iframeBackgroundColor};
                                  box-shadow: ${shadow};`);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    container.append(iframe);
    document.body.append(container);
    document.body.style.overflow = 'hidden';

    iframe.contentWindow.focus();

    // 没用
    // iframe.focus();
  })

  // 没用
  // chrome.tabs.getCurrent(tab => {
  //   chrome.tabs.update(tab.id, {active: true})
  // })

  // 没用
  // window.focus();
}