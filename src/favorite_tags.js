
(function () {

  var getTagsValues = function() {
    return window.localStorage && window.localStorage.SteemMoreInfoFavoriteTags || '';
  };

  var setTagsValues = function(v) {
    if(window.localStorage){
      window.localStorage.SteemMoreInfoFavoriteTags = v;
    }
  };


  var menuItems = [];

  var trendingFavorite = $('<li class=""><a class="smi-navigate" href="/trending/favorite_tags">favorite tags</a></li>');
  menuItems.push(trendingFavorite);

  menuItems.forEach(function(menuItem){
    $('.Header__sub-nav ul.menu').append(menuItem);
  });


  function modifyPage(show){

    var tagsSelector = $('.smi-tags-selector');
    if(show){
      var container = $('.PostsIndex > .PostsIndex__left');
      if(!tagsSelector.length){
        tagsSelector = $('<div class="smi-tags-selector" style="margin-top: 0.5rem;"><span><span><input type="text" placeholder="Enter your favorite tags, separated by space." value=""></span><div class="error">aaaa</div></span></div>');
        tagsSelector.find('input').on('change', function() {
          setTagsValues($(this).val());
        });
      }
      tagsSelector.find('input').val(getTagsValues());
      container.prepend(tagsSelector);
    }else{
      tagsSelector.remove();
    }
  
  }

  var currentRequest;
  var nextRequest;

  var beforeWS = function(data, url) {
    if(url === 'wss://steemd-int.steemit.com/' && data && data.id 
      && data.params && data.params[1] === 'get_state' && data.params[2] 
      && data.params[2][0] === '/trending/favorite_tags') {
      var order = 'trending'; //TODO: other orders?
      var tags = getTagsValues();
      tags = tags.split(' ').filter(function(tag){
        return tag;
      });
      if(tags.length) {
        data.params[2] = ['/' + order + '/' + tags[0]];
        currentRequest = {
          id: data.id,
          current_route: '/' + order + '/favorite_tags',
          order: order,
          tag: 'favorite_tags',
          realIds: {}
        };
        currentRequest.realIds[data.id] = false;
        for (var i = 1; i < tags.length; i++) {
          var newId = window.SteemMoreInfo.WebServiceHook.getNewRequestId();
          currentRequest.realIds[newId] = false;
          var req = {
            id: newId,
            method: 'call',
            params: [0, 'get_state', [ '/' + order + '/' + tags[i] ]]
          };
          this.send(JSON.stringify(req));
        }
      }
    }
    if(url === 'wss://steemd-int.steemit.com/' && data && data.id
      && data.params && data.params[1] === 'get_discussions_by_trending' && data.params[2] 
      && data.params[2][0] && data.params[2][0].tag === 'favorite_tags') {
      var order = 'trending'; //TODO: other orders?
      var tags = getTagsValues();
      tags = tags.split(' ').filter(function(tag){
        return tag;
      });
      if(tags.length) {
        tags = tags.filter(function(tag){
          return nextRequest && nextRequest.byTags[tag] && nextRequest.byTags[tag].author && nextRequest.byTags[tag].permlink;
        });
        currentRequest = {
          id: data.id,
          moreRequest: true,
          realIds: {},
          tagByIds: {}
        };
        var nr = nextRequest && nextRequest.byTags[tags[0]] || {};
        data.params[2] = [{
          tag: tags[0],
          limit: 20,
          start_author: nr.author || '',
          start_permlink: nr.permlink || ''
        }];
        currentRequest.realIds[data.id] = false;
        currentRequest.tagByIds[data.id] = tags[0];
        for (var i = 1; i < tags.length; i++) {
          var newId = window.SteemMoreInfo.WebServiceHook.getNewRequestId();
          currentRequest.realIds[newId] = false;
          currentRequest.tagByIds[newId] = tags[i];
          var nr = nextRequest && nextRequest.byTags[tags[i]] || {};
          var req = {
            id: newId,
            method: 'call',
            params: [0, 'get_discussions_by_trending', [ {
              tag: tags[i],
              limit: 20,
              start_author: nr.author || '',
              start_permlink: nr.permlink || ''
            } ]]
          };
          this.send(JSON.stringify(req));
        }
      }
    }
    return data;
  };

  var afterWS = function(data, url, cb) {
    if(url === 'wss://steemd-int.steemit.com/' && currentRequest && !currentRequest.moreRequest){
      var stop = false;
      if(currentRequest.id === data.id) {
        currentRequest.cb = cb;
      }
      if(currentRequest.realIds && typeof currentRequest.realIds[data.id] !== 'undefined'){
        currentRequest.realIds[data.id] = data;
        currentRequest.last = data;
        checkRequestFinished();
        return true;
      }
    }
    if(url === 'wss://steemd-int.steemit.com/' && currentRequest && currentRequest.moreRequest){
      var stop = false;
      if(currentRequest.id === data.id) {
        currentRequest.cb = cb;
      }
      if(currentRequest.realIds && typeof currentRequest.realIds[data.id] !== 'undefined'){
        currentRequest.realIds[data.id] = data;
        checkMoreRequestFinished();
        return true;
      }
    }
  };

  var mergePostArrays = function(a1, a2) {
    var a = [];
    var i1 = 0, i2 = 0;
    while(i1 < a1.length && i2 < a2.length) {
      if(a1[i1].net_rshares >= a2[i2].net_rshares){
        a.push(a1[i1]);
        i1++;
      }else{
        a.push(a2[i2]);
        i2++;
      }
    }
    while(i1 < a1.length) {
      a.push(a1[i1]);
      i1++;
    }
    while(i2 < a2.length) {      
      a.push(a2[i2]);
      i2++;
    }
    return a;
  };

  var checkRequestFinished = function() {
    if(_.every(currentRequest.realIds, function(data) {
      return data;
    })){
      //merge the data objects
      var data = currentRequest.last;
      nextRequest = {
        byTags: {}
      };
      var discussion = [];
      _.each(currentRequest.realIds, function(d) {
        _.assign(data.result.accounts, d.result.accounts);
        _.assign(data.result.content, d.result.content);
        _.each(d.result.discussion_idx, function(disc, tag) {
          var posts = disc[currentRequest.order];
          discussion = mergePostArrays(discussion, posts);
          if(posts.length){
            var link = posts[posts.length - 1];
            link = link.split('/');
            nextRequest.byTags[tag] = {
              author: link[0] || '',
              permlink: link[1] || ''
            };
          }
        });
      });
      data.id = currentRequest.id;
      data.result.current_route = currentRequest.current_route;
      data.result.discussion_idx = {};
      data.result.discussion_idx[currentRequest.tag] = {
        category: "",
        trending: [],
        payout: [],
        payout_comments: [],
        trending30: [],
        updated: [],
        created: [],
        responses: [],
        active: [],
        votes: [],
        maturing: [],
        best: [],
        hot: [],
        promoted: [],
        cashout: []
      };
      data.result.discussion_idx[currentRequest.tag][currentRequest.order] = discussion;

      if(discussion.length){
        var lastPostId = discussion[discussion.length-1];
        nextRequest.lastPost = data.result.content[lastPostId];
      }

      console.log(nextRequest);
      console.log(data);
      currentRequest.cb(data);
    }
  }

  var checkMoreRequestFinished = function() {
    if(_.every(currentRequest.realIds, function(data) {
      return data;
    })){
      //merge the data objects
      var data = {
        id: currentRequest.id,
        result: []
      };
      var firstPost = nextRequest.lastPost;
      nextRequest = {
        byTags: {}
      };
      _.each(currentRequest.realIds, function(d) {
        if(!d.result){
          return; 
        }
        d.result.splice(0, 1);
        data.result = mergePostArrays(data.result, d.result);
        if(d.result.length){
          var tag = currentRequest.tagByIds[d.id]; 
          var post = d.result[d.result.length - 1];
          nextRequest.byTags[tag] = {
            author: post.author,
            permlink: post.permlink
          };
        };
      });

      if(firstPost){
        data.result = [firstPost].concat(data.result);
      }

      if(data.result.length){
        nextRequest.lastPost = data.result[data.result.length - 1];
      }

      console.log(nextRequest);
      console.log(data);
      currentRequest.cb(data);
    }
  };

  window.SteemMoreInfo.WebServiceHook.addBefore(beforeWS);
  window.SteemMoreInfo.WebServiceHook.addAfter(afterWS);  


  var onUrlChanged = function(onload) {
    if(window.location.pathname === '/trending/favorite_tags'){
      if(onload){
        var container = $('.PostsIndex > .PostsIndex__left');
        container.find('.callout').hide();

        window.SteemMoreInfo.Utils.navigate(window.location.pathname);
      }
      setTimeout(function() {
        modifyPage(true);
      }, 100);
    }else{
      modifyPage(false);      
    }
  };

  $(window).on('changestate', function(e) {
    onUrlChanged();
  });

  onUrlChanged(true);

})();
