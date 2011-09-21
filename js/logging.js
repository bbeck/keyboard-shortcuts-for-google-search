var DEBUG_BUILD = false;

var debug = function(msg) {
  if (DEBUG_BUILD && console && console.log) {
    console.log("DEBUG: " + msg);
  }
};