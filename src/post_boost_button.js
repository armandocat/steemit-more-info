
(function(){


  window.SteemMoreInfo.Utils.addSettings({
    title: 'Post\'s Boosting Button',
    settings: [{
      title: '',
      key: 'PostBoostButton',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'Add a Boost button next to the Promote button to the posts to easily send SBD to <a class="smi-navigate" href="/@minnowbooster">@minnowbooster</a> for boosting upvotes'
    }]
  });

  var isPostBoostButtonEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('PostBoostButton');
    return value === 'enabled';
  };



  var addPostBoostButton = function() {

    if(!isPostBoostButtonEnabled()){
      return;
    }

    var promoteButton = $('.Promote__button');
    var boostButton = $('.smi-boost-button');

    if(promoteButton.length && !boostButton.length) {

      boostButton = $('<button class="smi-boost-button float-right button hollow tiny">Boost</button>');

      promoteButton.before(boostButton);

      promoteButton.addClass('smi-promote-button');

    }

  };




  $('body').attrchange(function(attrName) {
    if(attrName === 'class'){
      if($('body').hasClass('with-post-overlay')) {
        addPostBoostButton();
      }
    }
  });

  window.SteemMoreInfo.Events.addEventListener(window, 'changestate', function() {
    setTimeout(function() {
      addPostBoostButton();
    }, 100);
  });


  addPostBoostButton();


})();
