
[
'vendor/steem.min.js',
'vendor/jquery-3.2.1.min.js',
'vendor/jquery.livequery.min.js',
'vendor/lodash.min.js',
'vendor/moment.min.js',
'vendor/history-events.js',
'src/utils.js',
'src/events.js',
'src/main.js'
].reverse().reduce(function(next, script){
  return function(){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(script);
    s.onload = function() {
      next && next();
    };
    document.body.appendChild(s);
  };
}, null)();
