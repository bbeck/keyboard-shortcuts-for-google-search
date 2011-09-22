var chevronImageUrl = chrome.extension.getURL("images/chevron.gif");
var helpPopupUrl = chrome.extension.getURL("html/help.html");

/** Move the selection to the next search result. */
var doNextSearchResult = function() {
  var selectedItem = $("li.selected_search_item");
  if (selectedItem.length == 0) {
    debug("Unable to locate currently selected item.");
    return;
  }
  
  var nextItem = $(selectedItem).next("li");
  if (nextItem.length == 0) {
    // If we're on the last item of the page it's possible that we won't find a next item.
    // In this case, do nothing.
    return;
  }
  
  selectedItem.removeClass("selected_search_item");
  removeChevron(selectedItem);
  
  nextItem.addClass("selected_search_item");
  addChevron(nextItem);
  
  if (!isScrolledIntoView(nextItem)) {
    scrollToTop(nextItem);
  }
};

/** Move the selection to the previous search result. */
var doPrevSearchResult = function() {
  var selectedItem = $("li.selected_search_item");
  if (selectedItem.length == 0) {
    debug("Unable to locate currently selected item.");
    return;
  }
  
  var prevItem = $(selectedItem).prev("li");
  if (prevItem.length == 0) {
    // If we're on the first item of the page it's possible that we won't finda previous item.
    // In this case, do nothing.
    return;
  }
  
  $(selectedItem).removeClass("selected_search_item");
  removeChevron(selectedItem);
  
  $(prevItem).addClass("selected_search_item");
  addChevron(prevItem);
  
  if (!isScrolledIntoView(prevItem)) {
    scrollToBottom(prevItem);
  }
};

var doNextSearchPage = function() {
  var currentPage = parseInt($("#navcnt td.cur").text());
  var nextPage = currentPage + 1;
  
  var link = $("#navcnt td a").filter(function(index) {
    return parseInt($(this).text()) === nextPage;
  });
  
  if (link.length) {
    window.location.href = link.attr("href");
  }
};

var doPrevSearchPage = function() {
  var currentPage = parseInt($("#navcnt td.cur").text());
  var nextPage = currentPage - 1;
  
  var link = $("#navcnt td a").filter(function(index) {
    return parseInt($(this).text()) === nextPage;
  });
  
  if (link.length) {
    window.location.href = link.attr("href");
  }
};

/** Give the search box focus. */
var doFocusSearchBox = function() {
  var searchBox = $("input[title=Search]:first");
  searchBox.focus();
};

/** Navigate to the selected search result. */
var doNavigate = function() {
  var selectedItem = $("li.selected_search_item");
  var link = $(selectedItem).find("h3 a")
  
  window.location.href = link.attr("href")
};

/** Show the help popup. */
var doShowHelp = function() {
  var popup = $("<span></span>");
  
  // Callback for closing the popup
  var closePopup = function(event, keyupHandler) {
    // Remove the keyboard handler
    $(document.documentElement).unbind("keyup", keyupHandler);
    
    // And restore the main one
    bindKeyboardHandler();
    
    // And then close the popup
    popup.remove();
    
    // Nothing else needs to see this event
    event.stopPropagation();
    event.preventDefault();
  };
  
  var keyupHandler = function(event) {
    // Escape
    if (event.which == 27) {
      closePopup(event, keyupHandler);
    }
  };
  
  // Load the help html, when finished bind the handlers to close it
  popup.load(helpPopupUrl, function() {
    // Now that the popup is up, remove the main keyboard handler...
    unbindKeyboardHandler();
    
    // And replace it with one that will close the popup...
    $(document.documentElement).bind("keyup", keyupHandler);
    
    // Find the close button and bind a click hander to it...
    var closeButton = $(popup).find("a.cgsk-popup-close-button");
    closeButton.bind("click", function(event) {
      closePopup(event, keyupHandler);
    });
  });
  
  $("body").append(popup);
};

/** Inserts a chevron image next to the given search result. */
var addChevron = function(item) {
  var itemPosition = item.position();
  var top = itemPosition.top + 4;
  var left = itemPosition.left - 15;
  var html = "<img " + 
    "id='selected_search_item_chevron' " +
    "src='" + chevronImageUrl + "' " + 
    "style='position: absolute; " + 
      "top: " + top + "px; " + 
      "left: " + left + "px; " +
      "padding: 0; margin: 0; border: 0;'" + 
    "/>";
    
  item.append(html);
};

/** Removes the chevron image that is next to the given search result. */
var removeChevron = function(item) {
  var chevron = $(item).find("img#selected_search_item_chevron");
  chevron.remove();
};

/** Handles keypresses. */
var keypressHandler = function(event) {
  debug("keypress: " + event.which);
  
  // return
  if (event.which == 13) {
    doNavigate();
    return;
  }
  
  // escape or forward slash
  if (event.which == 27 || event.which == 47) {
    doFocusSearchBox();
    
    // Don't allow the character to be typed into the search box.
    event.stopPropagation();
    event.preventDefault();
    return;
  }
  
  // question mark
  if (event.which == 63) {
    doShowHelp();
    return;
  }
  
  // j or J
  if (event.which == 74 || event.which == 106) {
    doNextSearchResult();
    return;
  }
  
  // k or K
  if (event.which == 75 || event.which == 107) {
    doPrevSearchResult();
    return;
  }
  
  // n or N
  if (event.which == 78 || event.which == 110) {
    doNextSearchPage();
    return;
  }
  
  // p or P
  if (event.which == 80 || event.which == 112) {
    doPrevSearchPage();
    return;
  }
};

/** 
 * A keyup handler that just detects when escape is pressed and then delegates to the
 * keyboard handler.  This handler should only process the escape key because when a
 * normal key is held down the keypress event continuously fires.
 */
var keyupHandler = function(event) {
  event.which = event.keyCode;
  if (event.which == 27) keypressHandler(event);  
};

/** Bind the keyboard handler. */
var bindKeyboardHandler = function() {
  $(document.documentElement).bind({
    keypress: keypressHandler,
    keyup: keyupHandler
  });
};

/** Unbind the keyboard handler. */
var unbindKeyboardHandler = function() {
  $(document.documentElement).unbind({
    keypress: keypressHandler,
    keyup: keyupHandler
  });
};

/** Enable or disable keyboard support depending on whether or not the search box has focus. */
var bindSearchBoxFocusHandler = function() {
  var searchBox = $("input[title=Search]:first");
  
  // When the search box gets focus, remove our keyboard handler.
  $(searchBox).bind("focus", unbindKeyboardHandler);

  // When the search box loses focus, add our keyboard handler.
  $(searchBox).bind("blur", bindKeyboardHandler);
};

bindKeyboardHandler();
bindSearchBoxFocusHandler();

var firstItem = $("#ires ol li:first")
firstItem.addClass("selected_search_item");
addChevron(firstItem);