
(function(){

  var addOrRemoveAfterSettingsChange = function() {
    if(mentionsTabEnabled() === 'disabled'){
      window.SteemMoreInfo.Tabs.disableTab('mentions');
    }else{
      window.SteemMoreInfo.Tabs.enableTab('mentions');
    }
  };

  window.SteemMoreInfo.Utils.addSettings({
    title: 'Mentions Tab',
    settings: [{
      title: '',
      key: 'MentionsTab',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'Adds a tab where you can see the posts and comments where the user was mentioned',
      onChange: addOrRemoveAfterSettingsChange
    }]
  });

  var mentionsTabEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('MentionsTab');
    return value;
  };



  var createMentionsTab = function(mentionsTab) {
    mentionsTab.html('<div class="row">\
       <div class="UserProfile__tab_content UserProfile__tab_content_smi UserProfile__tab_content_MentionsTab column">\
          <div class="MentionsTab" style="display: none;">\
            <div id="posts_list" class="PostsList">\
              <ul class="PostsList__summaries hfeed" itemscope="" itemtype="http://schema.org/blogPosts">\
              </ul>\
            </div>\
          </div>\
          <center class="MentionsTabLoading">\
             <div class="LoadingIndicator circle">\
                <div></div>\
             </div>\
          </center>\
          <center class="MentionsTabLoadMore" style="display: none;">\
             <button>\
              Load more... \
            </button>\
          </center>\
       </div>\
    </div>');
    
    mentionsTab.find('.MentionsTabLoadMore button').on('click', function(){
      var loadMore = $(this).parent();
      loadMore.hide();
      mentionsTab.find('.MentionsTabLoading').show();
      var from = parseInt(loadMore.data('from'), 10);
      getPosts(mentionsTab, window.SteemMoreInfo.Utils.getPageAccountName(), from);
    });    

    getPosts(mentionsTab, window.SteemMoreInfo.Utils.getPageAccountName());
  };  



  var getPosts = function(mentionsTab, name, fromOrNull) {
    fromOrNull = fromOrNull || 0;
    window.SMI_AJAX({
      url: 'https://webapi.steemdata.com/Comments?where={"$text":{"$search":"\\"@' + name + '\\""}}&sort=-created&page=' + (fromOrNull+1),
      type: 'GET',
      error: function(err){
        console.log(err);
        //TODO: error
      },
      success: function(data) {
        var posts = data._items;
        var postsList = mentionsTab.find('.PostsList__summaries');
        if(postsList.length){
          posts.forEach(function(post) {
            var el = window.SteemMoreInfo.Utils.createPostSummary(post);
            postsList.append(el);
          });

          mentionsTab.find('.MentionsTabLoading').hide();
          mentionsTab.find('.MentionsTab').show();
          if(data._links.next){
            var from = fromOrNull + 1;
            var loadMore = mentionsTab.find('.MentionsTabLoadMore');
            loadMore.data('from', from);
            loadMore.show();
          }

        }
      }
    });

  };





  window.SteemMoreInfo.Tabs.createTab({
    id: 'mentions',
    title: 'Mentions',
    enabled: (mentionsTabEnabled() !== 'disabled'),
    createTab: createMentionsTab
  });



})();
