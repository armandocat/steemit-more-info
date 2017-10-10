
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
            <h4 class="uppercase">\
              Mentions\
              <div class="switch-field" style="margin-bottom: -4px; margin-left: 20px;">\
                <input type="radio" id="mentions-type-posts" name="mentions-type" class="mentions-type" value="0" checked/>\
                <label for="mentions-type-posts">Posts</label>\
                <input type="radio" id="mentions-type-comments" name="mentions-type" class="mentions-type" value="1" />\
                <label for="mentions-type-comments">Comments</label>\
                <input type="radio" id="mentions-type-both" name="mentions-type" class="mentions-type" value="2" />\
                <label for="mentions-type-both">Both</label>\
              </div>\
            </h4>\
            <div id="posts_list" class="PostsList" style="margin-top: 30px;">\
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
      getPostsAndComments(mentionsTab, window.SteemMoreInfo.Utils.getPageAccountName());
    });    
    mentionsTab.find('.mentions-type').on('change', function() {
      getPostsAndComments(mentionsTab, window.SteemMoreInfo.Utils.getPageAccountName(), true);
    });

    getPostsAndComments(mentionsTab, window.SteemMoreInfo.Utils.getPageAccountName());
  };  


  var _getPostsAndComments = function(whats, name, info, cb) {
    info = info || {
      buffer: {},
      from: {},
      index: {},
      posts: [],
      hasMore: true
    };
    info.postsFrom = info.posts.length;

    var merge = function() {
      var keys = Object.keys(info.buffer);
      var checkIndexes = function() {
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if((info.index[key] || 0) < info.buffer[key].length){
            return true;
          }
        }
        return false;
      };
      var checkFrom = function() {
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if(info.from[key] !== -1){
            return true;
          }
        }
        return false;
      };
      var added = 0;
      while(added < 50 && checkIndexes()) {
        var max = null;
        var maxKey;
        keys.forEach(function(key) {
          var index = (info.index[key] || 0);
          var post = info.buffer[key][index] || null;
          if(post){
            if(!max){
              max = post;
              maxKey = key;
            }else{
              var d1 = moment(max.created);
              var d2 = moment(post.created);
              if(d1 < d2){
                max = post;
                maxKey = key;
              }
            }
          }
        });
        info.index[maxKey] = (info.index[maxKey] || 0) + 1;
        info.posts.push(max);
        added++;
      }
      info.hasMore = (checkIndexes() || checkFrom());
    };

    var done = 0;
    var successCb = function(what, data){
      done++;
      if(data){
        var buffer = info.buffer[what] || [];
        buffer = buffer.concat(data._items);
        info.buffer[what] = buffer;        

        if(data._links.next){
          info.from[what] = (info.from[what] || 0) + 1;
        }else{
          info.from[what] = -1;
        }
      }
      if(done === whats.length){
        merge();
        cb(info);
      }
    };

    whats.forEach(function(what) {
      var from = info.from[what] || 0;
      if(from === -1){
        successCb(what, null);
      }else{
        var index = info.index[what] || 0;
        var buffer = info.buffer[what] || [];

        if(buffer.length >= index + 50){
          successCb(what, null);
        }else{
          window.SMI_AJAX({
            url: 'https://webapi.steemdata.com/' + what + '?where={"$text":{"$search":"\\"@' + name + '\\""}}&sort=-created&page=' + (from+1),
            type: 'GET',
            error: function(err){
              console.log(err);
              //TODO: error
            },
            success: function(data) {
              successCb(what, data);
            }
          });
        }
      }
    });
  };


  var getPostsAndComments = function(mentionsTab, name, reset) {
    var v = mentionsTab.find('.mentions-type:checked').val();
    var whats;
    if(v == 0){
      whats = ['Posts'];
    } else if(v == 1) {
      whats = ['Comments'];
    } else {
      whats = ['Posts', 'Comments'];
    }

    var loadMore = mentionsTab.find('.MentionsTabLoadMore');
    var info1;
    if(reset){
      loadMore.data('posts-download-info', null);
      mentionsTab.find('.PostsList__summaries').html('');
    }else{
      info1 = loadMore.data('posts-download-info');
    }
    loadMore.hide();
    mentionsTab.find('.MentionsTabLoading').show();

    _getPostsAndComments(whats, name, info1, function(info2){
      loadMore.data('posts-download-info', info2);
      var posts = info2.posts;
      var postsFrom = info2.postsFrom;
      var hasMore = info2.hasMore;

      var postsList = mentionsTab.find('.PostsList__summaries');
      if(postsList.length){
        for (var i = postsFrom; i < posts.length; i++) {
          var post = posts[i]
          var el = window.SteemMoreInfo.Utils.createPostSummary(post);
          postsList.append(el);
        }

        mentionsTab.find('.MentionsTabLoading').hide();
        mentionsTab.find('.MentionsTab').show();
        if(hasMore){
          loadMore.show();
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
