{
  console.log('bbbbbbbbbbbbbbbbbbbbbbbb0')
  Promise.all([
    new Promise((resolve) => {
      chrome.storage.local.get({'config': {}}, items => {
        resolve(items.config);
      })
    })
  ]).then(([config]) => {
    console.log('inject:storage.get', config);

    if(config.theme_inject == undefined) {
      window.open(chrome.extension.getURL("options.html"));
      // window.open(chrome.extension.getURL("options.html"), "extension_popup", `width=200,height=200,left=0,top=0,menubar=no,status=no,scrollbars=no,resizable=no`);
      // 不支持
      // chrome.tabs.create({
      //   url: chrome.extension.getURL("options.html"),
      // });
      return;
    }

    let currentThemeConfig = config.theme_inject.config;

    let id = 'container-'+chrome.runtime.id;
    let container = document.getElementById(id);

    if(container != null) {
      // document.body.style.position = 'inherit';
      document.body.style.overflow = 'auto';
      container.remove();

      return;
    }

    // 创建容器
    // let containerBackgroundColor = "rgba(0, 0, 0, 0.2)";
    container = document.createElement('div');
    container.setAttribute('style', `z-index: 2147483647; position: fixed; top: 0; left: 0;  margin: 0;  padding: 0; width: 100vw; height: 100vh; background-color: transparent;overflow:auto;transition: background-color 0.3s ease;`);
    container.id = id;
    container.onclick = function() {
      chrome.runtime.sendMessage({ type: 'closeExtension',})
    }


    // 创建 iframe
    let iframe = document.createElement('iframe');

    let shadow = '0 5px 20px 0 rgba(0, 0, 0, 0.25)';
    let iframeBackgroundColor = currentThemeConfig.background_color;
    let width =  currentThemeConfig.width
                +currentThemeConfig.border_width*2
                +currentThemeConfig.padding_width*2;
    let height = currentThemeConfig.item_height*currentThemeConfig.item_show_count
                +(currentThemeConfig.toolbar_height+10*2)
                +currentThemeConfig.padding_width*2
                +currentThemeConfig.border_width*2+10;
    if(currentThemeConfig.statusbar_show == true) height += 30; // 底部状态栏

    // 水平位置
    let horizontalPosition;
    if(currentThemeConfig.position_horizontal_align == 'center') horizontalPosition = "left: 0;right: 0;margin:auto auto";
    else if(currentThemeConfig.position_horizontal_align == 'left') horizontalPosition = `left: ${currentThemeConfig.position_horizontal_distance}px`;
    else if(currentThemeConfig.position_horizontal_align == 'right') horizontalPosition = `right: ${currentThemeConfig.position_horizontal_distance}px`;
    else horizontalPosition = "left: 0;right: 0;margin:auto auto"; // 不应该出现这种情况

    // 垂直位置
    let verticalPosition;
    if(currentThemeConfig.position_vertical_align == 'center') verticalPosition = "top: 0;bottom: 0;margin:auto auto";
    else if(currentThemeConfig.position_vertical_align == 'top') verticalPosition = `top: ${currentThemeConfig.position_vertical_distance}px`;
    else if(currentThemeConfig.position_vertical_align == 'bottom') verticalPosition = `bottom: ${currentThemeConfig.position_vertical_distance}px`;
    else verticalPosition = "top: 0;bottom: 0;margin:auto auto"; // 不应该出现这种情况

    iframe.src = chrome.extension.getURL("savetabs.html");
    iframe.setAttribute('style', `position: fixed;
                                  ${horizontalPosition};
                                  ${verticalPosition};
                                  display: block;
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