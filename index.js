let timer = null;
let dict = {};

chrome.tabs.onActivated.addListener(function (activeInfo) {
    clearInterval(timer);
    timer = null;
    chrome.tabs.get(activeInfo.tabId, function callback(tab){
        flag =true;
        try{
            screenshot(tab); 
        } catch(err){
            console.log("err");
        }
    })
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(tab.active && changeInfo.status=="complete"){
        clearInterval(timer);
        timer = null;
        chrome.tabs.get(tabId, function callback(tab){
            flag = false; 
            var url = new URL(tab.url);
            if(dict[tab.id] != undefined){
                delete dict[tabId];
            }
            try{
                screenshot(tab);    
            }catch(err){
                console.log("err");
            }
        });
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    if(removeInfo.isWindowClosing){
        clearInterval(timer);
        timer = null;
    }
    delete dict[tabId];
}); 
