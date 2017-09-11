
(function(){
  
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
      <a class="smi-navigate" href="/@' + voter + '">\
        <img class="Userpic" src="https://img.steemconnect.com/@' + voter + '?s=48" alt="' + voter + '">\
      </a>\
      <div class="vote-info">\
        <span class="action">\
          <a class="account" class="smi-navigate" href="/@' + voter + '">' + voter + '</a>\
          ' + verb +' <a class="smi-navigate" href="/@' + author + '/' + permlink + '" title="@' + author + '/' + permlink + '">@' + author + '/' + permlink + '</a>\
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
    addVotesMenuButton();
  });

  addVotesMenuButton();

})();
