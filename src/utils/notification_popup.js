(function () {


  toastr.options = {
    'closeButton': false,
    'debug': false,
    'newestOnTop': false,
    'progressBar': false,
    'positionClass': 'toast-top-right',
    'preventDuplicates': false,
    'showDuration': '300',
    'hideDuration': '1000',
    'timeOut': '5000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'fadeIn',
    'hideMethod': 'fadeOut'
  };

  var log = function(html, options) {
    options = options || {};
    var opts = {};
    if(options.important) {
      opts.closeButton = true;
      opts.timeOut = 0;
      opts.extendedTimeOut = 0;
      opts.tapToDismiss = false;
    }
    opts.onclick = options.onClick;
    toastr['info'](html, '', opts);
  };


  var Notification = {
    log: log
  };

  window.SteemMoreInfo = window.SteemMoreInfo || {};
  window.SteemMoreInfo.Notification = Notification;

    
})();
