let intervalTime = 500; //time interval

let screenshot = function (tab) {
    timer = setInterval(function() {
        chrome.tabs.captureVisibleTab({format: "png"}, function(screenshotUrl) {
            if(chrome.runtime.lastError) return;
            if(dict[tab.id] == undefined) {
                dict[tab.id] = screenshotUrl;
            } else {
                if(flag) {
                    markdiff(screenshotUrl,tab.id)
                    flag = false;
                } 
                dict[tab.id] = screenshotUrl;
            }
        })
    }, intervalTime);
}


let calculateDiff = async function(url1, tabid) {

    part1 = cutPic(url1);
    part2 = cutPic(dict[tabid]);
    let ans = compare(part1,part2);
    let diff = resemble(url1)
    .compareTo(dict[tabid])
    .ignoreColors()
    .onComplete(function(data) {
        let img = data.getImageDataUrl();
        if(data.misMatchPercentage > 0.5) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(
                    tabid,
                    { 
                        greeting: "paint",data: img 
                    }, function(response) {
                        
                    });
            });
        }
    });
}

let cutPic = async function (url, width, height) {
    console.log("cutting");
    let img = new Image();
    parts = [];
    const imgSync = new Promise( resolve => {
        img.onload = function() {
                let canvas = document.createElement("canvas");
                let context = canvas.getContext('2d');
                let w = img.width / width;
                let h = img.height / height;
                for(let i = 0; i < width; i ++) {
                    parts[i] = [];
                    for(let j = 0; j < height; j ++) {
                        x = (-w * i);
                        y = (-h * j);
                        canvas.width = w;
                        canvas.height = h;
                        context.drawImage(this, x, y, w * width, h * height);
                        parts[i].push(canvas.toDataURL());
                    }
                }
                resolve();
            };
    });
    
    img.src = url;
    console.log("finished cut");
    await imgSync;
    return parts;
}

let compare = async function(part1, part2) {
    console.log("comparing");
    result = [];
    for(i = 0; i < part1.length; i++) {
        for(j = 0; j < part2.length; j++) {
            if(part1[i][j] != part2[i][j]) {
                result.push([i,j]);
            }
        }
    }
    console.log("finished comparing");
    return result;
}

let draw = function(url1, tabid) {
    console.log("drawing");
    let diff = resemble(url1)
    .compareTo(dict[tabid])
    .ignoreColors()
    .onComplete(function(data) {
        let img = data.getImageDataUrl();
        if(data.misMatchPercentage > 0.3) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(
                    tabid,
                    { 
                        greeting: "P",data: img 
                    }, function(response) {
                        
                    });
            });
        }
    });
    console.log("finished drawing");
    
}

let markdiff = function(url1, tabid) {
    let diff = resemble(url1)
    .compareTo(dict[tabid])
    .ignoreColors()
    .onComplete(function(data) {
        let img = data.getImageDataUrl();
        if(data.misMatchPercentage > 0.5) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(
                    tabid,
                    { 
                        greeting: "paint",data: img 
                    }, function(response) {
                        
                    });
            });
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "paint"){
            var result = document.createElement('div');
            result.id="result";
            result.style.width = "100%";
            result.style.height = "100%";
            result.style.top = "0px";
            result.style.left = "0px";
            result.style.backgroundImage = "url(" + request.data + ")";
            result.style.backgroundSize = "100% 100%"
            result.style.position = "fixed";
            result.addEventListener("click", function(){
                var temp = document.getElementById('result')
                    temp.parentNode.removeChild(temp);
             });
            document.body.appendChild(result);
            sendResponse({confirmation: "1"});
    }
});
