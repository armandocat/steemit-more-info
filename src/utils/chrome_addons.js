
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

