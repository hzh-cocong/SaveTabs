<p align="center">
    <a href="https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno"><img src="./docs/images/icon.png" width="100"/></a>
    <div align="center">
        <span style="font-size:16px;">SaveTabs</span> - <span style="font-size:14px;font-weight:300;">A chrome extension of save multiple tabs</span>
    </div>
</p>
<div align="center">
    <div><a style="font-size:12px" href="./docs/languages/README.cn.md">[中文文档]</a></div>
    <div>
        <a href="https://github.com/hzh-cocong/SaveTabs/releases"><img src="https://img.shields.io/github/v/release/hzh-cocong/SaveTabs" /></a>
        <a href="https://github.com/hzh-cocong/SaveTabs/blob/main/LICENSE"><img src="https://img.shields.io/github/license/hzh-cocong/SaveTabs" /></a>
    </div>
</div>

---

## What is SaveTabs?

It's a chrome extension which can save browser tab's url as a file so that you can open it again just like a workspace.

It save the current tabs to the local file like ***\*.tabs.html***. Open this file and you can see the code like this:

```html
<!DOCTYPE>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <title>SaveTabs</title>
</head>

<body>
    <a href="https://github.com/hzh-cocong/SaveTabs">hzh-cocong/SaveTabs: Save brower tabs as a file so that you can
        open them again just like a workspace.</a><br />
    <a href="https://github.com/hzh-cocong/Chrome-Workspace">hzh-cocong/Chrome-Workspace: A alfred workflow for the
        chrome extension of savetabs</a><br />
    <a href="https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno?hl=zh-CN">SaveTabs -
        Chrome 网上应用店</a><br />
    <a href="https://www.extfans.com/productivity/ikjiakenkeediiafhihmipcdafkkhdno/">SaveTabs Chrome插件,SaveTabs
        谷歌浏览器插件下载_安装_教程-扩展迷</a><br />

    <script>
        var res = new Object();
        document.querySelectorAll('a').forEach(function (el) {
            var res2 = window.open(el.getAttribute('href'));
            if (res2 == null) {
                res = null;
            }
        })
        if (res != null) {
            window.close()
        };
    </script>
</body>

</html>
```

If you open this file, it will reopen the tab website and you should allow the pop-up window.

You can use the alfred workflow [Chrome-Workspace](https://github.com/hzh-cocong/Chrome-Workspace) to open the file (***\*.tabs.html***) easily.

## Download

[Chrome Web Store](https://chrome.google.com/webstore/detail/savetabs/ikjiakenkeediiafhihmipcdafkkhdno)

[Extfans](https://www.extfans.com/productivity/ikjiakenkeediiafhihmipcdafkkhdno/)

