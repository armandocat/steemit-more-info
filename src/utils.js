(function () {

  var STEEMIT_100_PERCENT = 10000;
  var STEEMIT_VOTE_REGENERATION_SECONDS = (5*60*60*24); // 5 day

  var pageAccountNameRegexp = /https:\/\/steemit.com\/@([a-z0-9\-\.]*)([\/\#].*)?$/;
  var domCheckTimeout = 100;

  var getPageAccountName = function() {
    var parseLocation = window.location.href.match(pageAccountNameRegexp);
    if(!parseLocation){
      return;
    }
    if(parseLocation[2] && parseLocation[2].startsWith('/feed')){
      return;
    } 
    return parseLocation[1];
  };

  var getLoggedUserName = function() {
    var url = $('.Header__userpic a').attr('href');
    if(!url){
      return null;
    }
    return url.substring(2);
  };

  var getUserProfileBannerForAccountName = function(accountName, cb) {
    var name = getPageAccountName();
    if(name != accountName){
      return;
    }
    var banner = $('.UserProfile__banner');
    if(banner && banner.length){
      cb(banner);
    }else{
      setTimeout(function() {
        getUserProfileBannerForAccountName(accountName, cb);
      }, domCheckTimeout);
    }
  };


  var getUserTopMenusForAccountName = function(accountName, cb) {
    var name = getPageAccountName();
    if(name != accountName){
      return;
    }
    var menus = $('.UserProfile__top-menu ul.menu');
    if(menus && menus.length && menus.eq(0).find('li:eq(0) a').attr('href') === '/@' + accountName){
      cb(menus);
    }else{
      setTimeout(function() {
        getUserTopMenusForAccountName(accountName, cb);
      }, domCheckTimeout);
    }   
  };


  var steemPrice;
  var rewardBalance;
  var recentClaims;
  var currentUserAccount;
  var votePowerReserveRate;
  function updateSteemVariables() {
    steem.api.getRewardFund("post", function(e, t) {
      rewardBalance = parseFloat(t.reward_balance.replace(" STEEM", ""));
      recentClaims = t.recent_claims;
    });
    steem.api.getCurrentMedianHistoryPrice(function(e, t) {
      steemPrice = parseFloat(t.base.replace(" SBD", "")) / parseFloat(t.quote.replace(" STEEM", ""));
    });
    steem.api.getDynamicGlobalProperties(function(e, t){
      votePowerReserveRate = t.vote_power_reserve_rate;
    });

    var loggedUserName = getLoggedUserName()
    if(loggedUserName){
      var _loggedUserName = loggedUserName;
      steem.api.getAccounts([loggedUserName], function(err, result){
        if(getLoggedUserName() == _loggedUserName){
          currentUserAccount = result[0];
        }
      });
    }else{
      currentUserAccount = null;
    }
    setTimeout(updateSteemVariables, 180 * 1000)
  }
  updateSteemVariables();



  var getVotingDollarsPerShares = function(rshares) {
    if(rewardBalance && recentClaims && steemPrice){
      var voteValue = rshares 
        * rewardBalance / recentClaims
        * steemPrice;
  
      return voteValue;
    } 
  };


  var getVotingPowerPerAccount = function(account) {
      var voting_power = account.voting_power;
      var last_vote_time = new Date((account.last_vote_time) + 'Z');
      var elapsed_seconds = (new Date() - last_vote_time) / 1000;
      var regenerated_power = Math.round((STEEMIT_100_PERCENT * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
      var current_power = Math.min(voting_power + regenerated_power, STEEMIT_100_PERCENT);
      return current_power;
  };


  var getVotingDollarsPerAccount = function(voteWeight, account) {
    if(!account){
      account = currentUserAccount;
    }
    if(!account){
      return;
    }
    if(rewardBalance && recentClaims && steemPrice && votePowerReserveRate){

      var effective_vesting_shares = Math.round((parseFloat(account.vesting_shares.replace(" VESTS", "")) 
        + parseFloat(account.received_vesting_shares.replace(" VESTS", "")) 
        - parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""))) * 1000000);
      var voting_power = account.voting_power;
      var weight = voteWeight * 100;
      var last_vote_time = new Date((account.last_vote_time) + 'Z');


      var elapsed_seconds = (new Date() - last_vote_time) / 1000;
      var regenerated_power = Math.round((STEEMIT_100_PERCENT * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
      var current_power = Math.min(voting_power + regenerated_power, STEEMIT_100_PERCENT);
      var max_vote_denom = votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS / (60*60*24);
      var used_power = Math.round((current_power * weight) / STEEMIT_100_PERCENT);
      used_power =  Math.round((used_power + max_vote_denom - 1) / max_vote_denom);

      var rshares = Math.round((effective_vesting_shares * used_power) / (STEEMIT_100_PERCENT))


      var voteValue = rshares 
        * rewardBalance / recentClaims
        * steemPrice;
  
      return voteValue;

    }
  };


  var getUserHistory = function(accountName, from, cb) {
    if(!accountName){
      return;
    }
    var from = from || -1; // the index of the last transaction / -1 for last transaction
    var maxVotes = 100;
    var to = from === -1 ? maxVotes : Math.min(maxVotes, from); // number of transactions to get other than the last one... 2 -> 3 transactions 
    steem.api.getAccountHistory(accountName, from, to, function(err, result) {
      cb(err, result);
    });
  };

  var getActiveVotes = function(author, permlink, cb){
    steem.api.getActiveVotes(author, permlink, cb);
  };

  var getContent = function(author, permlink, cb){
    steem.api.getContent(author, permlink, function(err, result){
      if(result){
        if(result.last_payout === '1970-01-01T00:00:00'){
          //not paid out yet!
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var rshares = vote.rshares;
            var voteValue = window.SteemMoreInfo.Utils.getVotingDollarsPerShares(rshares);
            if(typeof voteValue !== 'undefined') {
              vote.voteDollar = voteValue.toFixed(2);
            }
          });
        }else{
          //already paid out
          var totalShares = 0;
          _.each(result.active_votes, function(vote) {
            var rshares = vote.rshares;
            totalShares += parseInt(rshares, 10);
          });
          var totalDollars = parseFloat(result.total_payout_value.replace(" SBD", "")) + parseFloat(result.curator_payout_value.replace(" SBD", ""));
          if(totalDollars <= 0){
            totalDollars = 0;
            totalShares = 1;
          }
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var rshares = vote.rshares;
            var voteValue = totalDollars * rshares / totalShares;
            vote.voteDollar = voteValue.toFixed(2);
          });
        }
      }
      cb(err, result);
    });
  };



  var Utils = {
    getPageAccountName: getPageAccountName,
    getLoggedUserName: getLoggedUserName,
    getUserProfileBannerForAccountName: getUserProfileBannerForAccountName,
    getUserTopMenusForAccountName: getUserTopMenusForAccountName,
    getRewardBalance: function(){
      return rewardBalance;
    },
    getRecentClaims: function(){
      return recentClaims;
    },
    getSteemPrice: function(){
      return steemPrice;
    },
    getVotingPowerPerAccount: getVotingPowerPerAccount,
    getVotingDollarsPerAccount: getVotingDollarsPerAccount,
    getVotingDollarsPerShares: getVotingDollarsPerShares,
    getUserHistory: getUserHistory,
    getActiveVotes: getActiveVotes,
    getContent: getContent
  };


  window.SteemMoreInfo = window.SteemMoreInfo || {};
  window.SteemMoreInfo.Utils = Utils;

})();
