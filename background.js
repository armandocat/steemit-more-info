
var connectSrcAddition = 'wss://gtg.steem.house:8090';

var onHeadersReceived = function(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if ('content-security-policy' === details.responseHeaders[i].name.toLowerCase() ||
      'x-content-security-policy' === details.responseHeaders[i].name.toLowerCase()) {
      details.responseHeaders[i].value = (details.responseHeaders[i].value || '')
        .replace('connect-src ', 'connect-src ' + connectSrcAddition + ' ');
    }
  }

  return {
    responseHeaders: details.responseHeaders
  };
};

var filter = {
  urls: ['https://steemit.com/*'],
  types: ["main_frame"]
};

chrome.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, [
  "blocking", 
  "responseHeaders"
]);



chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  console.log('Received request: ', request);
  if (request.type == 'ajax'){
    var ajax = request.ajax;
    $.ajax({
      url: ajax.url,
      type: ajax.method,
      error: function(err){
        sendResponse({error: err});
      },
      success: function(data) {
        sendResponse({data: data});
      }
    });
    return true;
  }else{
    sendResponse({});
  }
});
