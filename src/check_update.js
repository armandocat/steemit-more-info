(function () {

  var currentVersion = document.body.dataset.SteemitMoreInfoCurrentVersion;
  var newVersionManifest = document.body.dataset.SteemitMoreInfoNewVersionManifest;
  try{
    newVersionManifest = newVersionManifest && JSON.parse(newVersionManifest);
  }catch(err){
    console.log(err);
  }

  var newVersion = newVersionManifest && newVersionManifest.version || null;

  console.log('Current Steemit More Info version: ' + currentVersion);
  console.log('New Steemit More Info version: ' + newVersion);

  

  if(newVersion && compareVersions(newVersion, currentVersion) > 0) {

    var showUpdateNotification = window.localStorage ? window.localStorage.SteemMoreInfoShowUpdateNotification : true;
    if(typeof showUpdateNotification === 'undefined'){
      showUpdateNotification = true;
    }else{
      try{
        var date = new Date(showUpdateNotification);
        showUpdateNotification = (new Date() - date > 24*60*60*1000);
      }catch(err){
        showUpdateNotification = true;
      }
    }

    if(showUpdateNotification){

      var steemitPostUrl = newVersionManifest.homepage_url || 'https://steemit.com/@armandocat';

      window.SteemMoreInfo.Notification.log('<div>\
        A new version of the Steemit More Info - Chrome extension is available!<br>\
        Click here to read about it.\
      </div>', {
        important: true,
        onClick: function() {
          if(window.localStorage) {
            window.localStorage.SteemMoreInfoShowUpdateNotification = new Date();
          }
          window.location.href = steemitPostUrl;
        }
      });

      setTimeout(function() {
        if(window.localStorage) {
          window.localStorage.SteemMoreInfoShowUpdateNotification = new Date();
        }
      }, 10*1000);

    }

  }

})();
