let shoutboxChat = document.querySelector(
  "#top > div.p-body > div > div > div > div.p-body-content > div > div.siropuShoutbox.block > div > div.block-body > ol",
);

let staffOnline = document.querySelector(
    "#top > div.p-body > div > div > div > div.p-body-sidebar > div.uix_sidebarInner > div > div:nth-child(1) > div > ul"
)

let membersOnline = document.querySelector(
    "#top > div.p-body > div > div > div > div.p-body-sidebar > div.uix_sidebarInner > div > div:nth-child(2) > div > div.block-body > div > ul"
)

let BLOCKED;

function watchShoutbox() 
{
    const shoutboxLI = shoutboxChat.children;
    getBlockedUsers().then(r => {
        BLOCKED = r;
        let blockedUser = BLOCKED;
        for(let i = 0; i < shoutboxLI.length; ++i) {
            let userID = shoutboxLI[i].children[1].dataset.userId
            if(blockedUser.User.findIndex(r => r === userID) != -1) {
                shoutboxLI[i].innerText = "";
            }
        }
    });

    const observeShoutbox = new MutationObserver(changes => {
        let newChildrens = changes[0].addedNodes;
        for(let x = 0; x < newChildrens.length; ++x) {
            if(newChildrens[x].nodeType != Node.TEXT_NODE) {
                let userID = newChildrens[x].childNodes[3].dataset.userId;
                if(BLOCKED.User.findIndex(r => r === userID) != -1) {
                    newChildrens[x].innerText = "";
                }
            }
        }
    })
    observeShoutbox.observe(shoutboxChat, {
        childList: true,
    })
}

function getBlockedUsers() 
{
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => {
            resolve(lastStorageArray);
        });
    })
}

function getJSONFile(file)
{
    return new Promise((resolve, reject) => {
        let URL = chrome.runtime.getURL(file)
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(this.responseText);
            }
          };
        xhr.open("GET", URL, true);
        xhr.send();
    })
}

function removeStaffPage() 
{
    let staffBlock = staffOnline.children;
    let blockedUser = BLOCKED;
    for(let i = 0; i < staffBlock.length; ++i) 
    {
        if(!blockedUser) {
            setTimeout(removeStaffPage, 500);
        } else {
            //wtf ?!
            let userID = staffBlock[i].lastElementChild.lastElementChild.firstElementChild.dataset.userId;
            if(blockedUser.User.findIndex(user => user === userID) != -1)
            {
                staffBlock[i].remove()
            }
        }
    }
}

function removeOnlinePage() 
{
    let onlinePage = membersOnline.children;
    let blockedUser = BLOCKED;
    for(let i = 0; i < onlinePage.length; ++i) 
    {
        if(!blockedUser) {
            setTimeout(removeOnlinePage, 500);
        } else {
            //wtf ?!
            let userID = onlinePage[i].firstChild.dataset.userId;
            if(blockedUser.User.findIndex(user => user === userID) != -1)
            {
                onlinePage[i].remove()
            }
        }
    }
}

function ignoreButton()
{
    let markedDone = [];
    const observeToolTop = new MutationObserver(changes => {
        const childrensOfBody = document.body.children;
        
        console.log(childrensOfBody.length);
        for (let i = 0; i < childrensOfBody.length; ++i) 
        {
            if (childrensOfBody[i].className == "tooltip tooltip--member tooltip--top") 
            {
                const specialID = childrensOfBody[i].attributes[1].ownerElement.id;
                
                if(markedDone.indexOf(specialID) < 0) 
                {
                    console.log(childrensOfBody[i]);
                    const toolTip = childrensOfBody[i].children[1].children[0].children[0].children[3]
                    markedDone.push(specialID);
                    
                    const newButtonIgnore = `
                    <a href="#" class="button--link button" id="blockAdminID"><span class="button-text">
                        Block User
                    </span></a>`
                    
                    let newButton = document.createElement('div');
                    newButton.setAttribute('class', 'buttonGroup');
    
                    newButton.innerHTML = newButtonIgnore
                    toolTip.appendChild(newButton);
                    
                    toolTip.children[2].addEventListener("click", (r) => 
                    {
                        const memberToolTip = r.path[3].children[0].attributes;
                        const ID = memberToolTip[0].ownerElement.children[0].attributes[0].textContent.split(/\//g)[2].split(/\./g)[1];
                        
                        chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => 
                        {
                            const newValue = lastStorageArray.User;
                            newValue.push(ID);
                            chrome.storage.sync.set({ "User": newValue }, (d) => 
                            {
                                console.log(`Added new value`)
                            });
                        });
                    })
                    continue;
                } else {
                    continue;
                }
            } else {
                console.log("Nope")
            }
        }
    });

    observeToolTop.observe(document.body, {
        childList: true,
    });

}


/*
chrome.storage.sync.set({key: "Test"}, function() {
    console.log('Value is set to ' + value);
});

chrome.storage.sync.get(['key'], function(result) {
    console.log('Value currently is ' + result.key);
});
*/
const tabURL = location.href;
console.log(tabURL)
if(tabURL === "https://www.panda-community.com/") {
    ignoreButton();
    removeOnlinePage();
    removeStaffPage();
    watchShoutbox();
} else {
    ignoreButton();
}

