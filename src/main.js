
(function(){
  
  var name = window.SteemMoreInfo.Utils.getPageAccountName();


  function addBannerInfo(name) {
    if(!name){
      return;
    }
    console.log('Adding info for user: ' + name);

    steem.api.getAccounts([name], function(err, result){
      window.SteemMoreInfo.Utils.getUserProfileBannerForAccountName(name, function(banner){

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
       <div class="UserProfile__tab_content UserProfile__tab_content_VotesTab column">\
          <div class="VotesTab" style="display: none;">\
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
             <button>\
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

    var verb = weight >= 0 ? 'upvoted' : 'downvoted';

    var el = $('<div class="vote">\
      <a href="/@' + voter + '">\
        <img class="Userpic" src="https://img.steemconnect.com/@' + voter + '?s=48" alt="' + voter + '">\
      </a>\
      <div class="vote-info">\
        <span class="action">\
          <a class="account" href="/@' + voter + '">' + voter + '</a>\
          ' + verb +' <a href="/@' + author + '/' + permlink + '" title="@' + author + '/' + permlink + '">@' + author + '/' + permlink + '</a>\
        </span>\
        <span class="timeago" title="' + timeagoTitle + '">' + timeago + '</span>\
        <span class="vote-weight">\
          Weight: ' + weight + '%\
          <span class="vote-dollar"></span>\
        </span>\
      </div>\
    </div>');

    return el;
  };

  var getVotes = function(votesTab, name, fromOrNull) {
    window.SteemMoreInfo.Utils.getUserHistory(name, fromOrNull, function(err, result){
      if(!result){
        return; //TODO: error
      }
      var uniqueCommentTargets = {};
      for (var i = result.length - 1; i >= 0; i--) {
        var tx = result[i][1];
        if(tx && tx.op && tx.op[0] === 'vote'){
          var voter = tx.op[1].voter;
          var author = tx.op[1].author;
          var permlink = tx.op[1].permlink;
          var uniqueId = author + '__' + permlink;
          uniqueCommentTargets[uniqueId] = uniqueCommentTargets[uniqueId] || {
            author: author,
            permlink: permlink,
            voteEls: {}
          };
          var voteEl = createVoteEl(tx);
          uniqueCommentTargets[uniqueId].voteEls[voter] = uniqueCommentTargets[uniqueId].voteEls[voter] || [];
          uniqueCommentTargets[uniqueId].voteEls[voter].push(voteEl);
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
      _.each(uniqueCommentTargets, function(target){
        window.SteemMoreInfo.Utils.getContent(target.author, target.permlink, function(err, result){
          if(!result){
            return;
          }
          _.each(result.active_votes, function(vote) {
            var voter = vote.voter;
            var voteDollar = vote.voteDollar;
            if(voteDollar){
              var voteEls = target.voteEls[voter];
              _.each(voteEls, function(voteEl) {
                voteEl.find('.vote-dollar').text(' ≈ ' + voteDollar + '$');
              });
            }
          });
        });
      });
    });
  };


  window.SteemMoreInfo.Events.addEventListener(window, 'page-account-name', function() {
    resetBannerIfNeeded();
    addVotesMenuButton();
  });


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


  window.SteemMoreInfo.Events.addEventListener(window, 'voters-list-show', function(e) {
    var votersList = e.state;
    if(!votersList.hasClass('smi-voting-info-shown')){

      var author;
      var permlink;

      var hentry = votersList.closest('.hentry');
      if(hentry.is('article')){
        var url = window.location.pathname;
        var match = url.match(/\/[^\/]*\/@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }else{
        var id = hentry.attr('id');
        var match = id.match(/\#@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }
      if(!author || !permlink){
        return;
      }

      votersList.addClass('smi-voting-info-shown');
      var moreButtonLi;
      var voteElsByVoter = {};

      // prevent page scroll if mouse is no top of the list
      votersList.bind('mousewheel DOMMouseScroll', function (e) {
        var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
            bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
            topOverflow = this.scrollTop <= 0;

        if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
            e.preventDefault();
        }
      });

      votersList.children().each(function(){
        var li = $(this);
        if(!li.has('a').length){
          moreButtonLi = li;
          return;
        }
        var voteWeigth = $('<span class="vote-weight"></span>');
        var voteDollar = $('<span class="vote-dollar"></span>');
        li.append(voteWeigth);
        li.append(voteDollar);

        var href = li.find('a').attr('href');
        var voter = href.substring(2);

        voteElsByVoter[voter] = voteElsByVoter[voter] || [];
        voteElsByVoter[voter].push(li);
      });

      window.SteemMoreInfo.Utils.getContent(author, permlink, function(err, result){
        if(!result){
          return;
        }
        var newElCount = 0;
        var active_votes = _.sortBy(result.active_votes, function(v){
          return -parseInt(v.rshares);
        });
        _.each(active_votes, function(vote) {
          var voter = vote.voter;
          var voteDollar = vote.voteDollar;
          var votePercent = Math.round(vote.percent / 100);
          if(voteDollar){
            var voteEls = voteElsByVoter[voter] || [];
            if(!voteEls.length){
              var newEl = $('<li>' +
                '<a href="/@' + voter + '">' +
                (votePercent >= 0 ? '+' : '-') + ' ' + voter + 
                '</a>' +
                '<span class="vote-weight"></span>' +
                '<span class="vote-dollar"></span>' +
                '</li>');
              votersList.append(newEl);
              newElCount++;
              voteEls.push(newEl);
            }
            _.each(voteEls, function(voteEl) {
              voteEl.find('.vote-weight').text(votePercent + '%');
              voteEl.find('.vote-dollar').text('≈ ' + voteDollar + '$');
            });
          }
        });
        if(newElCount && moreButtonLi){
          moreButtonLi.remove();
        }
      });

    }
  });


  addBannerInfo(window.SteemMoreInfo.Utils.getPageAccountName());
  addVotesMenuButton();

})();
