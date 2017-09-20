

function checkUpdate(){
  var manifestData = chrome.runtime.getManifest();
  var currentVersion = manifestData.version;
  document.body.dataset.SteemitMoreInfoCurrentVersion = currentVersion;

  $.get('https://raw.githubusercontent.com/armandocat/steemit-more-info/master/manifest.json')
    .done(function(data) {
      document.body.dataset.SteemitMoreInfoNewVersionManifest = data;

      var s = document.createElement('script');
      s.src = chrome.extension.getURL('src/utils/check_update.js');
      document.body.appendChild(s);    
    })
    .fail(function(err) {
      console.log('checkUpdate error:', err);
    });
}


[
'vendor/datatables.min.css',
'vendor/toastr.min.css',
'src/main.css'
].reverse().reduce(function(next, href){
  return function(){
    var s = document.createElement('link');
    s.href = chrome.extension.getURL(href);
    s.rel = 'stylesheet';
    document.body.appendChild(s);
    next && next();
  };
}, null)();


var jsToLoad = [
'vendor/steem.min.js',
'vendor/jquery-3.2.1.min.js',
'vendor/jquery.livequery.min.js',
'vendor/lodash.min.js',
'vendor/moment.min.js',
'vendor/history-events.js',
'vendor/compare-versions.js',
'vendor/toastr.min.js',
'vendor/Chart.min.js',
'vendor/remarkable.min.js',
'vendor/sanitize-html.min.js',
'vendor/datatables.min.js',
'src/utils/sanitize.js',
'src/utils/notification_popup.js',
'src/utils/utils.js',
'src/utils/events.js'
];

jsToLoad.push('src/profile_banner.js');
jsToLoad.push('src/votes_tab.js');
jsToLoad.push('src/vote_weight_slider.js');
jsToLoad.push('src/post_votes_list.js');
// jsToLoad.push('src/favorite_tags.js');
jsToLoad.push('src/blog_histogram.js');
jsToLoad.push('src/followers_table.js');
jsToLoad.push('src/show_posts_as_grid.js');

jsToLoad.reverse().reduce(function(next, script){
  return function(){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(script);
    s.onload = function() {
      next && next();
    };
    document.body.appendChild(s);
  };
}, checkUpdate)();

