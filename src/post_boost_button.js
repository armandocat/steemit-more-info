
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



  var createTransferUI = function(permlink, min, max) {
    var transferUI = $('<div data-reactroot="" role="dialog" style="bottom: 0px; left: 0px; overflow-y: scroll; position: fixed; right: 0px; top: 0px;">\
      <div class="reveal-overlay fade in" style="display: block;"></div>\
      <div class="reveal fade in" role="document" tabindex="-1" style="display: block;">\
        <button class="close-button" type="button">\
          <span aria-hidden="true" class="">×</span>\
        </button>\
        <div>\
          <div class="row">\
            <h3 class="column">Boost with <a href="/@minnowbooster" target="_blank">@minnowbooster</a></h3>\
          </div>\
          <form lpformnum="4">\
            <div>\
              <div class="row">\
                <div class="column small-12">\
                The boost functionality is provided by <a href="/@armandocat" target="_blank">@armandocat</a>\
                with the support of the <a href="/@minnowbooster" target="_blank">@minnowbooster</a> team.\
                We don\'t have access to your private key, and the payment is made through SteemConnect.\
                <br>\
                </div>\
              </div>\
              <br>\
            </div>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">To</div>\
              <div class="column small-10">\
                <div class="input-group" style="margin-bottom: 1.25rem;">\
                  <span class="input-group-label">@</span>\
                  <input type="text" class="input-group-field" disabled="" value="minnowbooster" placeholder="Send to account" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" name="to" value="">\
                </div>\
                <p></p>\
              </div>\
            </div>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">Amount</div>\
              <div class="column small-10">\
                <div class="input-group" style="margin-bottom: 5px;">\
                  <input type="text" placeholder="Amount" name="amount" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" autofocus="">\
                  <span class="input-group-label" style="padding-left: 0px; padding-right: 0px;">\
                    <select name="asset" placeholder="Asset" style="min-width: 5rem; height: inherit; background-color: transparent; border: none;">\
                      <option value="SBD" selected>SBD</option>\
                    </select>\
                  </span>\
                </div>\
                <div class="amount-error">\
                  <small>Min: ' + min.toFixed(3) + ' SBD - Max: ' + max.toFixed(3) + ' SBD</small>\
                </div>\
              </div>\
            </div>\
            <br>\
            <div class="row">\
              <div class="column small-2" style="padding-top: 5px;">Memo</div>\
              <div class="column small-10">\
                <input type="text" placeholder="Memo" name="memo" disabled="" value="" autocomplete="on" autocorrect="off" autocapitalize="off" spellcheck="false">\
              </div>\
            </div>\
            <br>\
            <br>\
            <div class="row">\
              <div class="column">\
                <span>\
                <button type="submit" disabled="" class="button">Submit</button>\
                </span>\
              </div>\
            </div>\
          </form>\
        </div>\
      </div>\
    </div>');

    transferUI.find('input[name="memo"]').val(permlink);
    transferUI.find('input[name="amount"]').val(min);

    transferUI.find('.close-button').on('click', function() {
      transferUI.remove();
    });
    transferUI.find('.reveal-overlay').on('click', function() {
      transferUI.remove();
    });

    var validate = function() {
      var amount = transferUI.find('input[name="amount"]').val();
      var error = true;
      amount = amount && parseInt(amount);
      if(typeof amount === 'number' && min <= amount && max >= amount){
        error = false;
      }
      if(error){
        transferUI.find('.amount-error').css('color', 'red');
        transferUI.find('button[type="submit"]').attr('disabled', 'disabled');
      }else{
        transferUI.find('.amount-error').css('color', '#333');        
        transferUI.find('button[type="submit"]').attr('disabled', null);
      }
      return !error;
    };

    transferUI.find('input').on('input', function() {
      validate();
    });

    transferUI.find('form').on('submit', function(e) {
      e.preventDefault();
      if(!validate()){
        return;
      }
      var to = transferUI.find('input[name="to"]').val();
      var amount = transferUI.find('input[name="amount"]').val() + ' ' + transferUI.find('select[name="asset"]').val();
      var memo = transferUI.find('input[name="memo"]').val();
      var url = 'https://v2.steemconnect.com/sign/transfer?to=' + encodeURIComponent(to) + '&amount=' + encodeURIComponent(amount) + '&memo=' + encodeURIComponent(memo);
      window.open(url, '_blank');
    });

    validate();

    $('body').append(transferUI);
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

      boostButton.on('click', function() {
        var permlink = window.location.origin + window.location.pathname;
        createTransferUI(permlink, 5, 5);
      });      

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
