chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse) {
    if (request.url) {
      chrome.tabs.create(
        { "url" : request.url, "selected" : false }
      );
    }
});
