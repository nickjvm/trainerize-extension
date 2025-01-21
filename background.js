chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: "OFF",
    });
});

// const extensions = 'https://developer.chrome.com/docs/extensions';
// const webstore = 'https://developer.chrome.com/docs/webstore';
const trainerize = '.trainerize.com/app'

chrome.action.onClicked.addListener(async (tab) => {
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
            files: ["focus-mode.css"],
            target: { tabId: tab.id },
        });
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files : [ "script.js" ],
        })
    } else if (nextState === "OFF") {
        // Remove the CSS file when the user turns the extension off
        await chrome.scripting.removeCSS({
            files: ["focus-mode.css"],
            target: { tabId: tab.id },
        });

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func : cleanup,
        })
    }
  }
});

chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
      if (request.status === "complete") {
        await chrome.action.setBadgeText({
            tabId: sender.tab.id,
            text: 'OFF',
          });

          await chrome.scripting.removeCSS({
            files: ["focus-mode.css"],
            target: { tabId: sender.tab.id },
        });

        await chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            func : cleanup,
        })
      }
      return true
    }
  );


function cleanup() {
    document.body.classList.remove('custom-trainerize-export-active')
    document.querySelector('#custom-trainerize-export')?.remove()
}