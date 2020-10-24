

document.getElementById('finish_text').innerText = chrome.i18n.getMessage("finishText");
document.addEventListener('DOMContentLoaded', OnLoaded);


function OnLoaded()
{
    var name = prompt(chrome.i18n.getMessage("inputTip"),"")
    if (name == null || name == ""){
        window.close();
        return;
    }

    var _window = window
    chrome.windows.getCurrent(function(window){
        chrome.tabs.getAllInWindow(window.id, function(tabs) {
            var window_tabs = '';
            tabs.forEach(tab => {
                window_tabs += `    <a href="${tab.url}">${tab.title}</a><br/>\n`;
            });

            var data = `<!DOCTYPE>
                        <html>
                        <head>
                            <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
                            <title>SaveTabs</title>
                        </head>
                        <body>
                            ${window_tabs}
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

            exportRaw(name+'.tabs.html', data);
        });
    });
}

function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fakeClick(save_link);
}

function fakeClick(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    obj.dispatchEvent(ev);
}
