
(function(){

  var addOrRemoveAfterSettingsChange = function() {
    if(votesTabEnabled() === 'disabled'){
      window.SteemMoreInfo.Tabs.disableTab('votes');
    }else{
      window.SteemMoreInfo.Tabs.enableTab('votes');
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




  var createVotesTab = function(votesTab) {
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



  window.SteemMoreInfo.Tabs.createTab({
    id: 'votes',
    title: 'Votes',
    enabled: (votesTabEnabled() !== 'disabled'),
    createTab: createVotesTab
  });



})();
