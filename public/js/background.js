
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var filename = request.filename;
    let tabs = request.tabs;
    generate(filename, tabs);
});

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
