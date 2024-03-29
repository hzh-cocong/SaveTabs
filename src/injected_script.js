{
  Promise.all([
    new Promise((resolve) => {
      chrome.storage.local.get({'config': {}}, items => {
        resolve(items.config);
      })
    })
  ]).then(([config]) => {
    if(config.theme_inject == undefined) {
      window.open(chrome.extension.getURL("options.html"));
      return;
    }

    let currentThemeConfig = config.theme_inject.config;

    let id = 'container-'+chrome.runtime.id;
    let container = document.getElementById(id);

    if(container != null) {
      let overflow = document.body.getAttribute('data-savetabs-overflow');
      document.body.style.overflow = overflow == null ? 'auto' : overflow;
      document.body.removeAttribute('data-savetabs-overflow');
      container.remove();

      return;
    }

    // 创建容器
    // let containerBackgroundColor = "rgba(0, 0, 0, 0.2)";
    // let containerBackgroundColor = 'transparent';
    let containerBackgroundColor = currentThemeConfig.container_background_color;
    container = document.createElement('div');
    container.setAttribute('style', `z-index: 2147483647;
                                    position: fixed;
                                    top: 0;
                                    left: 0;
                                    margin: 0;
                                    padding: 0;
                                    width: 100vw;
                                    height: 100vh;
                                    background-color: transparent;
                                    overflow:auto;
                                    transition: background-color 0.3s ease;
                                    backdrop-filter: ${currentThemeConfig.container_background_blur <= 0
                                                      || currentThemeConfig.background_blur > 0
                                                    ? 'none'
                                                    : 'blur('+currentThemeConfig.container_background_blur+'px)'};
                                    opacity: ${currentThemeConfig.container_background_blur <= 0
                                            || currentThemeConfig.background_blur > 0
                                            ? 1
                                            : 0};
                                    transition-property: background-color,opacity;
                                    transition-duration: 0.3s;
                                    transition-timing-function: ease;
                                    transition-delay: 0s;
                                  `);
    container.id = id;
    // window blur 会自动关闭，不再需要这个了，否则会导致插件重启
    // container.onclick = function() {
    //   chrome.runtime.sendMessage({ type: 'closeExtension',})
    // }


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
    width = width+'px';
    height = height+'px';

    // 最小宽度
    let minWidth = (280
      + currentThemeConfig.border_width*2
      + currentThemeConfig.padding_width*2)+'px';
    // 最小高度
    let minHeight = (currentThemeConfig.item_height
                  + (currentThemeConfig.toolbar_height+10*2)
                  + currentThemeConfig.padding_width*2
                  + currentThemeConfig.border_width*2+10
                  + (currentThemeConfig.statusbar_show == true ? 30 : 0))
                  +'px';//0;//height;

    // 水平位置
    // let horizontalPosition;
    // if(currentThemeConfig.position_horizontal_align == 'center') horizontalPosition = `left: ${currentThemeConfig.position_horizontal_distance*2}px;right: 0;margin:auto auto`;
    // else if(currentThemeConfig.position_horizontal_align == 'left') horizontalPosition = `left: ${currentThemeConfig.position_horizontal_distance}px`;
    // else if(currentThemeConfig.position_horizontal_align == 'right') horizontalPosition = `right: ${currentThemeConfig.position_horizontal_distance}px`;
    // else horizontalPosition = "left: 0;right: 0;margin:auto auto"; // 不应该出现这种情况
    // 水平位置（侧边栏使用侧滑动画特效）
    let horizontalPosition;
    if(currentThemeConfig.position_horizontal_align == 'center')
      horizontalPosition = `left: ${currentThemeConfig.position_horizontal_distance*2}px;right: 0;margin:auto auto`;
    else if(currentThemeConfig.position_horizontal_align == 'left')
      horizontalPosition = `left: ${currentThemeConfig.position_horizontal_distance == 0
                                  && (currentThemeConfig.width_fill == false
                                    || currentThemeConfig.width_percentage != 100)
                                  ? -150
                                  : currentThemeConfig.position_horizontal_distance}px`;
    else if(currentThemeConfig.position_horizontal_align == 'right')
      horizontalPosition = `right: ${currentThemeConfig.position_horizontal_distance == 0
                                  && (currentThemeConfig.width_fill == false
                                    || currentThemeConfig.width_percentage != 100)
                                  ? -150
                                  : currentThemeConfig.position_horizontal_distance}px`;
    else horizontalPosition = "left: 0;right: 0;margin:auto auto"; // 不应该出现这种情况

    // 垂直位置
    // let verticalPosition;
    // if(currentThemeConfig.position_vertical_align == 'center') verticalPosition = `top: ${currentThemeConfig.position_vertical_distance*2}px;bottom: 0;margin:auto auto`;
    // else if(currentThemeConfig.position_vertical_align == 'top') verticalPosition = `top: ${currentThemeConfig.position_vertical_distance}px`;
    // else if(currentThemeConfig.position_vertical_align == 'bottom') verticalPosition = `bottom: ${currentThemeConfig.position_vertical_distance}px`;
    // else verticalPosition = "top: 0;bottom: 0;margin:auto auto"; // 不应该出现这种情况
    // 垂直位置（侧边栏使用侧滑动画特效）
    let verticalPosition;
    if(currentThemeConfig.position_vertical_align == 'center')
      verticalPosition = `top: ${currentThemeConfig.position_vertical_distance*2}px;bottom: 0;margin:auto auto`;
    else if(currentThemeConfig.position_vertical_align == 'top')
      verticalPosition = `top: ${currentThemeConfig.position_vertical_distance == 0
                              && (currentThemeConfig.height_fill == false
                                || currentThemeConfig.height_percentage != 100)
                              ? -50
                              : currentThemeConfig.position_vertical_distance}px`;
    else if(currentThemeConfig.position_vertical_align == 'bottom')
      verticalPosition = `bottom: ${currentThemeConfig.position_vertical_distance == 0
                                && (currentThemeConfig.height_fill == false
                                  || currentThemeConfig.height_percentage != 100)
                                ? -50
                                : currentThemeConfig.position_vertical_distance}px`;
    else verticalPosition = "top: 0;bottom: 0;margin:auto auto"; // 不应该出现这种情况

    // 圆角
    let leftRadius = '4px';
    let rightRadius = '4px';
    if(currentThemeConfig.position_horizontal_distance == 0
    && (currentThemeConfig.position_horizontal_align == 'left'
      || ( currentThemeConfig.width_fill == true
        && currentThemeConfig.width_percentage == 100))) {
      leftRadius = '0';
    }
    if(currentThemeConfig.position_horizontal_distance == 0
    && (currentThemeConfig.position_horizontal_align == 'right'
      || ( currentThemeConfig.width_fill == true
        && currentThemeConfig.width_percentage == 100))) {
      rightRadius = '0';
    }
    if(currentThemeConfig.position_vertical_distance == 0
    && (currentThemeConfig.position_vertical_align == 'bottom'
      || ( currentThemeConfig.height_fill == true
        && currentThemeConfig.height_percentage == 100))) {
      leftRadius = '0';
      rightRadius = '0';
    }
    if(currentThemeConfig.height_fill == true
      && currentThemeConfig.height_percentage == 100
      && currentThemeConfig.position_vertical_align != 'bottom') {
      leftRadius = '0';
      rightRadius = '0';
    }

    // 使用百分比
    if(currentThemeConfig.width_fill == true) {
      // width = `calc(${currentThemeConfig.width_percentage}% - ${currentThemeConfig.position_horizontal_distance}px)`;
      width = currentThemeConfig.width_percentage+'%';
    }
    if(currentThemeConfig.height_fill == true) {
      // height = `calc(${currentThemeConfig.height_percentage}% - ${currentThemeConfig.position_vertical_distance}px)`;
      height = currentThemeConfig.height_percentage+'%';
    }

    iframe.src = chrome.extension.getURL("savetabs.html");
    iframe.setAttribute('style', `position: fixed;
                                  ${horizontalPosition};
                                  ${verticalPosition};
                                  display: block;
                                  width: ${width};
                                  height: ${height};
                                  min-width: ${minWidth};
                                  min-height: ${minHeight};
                                  border-radius: 0 0 ${rightRadius} ${leftRadius};
                                  background-color: ${iframeBackgroundColor};
                                  box-shadow: ${shadow};
                                  backdrop-filter: ${currentThemeConfig.background_blur <= 0
                                                  ? 'none'
                                                  : 'blur('+currentThemeConfig.background_blur+'px)'};
                                  opacity: 0;
                                  transition-property: opacity,left,right,top,bottom;
                                  transition-duration: 0.15s;
                                  transition-timing-function: ease-out;
                                  transition-delay: .15s;
                                `);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    // 设置蒙版磨砂效果（可和 iframe 蒙版叠加）
    // if(currentThemeConfig.container_background_blur > 0 && currentThemeConfig.background_blur > 0) {
    //   let css = `#${id}:before{
    //     content: '';
    //     position: absolute;
    //     top: 0px; right: 0px; bottom: 0; left: 0;
    //     z-index: -1;
    //     backdrop-filter: blur(${currentThemeConfig.container_background_blur}px);
    //   }`;
    //   let style = document.createElement("style");
    //   style.appendChild(document.createTextNode(css));
    //   document.getElementsByTagName('head')[0].appendChild(style);
    // }

    // localStorage 获取不掉
    // let speed = localStorage.getItem('speed') == 'fast' ? 'fast' : 'smooth';
    // if(speed == 'fast') {
    //   container.style.opacity = 1;
    //   container.style.backgroundColor = containerBackgroundColor;
    //   iframe.style.opacity = 1;
    // }

    container.append(iframe);
    document.body.append(container);
    document.body.setAttribute('data-savetabs-overflow', document.body.style.overflow);
    document.body.style.overflow = 'hidden';

    let zoom = window.outerWidth / window.innerWidth;
    setTimeout(() => {
      container.style.opacity = 1;
      container.style.backgroundColor = containerBackgroundColor;
      iframe.style.opacity = 1;

      if(currentThemeConfig.position_horizontal_align == 'left'
      && currentThemeConfig.position_horizontal_distance == 0
      && (currentThemeConfig.width_fill == false
        || currentThemeConfig.width_percentage != 100)) {
        iframe.style.left = currentThemeConfig.position_horizontal_distance+'px';
      }
      if(currentThemeConfig.position_horizontal_align == 'right'
      && currentThemeConfig.position_horizontal_distance == 0
      && (currentThemeConfig.width_fill == false
        || currentThemeConfig.width_percentage != 100)) {
        iframe.style.right = currentThemeConfig.position_horizontal_distance+'px';
      }
      if(currentThemeConfig.position_vertical_align == 'top'
      && currentThemeConfig.position_vertical_distance == 0
      && (currentThemeConfig.height_fill == false
        || currentThemeConfig.height_percentage != 100)) {
        iframe.style.top = currentThemeConfig.position_vertical_distance+'px';
      }
      if(currentThemeConfig.position_vertical_align == 'bottom'
      && currentThemeConfig.position_vertical_distance == 0
      && (currentThemeConfig.height_fill == false
        || currentThemeConfig.height_percentage != 100)) {
        iframe.style.bottom = currentThemeConfig.position_vertical_distance+'px';
      }

      if(zoom != 1) iframe.style.zoom = 1 / zoom;
    }, 50);

    if(zoom != 1) {
      let intervalID = null;
      let sendTimes = 0;
      setTimeout(function send() {
        sendTimes++;
        chrome.runtime.sendMessage({ type: 'pageZoom', zoom }, (result) => {
          // 捕获错误，这样插件就不会显示错误
          chrome.runtime.lastError;

          if(result == undefined || result.received != true) {
            // 插件还未完全打开，无法接受消息，得重发
            // setTimeout(send, 100);
            return;
          }

          clearInterval(intervalID)
        })

        // 不知道为啥，sendMessage 发送失败不会执行回调，但在 background.js 是会执行的，这里只能使用定时器进行检测
        if(intervalID == null) {
          intervalID = setInterval(function(){
            // 发送不超过 20 次，避免死循环（一般两次就ok了）
            if(sendTimes >= 20) {
              clearInterval(intervalID)
              return;
            }

            send();
          }, 50);
        }
      }, 50)
    }
  })
}