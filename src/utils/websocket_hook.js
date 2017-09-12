
(function() {

  var _before = [];
  var _after = [];


  var lastRequestId = -1;

  var getNewRequestId = function(){
    lastRequestId--;
    return lastRequestId;
  };

  var isInternalRequestId = function(id) {
    return id < 0;
  };

  wsHook.before = function(data, url) {
    var ws = this;
    var dataJson;
    try{
      dataJson = JSON.parse(data);
    }catch(e){
      return data;
    }
    // console.log("Sending message to " + url + " : ", dataJson);
    dataJson = _before.reduce(function(d, cb) {
      return cb.call(ws, d, url) || d;
    }, dataJson);
    return JSON.stringify(dataJson);
  };

  wsHook.after = function(messageEvent, url, cb) {
    var ws = this;
    var data = messageEvent.data;
    var dataJson;
    try{
      dataJson = JSON.parse(data);
    }catch(e){
      cb(messageEvent);
      return;
    }
    // console.log("Received message from " + url + " : ", dataJson);
    var cb2 = function(d) {
      messageEvent.data = JSON.stringify(d);
      cb(messageEvent);
    };
    for (var i = 0; i < _after.length; i++) {
      if(_after[i].call(ws, dataJson, url, cb2)){
        return;
      }
    }
    if(isInternalRequestId(dataJson.id)){
      return;
    }
    cb(messageEvent);
  };


  var WebServiceHook = {
    addBefore: function(cb) {
      _before.push(cb);
    },
    addAfter: function(cb) {
      _after.push(cb);
    },
    getNewRequestId: getNewRequestId,
    isInternalRequestId: isInternalRequestId
  };

  window.SteemMoreInfo = window.SteemMoreInfo || {};
  window.SteemMoreInfo.WebServiceHook = WebServiceHook;

})();
