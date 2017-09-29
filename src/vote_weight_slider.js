
(function(){  

  window.SteemMoreInfo.Utils.addSettings({
    title: 'Voting weight\'s slider Dollars amount',
    settings: [{
      title: '',
      key: 'VoteWeightSlider',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'Adds the amount in dollars your votes is worth to the voting weight\'s slider (Only for account with enough SP)'
    }]
  });

  var votingWeightEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('VoteWeightSlider');
    return value;
  };


  var updateVotingSlider = function(weightDisplay) {

    weightDisplay.css('margin-top', '-10px');
    var weightDollars = weightDisplay.parent().find('.voting_weight_dollars');
    if(weightDollars.length === 0){
      var weightDollars = $('<div class="voting_weight_dollars"></div>');
      weightDollars.html( window.SteemMoreInfo.Utils.getLoadingHtml({
        text: true,
        backgroundColor: '#8a8a8a'
      }) );
      weightDisplay.after(weightDollars);
    }

    var dollars = window.SteemMoreInfo.Utils.getVotingDollarsPerAccount(parseInt(weightDisplay.text().replace(/ /,''), 10));
    if(typeof dollars === 'undefined'){
      setTimeout(function() {
        tryUpdateVotingSlider();
      }, 100);
    }else{
      weightDollars.text(dollars.toFixed(2) + '$');
    }

    var votingEl = weightDisplay.closest('.Voting');
    var flagInfo = votingEl.find('.Voting__about-flag');
    if(flagInfo.length) {
        
      var pendingPayout;
      var isComment = false;
      var reactEl = votingEl.closest('.PostSummary, .Comment, .PostFull');
      if(reactEl.is('.Comment')){
        isComment = true;
        reactEl = reactEl.find('.FormattedAsset');
        pendingPayout = parseFloat(reactEl.text().replace('$',''));
      }else if(reactEl.is('.PostFull')){
        reactEl = reactEl.find('.FormattedAsset');
        if(!reactEl.length){
          reactEl = $('.smi-post-footer-wrapper-2 .FormattedAsset');
        }
        pendingPayout = parseFloat(reactEl.text().replace('$',''));        
      }else{
        var reactObj = window.SteemMoreInfo.Utils.findReact(reactEl[0]);
        pendingPayout = parseFloat(reactObj.props.pending_payout.replace(' SBD', ''));
      }

      voteTotal = flagInfo.find('.smi-vote-total');
      if(!voteTotal.length){
        voteTotal = $('<p class="smi-vote-total"></p>');
        flagInfo.prepend(voteTotal);
        var html = 'After your downvote the total reward for <br> this ' + (isComment ? 'comment' : 'post') + ' will be: <span class="after-downvote-total-dollar">' + window.SteemMoreInfo.Utils.getLoadingHtml({
          text: true,
          backgroundColor: '#8a8a8a'
        }) + '</span>';
        voteTotal.html(html);
      }
      var voteTotalDollars = voteTotal.find('.after-downvote-total-dollar');

      if(typeof dollars !== 'undefined'){
        var v = pendingPayout + dollars;
        voteTotalDollars.text(v.toFixed(2) + '$');
      }


    }

  };

  var tryUpdateVotingSlider = function() {
    var weightDisplay = $('span.Voting__button .weight-display');
    if(weightDisplay.length){
      updateVotingSlider(weightDisplay);
    }
  }


  window.SteemMoreInfo.Events.addEventListener(window, 'voting-weight-change', function(e) {
    if(votingWeightEnabled() === 'disabled'){
      return;
    }
    var weightDisplay = e.state;
    updateVotingSlider(weightDisplay);
  });

  
  tryUpdateVotingSlider();

})();
