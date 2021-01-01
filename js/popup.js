

document.getElementById('content').innerText = chrome.i18n.getMessage("content");
document.getElementById('download').innerText = chrome.i18n.getMessage("download");
document.addEventListener('DOMContentLoaded', OnLoaded);

function OnLoaded()
{
    var filename = prompt(chrome.i18n.getMessage("inputTip"),"")
    if (filename == null || filename == ""){
        window.close();
        return;
    }

    chrome.runtime.sendMessage({
        filename: filename,
    });
}