
(function(){  

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

    var dollars = window.SteemMoreInfo.Utils.getVotingDollarsPerAccount(parseInt(weightDisplay.text(), 10));
    if(typeof dollars === 'undefined'){
      setTimeout(function() {
        tryUpdateVotingSlider();
      }, 100);
      return;
    }
    weightDollars.text(dollars.toFixed(2) + '$');

  };

  var tryUpdateVotingSlider = function() {
    var weightDisplay = $('span.Voting__button .weight-display');
    if(weightDisplay.length){
      updateVotingSlider(weightDisplay);
    }
  }


  window.SteemMoreInfo.Events.addEventListener(window, 'voting-weight-change', function(e) {
    var weightDisplay = e.state;
    updateVotingSlider(weightDisplay);
  });

  
  tryUpdateVotingSlider();

})();
