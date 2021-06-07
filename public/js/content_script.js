{
  let id = 'container-'+chrome.runtime.id;
  let container = document.getElementById(id);
  if(container != null) {
    container.remove();
    document.body.style.overflow = 'auto';
  } else {
    console.log('ffff')

    let shadow = '0 10px 50px 0 rgb(0 0 0 / 88%)';

    container = document.createElement('div');
    let iframe = document.createElement('iframe');

    container.setAttribute('style', `z-index: 2147483647; position: fixed; top: 0; left: 0;  margin: 0;  padding: 0; width: 100vw; height: 100vh; background-color: transparent;overflow:auto;transition: background-color 0.2s ease-out;`);
    container.id = id;
    container.onclick = function() {
      container.remove();
    }

    // iframe.setAttribute('style', `display:block;margin:0px auto;width: 100px;height: 100px;border-radius: 4px; box-shadow: ${shadow};transition-property: width , height;transition-duration: 0.3s;transition-timing-function: ease-in;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; box-shadow: ${shadow};transition:all 0.3s ease-in;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; transition:all 0.3s ease-in;`);
    //iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; box-shadow: ${shadow};background-color: transparent;transition-property: width , height, margin, background-color;transition-duration: 0.3s;transition-timing-function: ease;`);
    iframe.setAttribute('style', `display:block;margin:100px auto;width: 200px;height: 200px;border-radius: 4px; box-shadow: ${shadow};background-color: white;filter: blur(1px);transition:all 0.2s ease-in;`);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    container.append(iframe);
    document.body.append(container);
    document.body.style.overflow = 'hidden';

    chrome.storage.sync.get({'config': {}}, items => {
      console.log(items);
      let config = items.config;
      let width = config.width+config.border_width*2;
      let height = config.item_height*config.item_show_count+(config.toolbar_height+10*2)+config.padding_width*2+config.border_width*2+10;
      let left = (window.outerWidth-width)/2;
      let top = 50;
      let containerBackgroundColor = "rgba(0, 0, 0, 0.2)";
      let iframeBackgroundColor = config.background_color;
      // let backgroundColor = "rgba(0, 0, 0, 0.5)";
      // let backgroundColor = "transparent";
      let shadow = '0 10px 50px 0 rgb(0 0 0 / 88%)';
      console.log(width, height, left, top, containerBackgroundColor);

      container.style.backgroundColor = containerBackgroundColor;
      iframe.style.width = width+'px';
      iframe.style.height = height+'px';
      iframe.style.marginTop = top+'px';
      iframe.style.backgroundColor = iframeBackgroundColor;
      // iframe.style.boxShadow = shadow;
      iframe.style.filter = "blur(0px)";
      iframe.src = chrome.extension.getURL("savetabs.html");

      // container.setAttribute('style', `z-index: 2147483647; position: fixed; top: 0; left: 0;  margin: 0;  padding: 0; width: 100vw; height: 100vh; background-color: ${containerBackgroundColor};overflow:auto;`);

      // iframe.setAttribute('style', `display:block;margin:${top}px auto;width: ${width}px;height:${height}px;border-radius: 4px; box-shadow: ${shadow};background-color:${iframeBackgroundColor}`);
      // // iframe.setAttribute('style', `position:fixed;left:${left}px;top:${top}px;width: ${width}px;height:${height}px;border-radius: 2px; box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);`);
      // // iframe.setAttribute('scrolling', 'no');
      // iframe.setAttribute('frameborder', '0');
      // iframe.src = chrome.extension.getURL("savetabs.html");
    })

    // container = document.createElement('div');
    // let iframe = document.createElement('iframe');

    // container.setAttribute('style', 'z-index: 2147483647; position: fixed; top: 0; left: 0;  margin: 0;  padding: 0; width: 100vw; height: 100vh; background-color: transparent;');
    // container.id = id;

    // iframe.setAttribute('style', 'margin: 100px; width: 531px;height:436px; border: 2px solid red;border-radius: 2px; box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);');
    // // iframe.setAttribute('scrolling', 'no');
    // // iframe.setAttribute('frameborder', '0');
    // iframe.src = chrome.extension.getURL("savetabs.html");
    // iframe.onload=changeFrameHeight;

    // container.append(iframe);
    // document.body.append(container);

    // window.onresize = function() {
    //   // changeFrameHeight();
    // }

    // function changeFrameHeight(){
    //   // iframe.height = 300;
    //   console.log('jjjjjjjjjjjjjjjjjjjjjjjj', iframe.height, 'fffs')
    //   // let iframeWin = iframe.contentWindow || iframe.contentDocument.parentWindow;
    //   // if (iframeWin.document.body) {
    //   //     iframe.height = iframeWin.document.body.scrollHeight;
    //   //     iframe.width = iframeWin.document.body.scrollWidth;
    //   // }
    //   // console.log('888888888888888', iframe.contentWindow);
    //   // iframe.height = iframe.document.body.scrollHeight;
    //   // console.log('ppppppppppppppp', iframe.document.body.scrollHeight)
    // }
  }
}