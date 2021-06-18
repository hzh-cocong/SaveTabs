
let _device = (function() {
  let platform = '';
  let isPC = true;
  let u = navigator.userAgent;
  if(u.match(/Mobile/i)) {
    // 移动端
    if(u.indexOf('Android') > -1 || u.indexOf('Adr') > -1) {
      platform = 'Android';
    } else if(u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
      platform = 'IOS';
    }
    isPC = false;
  } else {
    // PC 端口
    if(u.indexOf("Windows",0) != -1) {
      platform = 'Win';
    } else if(u.indexOf("Mac",0) != -1) {
      platform = 'Mac';
    } else if(u.indexOf("Linux",0) != -1) {
      platform = 'Linux';
    } else if(u.indexOf("X11",0) != -1) {
      platform = 'Unix';
    }
    isPC = true;
  }
  return {
    platform: platform,
    isPC: isPC
  };
})();

let isKeyDown = false;
let title = null;
window.addEventListener('keydown', (event) => {
  console.log('keydown', event)

  if((_device.platform == 'Mac' && event.keyCode == 91)
  || (_device.platform != 'Mac' && event.keyCode == 17)) {
    if(isKeyDown) return;
    isKeyDown = true;

    try {
      chrome.runtime.sendMessage({
        type: 'to-show-index',
      })
    } catch (err) {
      console.log(err)
    }
  } else {
    let index = event.keyCode-49+1;
    if(index > 0 && index <= 9) return;

    if(title !== null) {
      chrome.runtime.sendMessage({
        type: 'to-hide-index',
      })
    }
  }
})
window.addEventListener('keyup', (event) => {
  console.log('keyup', event, title)

  // 起到矫正作用，避免因为一些意想不到的流程而导致 isKeyDown 一直为true
  isKeyDown = false;

  if(title !== null) {
    try {
      chrome.runtime.sendMessage({
        type: 'to-hide-index',
      })
    } catch (err) {
      console.log(err)
    }
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type == 'show-index') {
    if(title !== null) return;

    title = document.title;

    if(_device.platform == 'Mac') {
      document.title = `⌘${request.index} ${title}`;
    } else {
      document.title = `Alt+${request.index} ${title}`;
    }
  }
})
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type == 'hide-index') {
    if(title === null) return;

    document.title = title;
    title = null;

    isKeyDown = false;
  }
})