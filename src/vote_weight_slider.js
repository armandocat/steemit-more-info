
(function(){  

  window.SteemMoreInfo.Events.addEventListener(window, 'voting-weight-change', function(e) {
    var weightDisplay = e.state;
    // console.log('weightDisplay: ', weightDisplay);
    var dollars = window.SteemMoreInfo.Utils.getVotingDollarsPerAccount(parseInt(weightDisplay.text(), 10));
    if(typeof dollars === 'undefined'){
      return;
    }
    weightDisplay.css('margin-top', '-10px');
    var weightDollars = weightDisplay.parent().find('.voting_weight_dollars');
    if(weightDollars.length === 0){
      var weightDollars = $('<div class="voting_weight_dollars"></div>');
      weightDisplay.after(weightDollars);
    }
    weightDollars.text(dollars.toFixed(2) + '$');
  });

})();
