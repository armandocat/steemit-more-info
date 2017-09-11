(function () {

  function triggerEvent(el, eventName, state) {
    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent(eventName, true, true);
    } else if (document.createEventObject){// IE < 9
      event = document.createEventObject();
      event.eventType = eventName;
    }
    event.state = state;
    event.eventName = eventName;
    if (el.dispatchEvent) {
      el.dispatchEvent(event);
    } else if(el.fireEvent && htmlEvents['on'+eventName]) {// IE < 9
      el.fireEvent('on'+event.eventType, event);// can trigger only real event (e.g. 'click')
    } else if(el[eventName]) {
      el[eventName]();
    } else if(el['on'+eventName]) {
      el['on'+eventName]();
    }
  }

  function addEventListener(el, type, handler){
    if (el.addEventListener) {
      el.addEventListener(type, handler, false);
    } else if (el.attachEvent && htmlEvents['on'+type]) {// IE < 9
      el.attachEvent('on'+type, handler);
    } else {
      el['on'+type]=handler;
    }
  }

  function removeEventListener(el, type, handler){
    if (el.removeventListener) {
      el.removeEventListener(type, handler, false);
    } else if (el.detachEvent && htmlEvents['on'+type]) {// IE < 9
      el.detachEvent('on'+type, handler);
    } else {
      el['on'+type]=null;
    }
  }


  var Events = {
    addEventListener: addEventListener,
    removeEventListener: removeEventListener
  };



  var pageAccountName = window.SteemMoreInfo.Utils.getPageAccountName();

  var onUrlChange = function() {
    console.log('URL Changed: ' + window.location.href);
    var newName = window.SteemMoreInfo.Utils.getPageAccountName();
    if(newName == pageAccountName){
      return;
    }
    pageAccountName = newName;
    console.log('New Page Account Name: ' + pageAccountName);
    triggerEvent(window, 'page-account-name');
  };

  if (window.HistoryEvents.isHistorySupported()) {
    addEventListener(window, 'changestate', function(e) {
      onUrlChange();
    });
  }



  // $('body').livequery('.Voting__adjust_weight', function(){
  //     //element created
  //     console.log('.Voting__adjust_weight CREATED');
  // }, function(){
  //     //element removed
  //     console.log('.Voting__adjust_weight REMOVED');
  // });

  $('body').on('click', 'span.Voting__button > a', function(){
    var votingButton = $(this);
    console.log('Voting button clicked: ', votingButton);
    setTimeout(function() {
      var adjustWeight = votingButton.parent().find('.Voting__adjust_weight');
      var weightDisplay = adjustWeight.find('.weight-display');
      if(weightDisplay && weightDisplay.length){
        triggerEvent(window, 'voting-weight-change', weightDisplay);
      }
    }, 1);
  });

  $("body").on('DOMSubtreeModified', ".weight-display", function() {
    triggerEvent(window, 'voting-weight-change', $(this));
  });



  $('body').on('click', 'div.Voting__voters_list > a', function(){
    var votersButton = $(this);
    console.log('Voters list button clicked: ', votersButton);
    setTimeout(function() {
      if(votersButton.parent().hasClass('show')){
        var ul = votersButton.parent().find('ul.VerticalMenu');      
        triggerEvent(window, 'voters-list-show', ul);
      }
    }, 1);
  });



  
  window.SteemMoreInfo = window.SteemMoreInfo || {};
  window.SteemMoreInfo.Events = Events;

})();
