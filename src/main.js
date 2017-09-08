
(function(){
  
  var name = window.SteemMoreInfo.Utils.getPageAccountName();


  function addBannerInfo(name) {
    if(!name){
      return;
    }
    console.log('Adding info for user: ' + name);

    steem.api.getAccounts([name], function(err, result){
      window.SteemMoreInfo.Utils.getUserProfileBannerForAccountName(name, function(banner){

        var votingPower = result[0].voting_power / Math.pow(10,2);
        var votingDollars;
        var voteValue = window.SteemMoreInfo.Utils.getVotingDollars(100, result[0]);
        if(voteValue) {
          var voteValueText = voteValue.toFixed(2);
          votingDollars = voteValueText;
        }

        var rep = banner.find('.UserProfile__rep');

        var el = rep.parent();
        var insertEl = $('<span></span>')
        insertEl.attr('title', 'This is ' + name + '\'s Voting Power.\n\n'+
          'Voting Power decreases with each vote. It is based upon how much Steem Power (aka vesting STEEM) an account holds as well as how much voting an account has done recently.\n\n'+
          'The amount in dollars is approximately how much reward will give a vote from this user if he/she uses a 100% of his/her current Voting Power.');

        var votingPowerEl = $('<span class="UserProfile__rep" id="Voting__power" style="font-size: 0.6em;"></span>');
        votingPowerEl.text(`(${votingPower}% VP` + 
          (typeof votingDollars !== 'undefined' ? (' ≈ ' + votingDollars + '$') : '') 
          + ')');

        insertEl.append(votingPowerEl);
        el.append(insertEl);

      });
    });

    steem.api.getAccountVotes(name, function(err, result) {
      window.SteemMoreInfo.Utils.getUserProfileBannerForAccountName(name, function(banner){

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

    var name = window.SteemMoreInfo.Utils.getPageAccountName();
    addBannerInfo(name);
  }


  var addVotesMenuButton = function() {
    var name = window.SteemMoreInfo.Utils.getPageAccountName();
    if(!name){
      return;
    }
    console.log('Adding votes menu: ' + name);

    window.SteemMoreInfo.Utils.getUserTopMenusForAccountName(name, function(menus){
      var menu = menus.eq(0); // first menu
      var votesLi = menu.find('li.menu-votes-tab-li');
      if(!votesLi.length){
        votesLi = $('<li class="smi-menu-li menu-votes-tab-li"><a href="#">Votes</a></li>');
        votesLi.find('a').on('click', function(e) {
          e.preventDefault();
          showVotesTab();
        });
        menu.append(votesLi);
      }
    });
  };

  var showVotesTab = function() {
    var container = $('.UserProfile');
    var divs = container.children();
    var realSelectedTab;
    var otherTabs = [];
    var votesTab;
    for (var i = divs.length - 1; i >= 0; i--) {
      var tab = $(divs[i]);
      if(!tab.hasClass('smi-tabs-div')){
        realSelectedTab = tab;
        otherTabs.push(tab);
        break;
      }else if(tab.hasClass('smi-votes-tab')){
        votesTab = tab;
      }else{
        otherTabs.push(tab);
      }
    }
    if(!votesTab){
      votesTab = $('<div class="smi-tabs-div smi-votes-tab"></div>');
      container.append(votesTab);
    }
    votesTab.html('<div class="row">\
       <div class="UserProfile__tab_content column" style="padding-bottom: 60px;">\
          <div class="VotesTab" style="display: none; padding-bottom: 20px;">\
             <div class="row">\
                <div class="column small-12">\
                   <h4 class="uppercase">Votes History</h4>\
                   <div class="votes-container">\
                   </div>\
                </div>\
             </div>\
          </div>\
          <center class="VotesTabLoading">\
             <div class="LoadingIndicator circle">\
                <div></div>\
             </div>\
          </center>\
          <center class="VotesTabLoadMore" style="display: none;">\
             <button style="\
              background-color: transparent;\
              border-radius: 6px;\
              border: 1px solid rgb(220, 220, 220);\
              display: inline-block;\
              cursor: pointer;\
              color: rgb(119, 119, 119);\
              font-family: Arial;\
              font-size: 17px;\
              padding: 10px 24px;\
              text-decoration: none;">\
              Load more... \
            </button>\
          </center>\
       </div>\
    </div>');
    otherTabs.forEach(function(otherTab){
      otherTab.hide();
    });
    $('.UserProfile__top-menu ul.menu li a').removeClass('active');
    $('li.menu-votes-tab-li a').addClass('active');
    votesTab.show();

    votesTab.find('.VotesTabLoadMore button').on('click', function(){
      var loadMore = $(this).parent();
      loadMore.hide();
      votesTab.find('.VotesTabLoading').show();
      var from = parseInt(loadMore.data('from'), 10);
      getVotes(votesTab, window.SteemMoreInfo.Utils.getPageAccountName(), from);
    });

    getVotes(votesTab, window.SteemMoreInfo.Utils.getPageAccountName());
  };  

  var onMenuItemClick = function() {
    var li = $(this).parent();
    if(!li.hasClass('smi-menu-li')){
      if(li.is('li') && li.find('a').attr('aria-haspopup') == 'true'){
        return;
      }
      var container = $('.UserProfile');
      var divs = container.children();
      var realSelectedTab;
      var otherTabs = [];
      for (var i = divs.length - 1; i >= 0; i--) {
        var tab = $(divs[i]);
        if(!tab.hasClass('smi-tabs-div')){
          realSelectedTab = tab;
          otherTabs.push(tab);
          break;
        }else{
          otherTabs.push(tab);
        }
      }
      otherTabs.forEach(function(otherTab){
        otherTab.hide();
      });
      if(realSelectedTab){
        realSelectedTab.show();
        $('.UserProfile__top-menu ul.menu li a').removeClass('active');
        if(li.is('li')){
          li.find('a').addClass('active');
        }
      }
    }
  };
  $('body').on('click', '.UserProfile__top-menu ul.menu li a', onMenuItemClick);
  $('body').on('click', '.dropdown-pane.is-open .VerticalMenu.menu.vertical li a', onMenuItemClick);
  $('body').on('click', '.UserProfile__stats span a', onMenuItemClick);


  var createVoteEl = function(tx) {
    var voter = tx.op[1].voter;
    var author = tx.op[1].author;
    var permlink = tx.op[1].permlink;
    var weight = Math.round(tx.op[1].weight / 100);
    var timestamp = tx.timestamp + 'Z';
    var date = new Date(timestamp);
    var mdate = moment(date);
    var timeagoTitle = mdate.format();
    var timeago = mdate.fromNow();

    var el = $('<div class="vote" style="display: flex; align-items: center;">\
      <a href="/@' + voter + '">\
        <img class="Userpic" style="margin: 5px; border: solid 1px #cacaca;" src="https://img.steemconnect.com/@' + voter + '?s=48" alt="' + voter + '">\
      </a>\
      <span class="action" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 10; padding: 0px 10px;">\
        <a class="account" href="/@' + voter + '">' + voter + '</a>\
        upvoted <a href="/@' + author + '/' + permlink + '" title="@' + author + '/' + permlink + '">@' + author + '/' + permlink + '</a>\
      </span>\
      <span class="vote-weight" style="white-space: nowrap;">\
        (' + weight + '%)\
      </span>\
      <span class="timeago" style="white-space: nowrap; padding: 0px 0px 0px 20px;" title="' + timeagoTitle + '">' + timeago + '</span>\
    </div>');

    return el;
  };

  var getVotes = function(votesTab, name, fromOrNull) {
    window.SteemMoreInfo.Utils.getUserHistory(name, fromOrNull, function(err, result){
      console.log(err, result);
      if(!result){
        return; //TODO: error
      }
      for (var i = result.length - 1; i >= 0; i--) {
        var tx = result[i][1];
        if(tx && tx.op && tx.op[0] === 'vote'){
          var voteEl = createVoteEl(tx);
          votesTab.find('.votes-container').append(voteEl);
        }
      }
      votesTab.find('.VotesTabLoading').hide();
      votesTab.find('.VotesTab').show();
      if(result[0][0] > 0){
        var from = result[0][0] - 1;
        var loadMore = votesTab.find('.VotesTabLoadMore');
        loadMore.data('from', from);
        loadMore.show();
      }
    });
  };


  window.SteemMoreInfo.Events.addEventListener(window, 'page-account-name', function() {
    resetBannerIfNeeded();
    addVotesMenuButton();
  });

  window.SteemMoreInfo.Events.addEventListener(window, 'voting-weight-change', function(e) {
    var weightDisplay = e.state;
    // console.log('weightDisplay: ', weightDisplay);
    var dollars = window.SteemMoreInfo.Utils.getVotingDollars(parseInt(weightDisplay.text(), 10));
    if(!dollars){
      return;
    }
    weightDisplay.css('margin-top', '-10px');
    var weightDollars = weightDisplay.parent().find('.voting_weight_dollars');
    if(weightDollars.length === 0){
      var weightDollarsCss = {
        position: 'absolute',
        'margin-left': '2rem',
        'margin-top': '10px',
        width: '3rem',
        float: 'left',
        'text-align': 'right',
        color: '#8a8a8a',
        'line-height': '2.6rem'
      }
      var weightDollars = $('<div class="voting_weight_dollars"></div>');
      weightDollars.css(weightDollarsCss);
      weightDisplay.after(weightDollars);
    }
    weightDollars.text(dollars.toFixed(2) + '$');
  });


  addBannerInfo(window.SteemMoreInfo.Utils.getPageAccountName());
  addVotesMenuButton();

})();
