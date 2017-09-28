
(function () {

  var openClick = function(link) {
    if(window.localStorage) {
      window.localStorage.SteemMoreInfoLastPostOpened = link;
    }
  };

  var closeClick = function(link) {
    var banner = $('.smi-banner-ask-upvote');
    banner.remove();
    if(window.localStorage) {
      window.localStorage.SteemMoreInfoLastPostClosed = link;
    }
  };

  var postVoted = function(link) {
    if(window.localStorage) {
      window.localStorage.SteemMoreInfoLastPostVoted = link;
    }    
  }


  var showBanner = function(title, link) {
    var banner = $('.smi-banner-ask-upvote');
    banner.remove();

    var icon = 'https://raw.githubusercontent.com/armandocat/steemit-more-info/master/smi128.png';

    banner = $('<div class="smi-banner-ask-upvote">\
      <div class="smi-banner-ask-upvote-container">\
        <img class="icon" src="' + icon + '">\
        <div class="text-wrapper">\
          <button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button>\
          <h5 class="title">Steemit More Info</h5>\
          <span class="description">Do you like this <i>Steemit</i> extension?</span>\
          <span class="description">Please have a look at the following <strong>post with the latest update</strong>.</span>\
          <span class="new-line"></span>\
          <span class="link"></span>\
          <span class="new-line"></span>\
          <span class="description">To support the project, <strong>upvote and resteem</strong>! Thank you!</span>\
        </div>\
      </div>\
    </div>');
    
    var a = $('<a></a>');
    a.attr('href', link);
    a.text(title);
    banner.find('.link').append(a);

    a.on('click', function() {
      openClick(link);
    });

    banner.find('.close-button').on('click', function(){
      closeClick(link);
    });

    $('.App__content').before(banner);
  };


  var checkLastPost = function() {
    var lastPost = window.SteemMoreInfo && window.SteemMoreInfo.LastPost;
    if(!lastPost) {
      return;
    }    
    var loggedUser = window.SteemMoreInfo.Utils.getLoggedUserName();
    if(!loggedUser){
      retryLater();
      return;      
    }

    if(window.localStorage) {
      if(window.localStorage.SteemMoreInfoLastPostOpened === lastPost){
        return;
      }
      if(window.localStorage.SteemMoreInfoLastPostClosed === lastPost){
        return;
      }
      if(window.localStorage.SteemMoreInfoLastPostVoted === lastPost){
        return;
      }
    }

    var match = lastPost.match(/^https\:\/\/steemit\.com(\/[^\/]*)?\/\@([a-zA-Z0-9_\-\.]*)\/(.*)?$/);
    if(!match) {
      retryLater;
      return;
    }
    var author = match[2];
    var permlink = match[3];

    steem.api.getContent(author, permlink, function(err, result) {
      console.log('lastPost: ', err, result);
      if(err){
        retryLater();
        return;
      }
      var title = result.title;
      var votes = result.active_votes;

      var voted = _.some(votes, function(vote) {
        return vote && vote.voter === loggedUser;
      });

      if(voted){
        postVoted(lastPost);
        return;
      }

      var created = new Date(result.created + 'Z');

      var waited = new Date() - created;
      var minWait = 24*60*60*1000; // wait 24h before showing the link
      var waitedEnough = (waited > minWait); 

      if(!waitedEnough){
        retryLater(minWait - waited);
        return;
      }

      showBanner(title, lastPost);

    });
  };


  var retryLater = function(wait) {
    wait = wait || 30 * 1000;
    setTimeout(checkLastPost, wait);
  };


  $(window).on('check-last-post', checkLastPost);
  checkLastPost();
  
})();
