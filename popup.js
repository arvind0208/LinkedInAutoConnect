let startConnecting = document.getElementById("start");
let stopConnecting = document.getElementById("stop");
let invitationCountElement = document.getElementById('invitationCount');
let isRunning = true;
let invitationCount = 0;
let buttonCount = 0;
let totalButtonCont = 0;

startConnecting.addEventListener("click", async () => {
  stopConnecting.classList.remove('hide');
  startConnecting.classList.add('hide');
  isRunning = true;
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: contentScript,
  });
});

stopConnecting.addEventListener("click", async () => {
  startConnecting.classList.remove('hide');
  stopConnecting.classList.add('hide');
  isRunning = false;
  chrome.runtime.sendMessage({ invitationCount: invitationCount, buttonCount: buttonCount, isRunning: isRunning }, function (response) {
    debugger;
  });
});

// The body of this function will be executed as a content script inside the current page
function contentScript() {
  console.log('Hi');
  const allBtn = document.querySelectorAll('main div.search-results-container ul button');
  let invitationCount = 0;
  let isRunning = true;
  let buttonCount = 0;
  let totalButtonCont = allBtn.length;

  console.log(invitationCount, allBtn);
  const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
  sendInvitation();

  async function sendInvitation() {
    while (buttonCount < allBtn.length && isRunning) {
      await sleepNow(1000);
      if (allBtn[buttonCount].innerText !== "Follow" && isRunning) {

        allBtn[buttonCount].style.backgroundColor = '#cecece';
        allBtn[buttonCount].style.color = 'silver';
        //allBtn[i].click();
        chrome.runtime.sendMessage({ invitationCount: ++invitationCount, buttonCount: ++buttonCount }, function (response) {
          if (response && response.isRunning === 'n') {
            isRunning = false;
          }
          if (response && response.invitationCount) {
            invitationCount = response.invitationCount;
          }
          if (response && response.buttonCount) {
            buttonCount = response.buttonCount;
          }
        });

      }
      if (buttonCount < allBtn.length && allBtn[buttonCount].innerText === "Follow") {
        buttonCount++;
      }
    }
    if (buttonCount >= totalButtonCont) {
      chrome.runtime.sendMessage({ closePopUp: true }, function (response) {
      });
    }

  }

}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.invitationCount) {
      console.log(request.invitationCount);
      invitationCountElement.innerText = request.invitationCount;
      invitationCount = invitationCount;
    }
    if (request.buttonCount) {
      console.log(request.buttonCount);
      buttonCount = request.buttonCount;
    }
    if (!isRunning) {
      sendResponse({ isRunning: 'n' });
    }
    if (request && request.closePopUp) {
      window.close();
    }
    sendResponse({
      invitationCount: invitationCount,
      buttonCount: buttonCount
    });
    return true;

  }
);