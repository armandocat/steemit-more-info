
if(typeof chrome !== 'undefined'){
  window.SMI_AJAX = function(ajax) {
    var eid = $('body').data('SteemitMoreInfoExtensionId');
    chrome.runtime.sendMessage(eid, {type:'ajax', ajax: ajax}, function(response) {
      if(response.error){
        ajax.error(response.error);
      }else{
        ajax.success(response.data);
      }
    });
  };
}else{
  var SMI_AJAX_MAP = {};
  var SMI_AJAX_NEXT_INDEX = 1;

  window.SMI_AJAX = function(ajax) {
    var index = SMI_AJAX_NEXT_INDEX++;
    SMI_AJAX_MAP[index] = {
      success: ajax.success,
      error: ajax.error
    };
    delete ajax.success;
    delete ajax.error;

    window.postMessage({
      direction: "from-page-script",
      index: index,
      message: {type:'ajax', ajax: ajax}
    }, "*");
  };

  window.addEventListener("message", function(event) {
    if (event.source == window &&
        event.data &&
        event.data.direction == "from-content-script") {

      var index = event.data.index;
      var ajax = SMI_AJAX_MAP[index];
      if(!ajax){
        return;
      }
      var response = event.data.message;
      if(response.error){
        ajax.error(response.error);
      }else{
        ajax.success(response.data);
      }
      delete SMI_AJAX_MAP[index];
    }
  });

}
