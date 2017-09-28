
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
