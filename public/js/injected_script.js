{
  let id = 'container-'+chrome.runtime.id;
  let container = document.getElementById(id);
  if(container != null) {
    // document.body.style.position = 'inherit';
    document.body.style.overflow = 'auto';
    container.remove();
  } else {
    console.log('ffff')

    let shadow = '0 10px 50px 0 rgb(0 0 0 / 88%)';

    container = document.createElement('div');
    let iframe = document.createElement('iframe');

    container.setAttribute('style', `z-index: 2147483647; position: fixed; top: 0; left: 0;  margin: 0;  padding: 0; width: 100vw; height: 100vh; background-color: transparent;overflow:auto;transition: background-color 0.3s ease;`);
    container.id = id;
    container.onclick = function() {
      chrome.runtime.sendMessage({ type: 'closeExtension',})

      // document.body.style.position = 'inherit';

      // document.body.style.overflow = 'auto';
      // container.remove();
    }

    iframe.src = chrome.extension.getURL("savetabs.html");

    // iframe.setAttribute('style', `display:block;margin:0px auto;width: 100px;height: 100px;border-radius: 4px; box-shadow: ${shadow};transition-property: width , height;transition-duration: 0.3s;transition-timing-function: ease-in;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; box-shadow: ${shadow};transition:all 0.3s ease-in;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; transition:all 0.3s ease-in;`);
    //iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; box-shadow: ${shadow};background-color: transparent;transition-property: width , height, margin, background-color;transition-duration: 0.3s;transition-timing-function: ease;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 200px;height: 200px;border-radius: 4px; box-shadow: ${shadow};background-color: white;filter: blur(1px);transition:all 0.2s ease-in;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; background-color: white;ransparent;visibility:hidden;transition-property: visibility;transition-duration: 0.15s;transition-timing-function: linear;transition-delay: .15s;`);
    // iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 4px; background-color: white;ransparent;opacity:0;transition-property: opacity;transition-duration: 0.15s;transition-timing-function: ease-out;transition-delay: .15s;`);
    iframe.setAttribute('style', `display:block;margin:100px auto;width: 100px;height: 100px;border-radius: 0 0 4px 4px; background-color: white;ransparent;opacity:0;transition-property: opacity;transition-duration: 0.15s;transition-timing-function: ease-out;transition-delay: .15s;`);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    container.append(iframe);
    document.body.append(container);
    // document.body.style.position = 'fixed';
    // document.body.style.top = window.scrollY+'px';
    document.body.style.overflow = 'hidden';
    // document.body.style.height = '100%';

    chrome.storage.sync.get({'config': {}}, items => {
      console.log(items);
      let config = items.config;
      let width = config.width+config.border_width*2+config.padding_width*2;
      let height = config.item_height*config.item_show_count+(config.toolbar_height+10*2)+config.padding_width*2+config.border_width*2+10;
      let left = (window.outerWidth-width)/2;
      let top = 50;
      let containerBackgroundColor = "rgba(0, 0, 0, 0.2)";
      let iframeBackgroundColor = config.background_color;
      // let backgroundColor = "rgba(0, 0, 0, 0.5)";
      // let backgroundColor = "transparent";
      let shadow = '0 5px 20px 0 rgba(0, 0, 0, 0.25)';
      console.log(width, height, left, top, containerBackgroundColor);

      height += 30; // 底部状态栏

      // container.style.backgroundColor = containerBackgroundColor;
      iframe.style.width = width+'px';
      iframe.style.height = height+'px';
      iframe.style.marginTop = top+'px';
      iframe.style.backgroundColor = iframeBackgroundColor;
      iframe.style.boxShadow = shadow;
      iframe.style.opacity = 1;
    })
  }
}