
// [
// 'vendor/wsHook.js',
// 'src/utils/websocket_hook.js'
// ].reverse().reduce(function(next, script){
//   return function(){
//     var s = document.createElement('script');
//     s.src = chrome.extension.getURL(script);
//     s.onload = function() {
//       next && next();
//     };
//     s.async = false;
//     document.documentElement.appendChild(s);
//   };
// }, null)();

