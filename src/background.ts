const trainerize = '.trainerize.com/app';

chrome.runtime.onInstalled.addListener(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
        return; 
    }

    await chrome.action.setBadgeText({
        text: tab.url.includes(trainerize) ? "OFF" : "",
    });
    if (!tab.url.includes(trainerize)) {
        await chrome.action.setIcon({
            tabId: tab.id,
            path: './assets/disabled.png',
        });
    }
});


//listen for new tab to be activated
chrome.tabs.onActivated.addListener(async function () {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
        return;
    }

    if (!tab.url.includes(trainerize)) {
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: '',
        });
        await chrome.action.setIcon({
            tabId: tab.id,
            path: './assets/disabled.png',
        });
    } else {
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: await chrome.action.getBadgeText({ tabId: tab.id }) || "OFF"
        });

        await chrome.action.setIcon({
            tabId: tab.id,
            path: './assets/apple-icon-57x57.png',
        });
    }
});

//listen for current tab to be changed
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log('onUpdated', { tabId, changeInfo, tab });
});

chrome.action.onClicked.addListener(async (tab) => {
    if (tab?.id && tab?.url) {
        if (tab.url.includes(trainerize)) {
            // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
            const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
            // Next state will always be the opposite
            const nextState = prevState === 'ON' ? 'OFF' : 'ON';
    
            // Set the action badge to the next state
            await chrome.action.setBadgeText({
                tabId: tab.id,
                text: nextState,
            });
    
            if (nextState === "ON") {
                // Insert the CSS file when the user turns the extension on
                await chrome.scripting.insertCSS({
                    files: ["app.css"],
                    target: { tabId: tab.id },
                });
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content.js"],
                });
            } else if (nextState === "OFF") {
                // Remove the CSS file when the user turns the extension off
                await chrome.scripting.removeCSS({
                    files: ["app.css"],
                    target: { tabId: tab.id },
                });
    
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: cleanup,
                });
            }
        } else {
            // Set the action badge to the next state
            await chrome.action.setBadgeText({
                tabId: tab.id,
                text: '',
            });
        }
    }
});

chrome.runtime.onMessage.addListener(
    async function (request, sender) {
        if (!sender.tab?.id) {
            return;
        }

        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");

        if (request.status === "complete") {
            await chrome.action.setBadgeText({
                tabId: sender.tab.id,
                text: 'OFF',
            });

            await chrome.scripting.removeCSS({
                files: ["app.css"],
                target: { tabId: sender.tab.id },
            });

            await chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                func: cleanup,
            });
        }
        return true;
    }
);


function cleanup() {
    document.body.classList.remove('custom-trainerize-export-active');
    document.querySelector('#custom-trainerize-export')?.remove();
}