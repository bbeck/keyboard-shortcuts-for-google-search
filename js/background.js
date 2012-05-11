chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.navigate) {
    if (request.navigate.url) {
      chrome.tabs.create({
        url: request.navigate.url,
        active: request.navigate.active !== undefined ? request.navigate.active : true,
        openerTabId: sender.tab.id,
      });
    }
  }
});
