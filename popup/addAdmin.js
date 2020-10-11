(function ($) {
    console.log('Setting')
    chrome.storage.sync.set({ "User": [""] })
})

document.getElementById("saveValue").onclick = () => {
    const value = document.querySelector("#ignore").value;
    chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => {
        const newValue = lastStorageArray.User;
        console.log(newValue);
        newValue.push(value);
        console.log(newValue);
        chrome.storage.sync.set({ "User": newValue }, (d) => {
            console.log(`Added new value`)
        });
    });
}

document.getElementById("removeValue").onclick = () => {
    const value = document.querySelector("#removeignore").value;
    chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => {
        const oldValue = lastStorageArray.User;

        console.log(value);
        const index = oldValue.indexOf(value);
        if(index > -1) {
            console.log("Slicing!");
            oldValue.splice(index, 1)
            console.log(oldValue);
            chrome.storage.sync.set({ "User": oldValue }, (d) => {
                console.log(`remvoing old value`)
            });
        }
    });
}

document.getElementById("printAdmins").onclick = () => {
    renderAdmins()
}

function renderAdmins()  {
    chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => {
        const admin = lastStorageArray.User
        console.log(admin)
        const olElement = document.querySelector('.ignoredAdminsList');
        for(let i = 0; i < admin.length; ++i) {
            let ol = document.createElement('ol')
            ol.setAttribute("adminID", admin[i])
            ol.innerHTML = admin[i];
            olElement.appendChild(ol);
            let button = document.createElement("span");
            button.setAttribute("class", "close")
            button.innerHTML = "&times;"
            ol.appendChild(button)

            button.addEventListener("click", (click) => {
                const adminID = click.path[1].attributes[0].nodeValue;
                chrome.storage.sync.get({ "User": [] }, (lastStorageArray) => {
                    const oldValue = lastStorageArray.User;
            
                    const index = oldValue.indexOf(adminID);
                    if(index > -1) {
                        oldValue.splice(index, 1)
                        chrome.storage.sync.set({ "User": oldValue }, (d) => {
                            console.log(`remvoing old value`)
                        });
                    }
                });
            })
        }
    });
}
