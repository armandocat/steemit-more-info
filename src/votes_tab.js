
(function(){

  var addOrRemoveAfterSettingsChange = function() {
    if(votesTabEnabled() === 'disabled'){
      $('li.menu-votes-tab-li').remove();
    }else{
      addVotesMenuButton();
    }
  };

  window.SteemMoreInfo.Utils.addSettings({
    title: 'Votes Tab',
    settings: [{
      title: '',
      key: 'VotesTab',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'Adds a tab where you can see the incoming and outgoing votes of an account',
      onChange: addOrRemoveAfterSettingsChange
    }]
  });

  var votesTabEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('VotesTab');
    return value;
  };


  
  var addVotesMenuButton = function() {
    if(votesTabEnabled() === 'disabled'){
      return;
    }

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

      if(window.location.hash === '#votes'){
        showVotesTab();
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
       <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_VotesTab column">\
          <div class="VotesTab" style="display: none;">\
             <div class="row">\
                <div class="column small-12">\
                  <h4 class="uppercase">\
                    Votes History\
                    <div class="switch-field" style="margin-bottom: -4px; margin-left: 20px;">\
                      <input type="radio" id="votes-history-type-incoming" name="votes-history-type" class="votes-history-type" value="0" checked/>\
                      <label for="votes-history-type-incoming">Incoming</label>\
                      <input type="radio" id="votes-history-type-outgoing" name="votes-history-type" class="votes-history-type" value="1" />\
                      <label for="votes-history-type-outgoing">Outgoing</label>\
                      <input type="radio" id="votes-history-type-both" name="votes-history-type" class="votes-history-type" value="2" />\
                      <label for="votes-history-type-both">Both</label>\
                    </div>\
                  </h4>\
                  <div class="votes-container show-incoming">\
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
    window.location.hash = '#votes';

    votesTab.find('.VotesTabLoadMore button').on('click', function(){
      var loadMore = $(this).parent();
      loadMore.hide();
      votesTab.find('.VotesTabLoading').show();
      var from = parseInt(loadMore.data('from'), 10);
      getVotes(votesTab, window.SteemMoreInfo.Utils.getPageAccountName(), from);
    });

    votesTab.find('.votes-history-type').on('change', function(e) {
      var v = $(e.target).val();
      var container = votesTab.find('.votes-container');
      if(v == 1){
        container.removeClass('show-incoming');
        container.addClass('show-outgoing');
      }else if(v == 2){
        container.addClass('show-incoming');
        container.addClass('show-outgoing');
      }else{
        container.addClass('show-incoming');
        container.removeClass('show-outgoing');
      }
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
    var voteType = '';

    var pageAccountName = window.SteemMoreInfo.Utils.getPageAccountName();
    if(author === pageAccountName && voter !== pageAccountName){
      voteType = 'vote-incoming';
    }else if(author !== pageAccountName && voter === pageAccountName) {
      voteType = 'vote-outgoing';
    }

    var el = $('<div class="vote ' + voteType + '">\
      <a class="smi-navigate" href="/@' + voter + '">\
        <img class="Userpic" src="https://img.busy.org/@' + voter + '?s=48" alt="' + voter + '">\
      </a>\
      <div class="vote-info">\
        <span class="action">\
          <a class="account" class="smi-navigate" href="/@' + voter + '">' + voter + '</a>\
          ' + verb + ' \
          <a class="smi-navigate smi-vote-permlink" href="/@' + author + '/' + permlink + '" title="@' + author + '/' + permlink + '">@' + author + '/' + permlink + '</a>\
        </span>\
        <span class="timeago" title="' + timeagoTitle + '">' + timeago + '</span>\
        <span class="vote-weight" data-weight="' + tx.op[1].weight + '">\
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
            var weight = vote.percent;
            var voteDollar = vote.voteDollar;
            if(typeof voteDollar !== 'undefined'){
              var voteEls = target.voteEls[voter];
              _.each(voteEls, function(voteEl) {
                var thisWeight = voteEl.find('.vote-weight').data('weight');
                if(thisWeight == 0){
                  vd = 0;
                }else{
                  vd = voteDollar * thisWeight / weight;
                }
                voteEl.find('.vote-dollar').text(' ≈ ' + vd.toFixed(2) + '$');
              });
            }
          });
        });
      });
    });
  };


  // $('.Header__top.header .Header__userpic > a').on('click', function() {
  //   var userHref = $(this).attr('href');
  //   setTimeout(function() {
  //     if($('body > div > div > div.dropdown-pane ul.menu li.smi-votes-tab-li').length){
  //       return;
  //     }

  //     var recentRepliesLi = $('body > div > div > div.dropdown-pane ul.menu li').filter(function(){
  //       var href = $(this).find('a').attr('href'); 
  //       return href && href.indexOf('recent-replies') !== -1;
  //     });
  //     var li = $('<li class="smi-votes-tab-li">\
  //       <a href="' + userHref + '#votes" class="smi-navigate">\
  //         <span class="Icon reply" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
  //           <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>reply</title><path d="M14 24.238v7.762l-12-12 12-12v7.932c13.961 0.327 13.362-9.493 9.808-15.932 8.772 9.482 6.909 24.674-9.808 24.238z"></path></svg>\
  //         </span>\
  //         Votes\
  //       </a>\
  //     </li>');

  //     recentRepliesLi.after(li)
  //   }, 250);
  // });


  window.SteemMoreInfo.Events.addEventListener(window, 'page-account-name', function() {
    addVotesMenuButton();
  });

  addVotesMenuButton();

})();
