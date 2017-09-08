(function () {

  var pageAccountNameRegexp = /https:\/\/steemit.com\/@([a-z0-9\-]*)([\/\#].*)?$/;
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
  function updateSteemVariables() {
    steem.api.getRewardFund("post", function(e, t) {
      rewardBalance = parseFloat(t.reward_balance.replace(" STEEM", ""));
      recentClaims = t.recent_claims;
    });
    steem.api.getCurrentMedianHistoryPrice(function(e, t) {
      steemPrice = parseFloat(t.base.replace(" SBD", "")) / parseFloat(t.quote.replace(" STEEM", ""));
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



  var getVotingDollars = function(voteWeight, account) {
    if(!account){
      account = currentUserAccount;
    }
    if(!account){
      return;
    }
    if(rewardBalance && recentClaims && steemPrice){
      var v = 1e4;
      var h = 432e3;
      var I = rewardBalance / recentClaims;
      var L = steemPrice;

      var s = account.voting_power
        , l = (new Date - new Date((account.last_vote_time) + 'Z')) / 1e3;
      s = (s = (s + v * l / h) / 100) > 100 ? 100 : s.toFixed(2);
      var c = parseInt(100 * s * (100 * voteWeight) / v);
      c = parseInt((c + 49) / 50);                
      var voteValue = parseInt(
        (parseInt(account.vesting_shares.replace(" VESTS", "")) + parseInt(account.received_vesting_shares.replace(" VESTS", "")) - parseInt(account.delegated_vesting_shares.replace(" VESTS", ""))
        ) * c * 100) * I * L;
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
    getVotingDollars: getVotingDollars,
    getUserHistory: getUserHistory
  };


  window.SteemMoreInfo = window.SteemMoreInfo || {};
  window.SteemMoreInfo.Utils = Utils;

})();
