/** Determine whether or not an element is completely visible. */
var isScrolledIntoView = function(elem) {
  var viewTop = $(window).scrollTop();
  var viewBottom = viewTop + $(window).height();
  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();

  return ((elemBottom >= viewTop) && (elemTop <= viewBottom)
    && (elemBottom <= viewBottom) && (elemTop >= viewTop));
};

/** Scroll an element to the top of the viewport. */
var scrollToTop = function(elem, padding) {
  if (padding === undefined) {
    padding = 5;
  }
  
  $("html, body").animate({
    scrollTop: $(elem).offset().top - padding
  });
};

/** Scroll an element to the bottom of the viewport. */
var scrollToBottom = function(elem, padding) {
  if (padding === undefined) {
    padding = 5;
  }
  
  $("html, body").animate({
    scrollTop: $(elem).offset().top - $(window).height() + $(elem).height() + padding
  });
};