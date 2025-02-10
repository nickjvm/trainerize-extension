const trainerize = '.trainerize.com/app';

chrome.runtime.onInstalled.addListener(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
        return; 
    }

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

    if (tab.id && tab.url.includes(trainerize) && !tab.url.match(/sessionEnd|login/)) {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: injectDownloadButton,
        });


        await chrome.scripting.insertCSS({
            files: ["app.css"],
            target: { tabId: tab.id },
        });

        await chrome.action.setIcon({
            tabId: tab.id,
            path: './assets/apple-icon-57x57.png',
        });
    } else {
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: await chrome.action.getBadgeText({ tabId: tab.id }) || "OFF"
        });
    }
});

//listen for current tab to be changed
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (!tab?.url) {
        return;
    }
    if (tab.url.includes(trainerize) && !tab.url.match(/sessionEnd|login/)) {

        await chrome.scripting.insertCSS({
            files: ["app.css"],
            target: { tabId },
        });

        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: injectDownloadButton,
        });
    }
});

chrome.runtime.onMessage.addListener(
    async function (request, sender) {
        if (!sender.tab?.id) {
            return;
        }

        // console.log(sender.tab ?
        //     "from a content script:" + sender.tab.url :
        //     "from the extension");

        if (request.command === 'print') {
            await chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                files: ["content.js"],
            });
        }

        return true;
    }
);

function injectDownloadButton() {
    const container = document.querySelector('.menuItemContainer');
    const button = container?.querySelector('.tpe-print-button');
    if (container && !button) {
        container.insertAdjacentHTML('afterbegin', `
                <div class="topMenu-tpe-print topMenu-item flex-center">
                    <button aria-label="print meal log" class="tpe-print-button" style="border: 0; appearance: none; outline: 0; background: transparent; cursor: pointer; margin: 0; padding: 0;">
                        <svg style="height: 25px; width: 25px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                        </svg>
                        <span>Print Meal Log</span>
                    </button>
                </div>`
        );

        document.querySelector('.tpe-print-button')?.addEventListener('click', async (e: Event) => {
            if (e.currentTarget instanceof Element) {
                const el = e.currentTarget;
                el.setAttribute('disabled', 'disabled');

                window.onafterprint = () => {
                    document.body.classList.remove('custom-trainerize-export-active');
                    document.querySelector('#custom-trainerize-export')?.remove();
                    el.removeAttribute('disabled');
                };
            }

            await chrome.runtime.sendMessage({
                command: 'print'
            });
        });
    }
}