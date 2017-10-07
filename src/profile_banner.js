
(function(){
  
  function addBannerInfo(name) {
    if(!name){
      return;
    }
    console.log('Adding info for user: ' + name);

    window.SteemMoreInfo.Utils.getAccounts([name], function(err, result){
      window.SteemMoreInfo.Utils.getUserProfileBannerForAccountName(name, function(banner){
        if(banner.hasClass('smi-profile-banner-1')){
          return;
        }
        banner.addClass('smi-profile-banner-1');

        var votingPower = window.SteemMoreInfo.Utils.getVotingPowerPerAccount(result[0]) / 100;
        var votingDollars;
        var voteValue = window.SteemMoreInfo.Utils.getVotingDollarsPerAccount(100, result[0]);
        if(typeof voteValue !== 'undefined') {
          var voteValueText = voteValue.toFixed(2);
          votingDollars = voteValueText;
        }

        var rep = banner.find('.UserProfile__rep');

        var el = rep.parent();
        var insertEl = $('<span></span>')
        insertEl.attr('title', 'This is ' + name + '\'s Voting Power.\n\n'+
          'Voting Power decreases with each vote. It is based upon how much Steem Power (aka vesting STEEM) an account holds as well as how much voting an account has done recently.\n\n'+
          'The amount in dollars is approximately how much reward will give a vote from this user if he/she uses a 100% of his/her current Voting Power.');

        var votingPowerEl = $('<span class="UserProfile__rep" id="Voting__power"></span>');
        
        var setVotingPower = function() {
          if(typeof votingDollars !== 'undefined'){
            votingDollars = ' ≈ ' + votingDollars + '$';
          }else{
            votingDollars = window.SteemMoreInfo.Utils.getLoadingHtml({
              text: true,
              style: 'padding: 0px 8px;',
              backgroundColor: '#aaa'
            });
            var retry = function() {
              votingDollars = undefined;
              voteValue = window.SteemMoreInfo.Utils.getVotingDollarsPerAccount(100, result[0]);
              if(typeof voteValue !== 'undefined') {
                var voteValueText = voteValue.toFixed(2);
                votingDollars = voteValueText;
                setVotingPower();
              }
              setTimeout(retry, 100);
            };
            setTimeout(retry, 100);
          }
          var html = '(' + votingPower + '% VP' + votingDollars + ')';
          votingPowerEl.html(html);
        };

        setVotingPower();

        insertEl.append(votingPowerEl);
        el.append(insertEl);

      });
    });

    window.SteemMoreInfo.Utils.getAccountVotes(name, function(err, result) {
      window.SteemMoreInfo.Utils.getUserProfileBannerForAccountName(name, function(banner){
        if(banner.hasClass('smi-profile-banner-2')){
          return;
        }
        banner.addClass('smi-profile-banner-2');

        var insertVotes = banner.find('.UserProfile__stats')[0];
  
        var today = new Date();
        var formattedToday = `${today.getMonth()} ${today.getDate()} ${today.getFullYear()}`;
        
        var count = 0;
        for(var i = 0; i < result.length; ++i){
          var voteDate = new Date(result[i].time + 'Z');
          var formattedDate = `${voteDate.getMonth()} ${voteDate.getDate()} ${voteDate.getFullYear()}`;

          if(formattedDate === formattedToday){
              count++;
          }
        }

        var votingCountEl = document.createElement('span');
        votingCountEl.setAttribute('id', 'Voting__count');
        votingCountEl.innerText = `${count} ` + (count == 1 ? 'vote' : 'votes') + ' made today';
        insertVotes.insertBefore(votingCountEl, null);

      });
    });
  }

 function resetBannerIfNeeded() {
    $('#Voting__power').remove();
    $('#Voting__count').remove();
    $('#Rep__percent').remove();
    $('#Vote__time').remove();
    $('.voting_weight_dollars').remove();

    var banner = $('.UserProfile__banner');
    banner.removeClass('smi-profile-banner-1');
    banner.removeClass('smi-profile-banner-2');

    var name = window.SteemMoreInfo.Utils.getPageAccountName();
    addBannerInfo(name);
  }

  window.SteemMoreInfo.Events.addEventListener(window, 'page-account-name', function() {
    resetBannerIfNeeded();
  });


  addBannerInfo(window.SteemMoreInfo.Utils.getPageAccountName());


})();
