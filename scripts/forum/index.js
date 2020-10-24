let shoutboxChat = document.querySelector(
  "#top > div.p-body > div > div > div > div.p-body-content > div > div.siropuShoutbox.block > div > div.block-body > ol"
);

let staffOnline = document.querySelector(
    "#top > div.p-body > div > div > div > div.p-body-sidebar > div.uix_sidebarInner > div > div:nth-child(1) > div > ul"
)

let membersOnline = document.querySelector(
    "#top > div.p-body > div > div > div > div.p-body-sidebar > div.uix_sidebarInner > div > div:nth-child(2) > div > div.block-body > div > ul"
)
/**
 * @description Global variable which holds all of the blocked users
 * @global
 * @type {[String]}
 */
let BLOCKED;

/**
 * @description Watch any shoutbox and events and delets the message whom got blocked
 */
function watchShoutbox() 
{  
    /**
     * @description The childrens from shoutbox, aka all of the messages.
     */
    const shoutboxLI = shoutboxChat.children;

    /**
     * @description The blocked Users.
     */
    let blockedUser = BLOCKED;
    for(let i = 0; i < shoutboxLI.length; ++i) {

        /**
         * @description The userID from all of the messages in shoutbox
         */
        let userID = shoutboxLI[i].children[1].dataset.userId
        if(blockedUser.User.findIndex(r => r === userID) != -1) {
            shoutboxLI[i].innerText = "";
        }
    }

    /**
     * @description The mutationObserver for shoutbox
     */
    const observeShoutbox = new MutationObserver(changes => {

        /**
         * @description The new childrens that got added from DOM
         */
        let newChildrens = changes[0].addedNodes;
        for(let x = 0; x < newChildrens.length; ++x) {
            if(newChildrens[x].nodeType != Node.TEXT_NODE) {

                /**
                 * @description The userID from the new message
                 */
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

/**
 * @description Gives the blocked users 
 */
function getBlockedUsers() 
{
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => {
            resolve(lastStorageArray);
        });
    })
}

/**
 * 
 * @param {any} file The file
 * @description Returns the file data according from root (here)
 */
function getFile(file)
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

/**
 * @description Removes the block persons from staff page online thingy
 */
function removeStaffPage()
{
    /**
     * @description The childrens from staff online parent
     */
    let staffBlock = staffOnline.children;

    /**
     * @description The blocked users
     */
    let blockedUser = BLOCKED;
    for(let i = 0; i < staffBlock.length; ++i) 
    {
        if(!blockedUser) {
            setTimeout(removeStaffPage, 500);
        } else {
            /**
             * @description The userID from the children
             */
            let userID = staffBlock[i].lastElementChild.lastElementChild.firstElementChild.dataset.userId;
            if(blockedUser.User.findIndex(user => user === userID) != -1)
            {
                staffBlock[i].remove()
            }
        }
    }
}

/**
 * @description Removes the users who got blocked form online page
 */
function removeOnlinePage() 
{   
    /**
     * @description The childrens from online page
     */
    let onlinePage = membersOnline.children;

    /**
     * @description The blocked users
     */
    let blockedUser = BLOCKED;
    for(let i = 0; i < onlinePage.length; ++i) 
    {
        if(!blockedUser) {
            setTimeout(removeOnlinePage, 500);
        } else {

            /**
             * @description The userID from the children
             */
            let userID = onlinePage[i].firstChild.dataset.userId;
            if(blockedUser.User.findIndex(user => user === userID) != -1)
            {
                onlinePage[i].remove()
            }
        }
    }
}

/**
 * @description Adds a ignore button to tooltip element
 */
function ignoreButton()
{   
    /**
     * @description Mark those who we have added the button to already
     */
    let markedDone = [];

    /**
     * @description Observe for new changes in the whole DOM
     */
    const observeToolTop = new MutationObserver(changes => 
    {
        /**
         * @description The childrens from the body
         */
        const childrensOfBody = document.body.children;
        
        for (let i = 0; i < childrensOfBody.length; ++i) 
        {
            if (childrensOfBody[i].className == "tooltip tooltip--member tooltip--top") 
            {   
                /**
                 * @description The userID of the user
                 */
                const specialID = childrensOfBody[i].attributes[1].ownerElement.id;
                
                if(markedDone.indexOf(specialID) < 0) 
                {   
                    /**
                     * @description The parent of where the buttons are stored
                     */
                    const toolTip = childrensOfBody[i].children[1].children[0].children[0].children[3]
                    markedDone.push(specialID);
                    
                    /**
                     * @description The new ignore button
                     */
                    const newButtonIgnore = `
                    <a href="#" class="button--link button" id="blockAdminID"><span class="button-text">
                        Block User
                    </span></a>`
                    
                    /**
                     * @description Creating the new ignore button
                     */
                    let newButton = document.createElement('div');
                    newButton.setAttribute('class', 'buttonGroup');
    
                    newButton.innerHTML = newButtonIgnore
                    toolTip.appendChild(newButton);
                    
                    toolTip.children[2].addEventListener("click", (r) => 
                    {   
                        /**
                         * @description The child where holds the specialID
                         */
                        const memberToolTip = r.path[3].children[0].attributes;

                        /**
                         * @description The userID
                         */
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
                }
            }
        }
    });

    observeToolTop.observe(document.body, {
        childList: true,
    });
}

/**
 * @description Removes posts from blocked users
 */
function removePost() 
{   
    /**
     * @description The blocked users
     */
    let blockedUser = BLOCKED;

    /**
     * @description The container which holds all posts
     */
    let innerContainer = document.querySelector(
        "#top > div.p-body > div > div.uix_contentWrapper > div > div > div > div.block.block--messages > div.block-container.lbContainer"
    )

    /**
     * @description All of the post childrens
     */
    const childrenOfInner = innerContainer.children[0].children;

    for (let i = 0; i < childrenOfInner.length; ++i) 
    {   
        /**
         * @description The userID
         */
        const ID = childrenOfInner[i].children[1].children[0].children[0].children[1].children[0].children[0].children[0].attributes[4].value
        if (blockedUser.User.findIndex(user => user === ID) != -1) 
        {
            childrenOfInner[i].remove();
        }
    }

}

/**
 * @description Removes the blocked's user(s) latest profile posts.
 */
function removeLatestProfilePosts() 
{
    /**
     * @description The blocked users
     */
    let blockedUser = BLOCKED;

    /**
     * @description The container which holds all of the posts
     */
    let profilePostsContainer = document.querySelector(
        "#top > div.p-body > div > div > div > div.p-body-sidebar > div.uix_sidebarInner > div > div:nth-child(5) > div > div"
    )

    /**
     * @description The childrens of all the posts
     */
    const childrenOfInner = profilePostsContainer.children;

    for (let i = 1; i < childrenOfInner.length; ++i) 
    {
        /**
         * @description The userID
         */
        const ID = childrenOfInner[i].children[0].children[1].children[0].children[0].dataset.userId;
        if (blockedUser.User.findIndex(user => user === ID) != -1) 
        {
            childrenOfInner[i].remove();
        }
    }
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
if(tabURL === "https://www.panda-community.com/") {
    getBlockedUsers().then(r => {
        BLOCKED = r;
        removeLatestProfilePosts();
        ignoreButton();
        removeOnlinePage();
        removeStaffPage();
        //watchShoutbox();
    })
} else {
    ignoreButton();
}

if(tabURL.includes("https://www.panda-community.com/threads/")) {
    getBlockedUsers().then(r => {
        BLOCKED = r;
        removePost();
    })
}