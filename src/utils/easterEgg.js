

(function () {

  var CAT_SIZE = '200px';
  var CAT_HIDE = '-' + CAT_SIZE;
  var CAT_HIDE_AFTER = 10 * 1000;
  var CAT_MIN_LEFT = '70px';


  var _randomPosition = function(p) {
    var r = Math.random();
    var s = '100v' + p;
    return `calc(${CAT_MIN_LEFT} + (${s} - ${CAT_SIZE} - ${CAT_MIN_LEFT}) * ${r})`;
  };
  var randomLeft = function() {
    return _randomPosition('w');
  };
  var randomTop = function() {
    return _randomPosition('h');
  };

  var sides = {
    bottom: {
      containerStyle: {
        bottom: CAT_HIDE,
        left: randomLeft
      },
      hideStyle: {
        bottom: CAT_HIDE,        
      },
      containerStyleOnLoad: {
        bottom: '0px'
      },
      rotation: 0
    },
    top: {
      containerStyle: {
        top: CAT_HIDE,
        left: randomLeft
      },
      hideStyle: {
        top: CAT_HIDE,        
      },
      containerStyleOnLoad: {
        top: '0px'
      },
      rotation: 180
    },
    left: {
      containerStyle: {
        left: CAT_HIDE,
        top: randomTop
      },
      hideStyle: {
        left: CAT_HIDE,        
      },
      containerStyleOnLoad: {
        left: '0px'
      },
      rotation: 90
    },
    right: {
      containerStyle: {
        right: CAT_HIDE,
        top: randomTop
      },
      hideStyle: {
        right: CAT_HIDE,        
      },
      containerStyleOnLoad: {
        right: '0px'
      },
      rotation: 270
    }
  };


  var hideEasterEgg = function(containers) {
    containers.each(function(){
      var container = $(this);
      var side = container.data('side');
      var info = sides[side];
  
      if(info) {
        container.css(info.hideStyle);
      }

      setTimeout(function() {
        container.remove();
      }, 5000);
    });
  };


  var createEasterEgg = function(side, options) {
    side = side || 'bottom';
    var info = sides[side];
    if(!info){
      return;
    }

    var container = $('<div class="smi-easter-egg">\
      <div class="smi-easter-egg-wrapper">\
        <a href="/@armandocat" class="smi-navigate">\
          <img src="https://i.imgsafe.org/e2/e2a31261b6.png">\
        </a>\
      </div>\
    </div>');
    container.data('side', side);
    var img = container.find('img');
    
    var transitionTime = '1s';
    var transition = `left ${transitionTime}, right ${transitionTime}, top ${transitionTime}, bottom ${transitionTime}`;

    container.css({
      position: 'fixed',
      'z-index': 10000000,
      '-webkit-transition': transition,
      'transition': transition,
      width: CAT_SIZE,
      height: CAT_SIZE,
      transform: 'rotate(' + info.rotation + 'deg)'
    });
    
    container.css(_.mapValues(info.containerStyle, function(v) {
      if(typeof v === 'function'){
        v = v();
      }
      return v;
    }));

    container.find('.smi-easter-egg-wrapper').css({
      width: '100%',
      height: '100%',
      position: 'relative'
    });

    img.css({
      position: 'absolute',
      bottom: '0px',
      'max-width': '100%',
      'max-height': '100%'
    });

    container.find('a').on('click', function() {
      hideEasterEgg(container);
    });

    if(options && options.byName){
      var bubble = $('<img src="https://i.imgsafe.org/e4/e417415179.png">');
      bubble.css({
        position: 'absolute',
        left: '-29%',
        top: '22%',
        width: '75%'
      });
      img.after(bubble);
    }

    if(options && options.link) {
      container.find('a').attr('href', options.link);
    }

    hideEasterEgg($('.smi-easter-egg'));    
    container.hide();

    $('body').append(container);

    var afterLoad = function() {
      setTimeout(function() {
        
        container.show();
        container.css(_.mapValues(info.containerStyleOnLoad, function(v) {
          if(typeof v === 'function'){
            v = v(Math.random());
          }
          return v;
        }));

        setTimeout(function() {
          if(window.localStorage) {
            window.localStorage.SteemMoreInfoLastEasterEgg = new Date()
          }
        }, 2 * 1000);

        setTimeout(function() {
          hideEasterEgg(container);
        }, CAT_HIDE_AFTER);

      }, 100);
    };

    img.each(function(){
      if (this.complete || /*for IE 10-*/ $(this).height() > 0) {
        afterLoad();
      }
      else {
        $(this).on('load', function(){
          afterLoad();
        });
      }
    });

  };


  window.SMI_EASTER_EGG = createEasterEgg;


  var randomShow = function(options) {
    var keys = Object.keys(sides);
    var index = Math.floor(Math.random() * keys.length);
    var side = keys[index];
    createEasterEgg(side, options);    
  };


  var show_code = 'armando';

  var buff = show_code.split('');
  $('body').on('keypress', function(e) {
    buff.shift()
    buff.push(e.key)
    if(buff.join('') === show_code) {
      randomShow({byName: true});
    }
  });




  // show this when there is a new post of @armandocat that:
  // - not been upvoted yet by the current user 
  // - only for posts older than 2 days and not older than 5 days
  // - don't do it more than once every 7 days
  // - and with probability 1%, so the user is not bothered too much ;)
  // - only if using the extension for more than 5 days


  var checkLastPost = function() {
    var loggedUser = window.SteemMoreInfo.Utils.getLoggedUserName();
    if(!loggedUser){
      retryLater();
      return;      
    }
    if(window.localStorage) {
      if(window.localStorage.SteemMoreInfoFirstEasterEgg) {
        var first = new Date(window.localStorage.SteemMoreInfoFirstEasterEgg);
        if(first && new Date() - first < 5 * 24 * 60 * 60 * 1000){
          return;
        }
      }else{
        window.localStorage.SteemMoreInfoFirstEasterEgg = new Date();
        return;
      }
      var last = window.localStorage.SteemMoreInfoLastEasterEgg && new Date(window.localStorage.SteemMoreInfoLastEasterEgg);
      if(last && new Date() - last < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
      var r = Math.random();
      if(r > 0.01) {
        return;
      }
    }

    steem.api.getBlog('armandocat', 0, 2, function(err, blog){
      var author;
      var permlink;
      for (var i = 0; i < blog.length; i++) {
        author = blog[i].comment.author;
        if(author === 'armandocat'){
          permlink = blog[i].comment.permlink;
          break;
        }
      }
      if(!permlink){
        return;
      }

      steem.api.getContent(author, permlink, function(err, result) {
        console.log('lastPost: ', err, result);

        var votes = result.active_votes;
        var voted = _.some(votes, function(vote) {
          return vote && vote.voter === loggedUser;
        });

        if(voted){
          return;
        }

        var created = new Date(result.created + 'Z');
        var waited = new Date() - created;
        if(waited < 2 * 24 * 60 * 60 * 1000 || waited > 5 * 24 * 60 * 60 * 1000){
          return;
        }

        randomShow({
          link: '/' + result.category + '/@' + author + '/' + permlink
        });

      });

    });
    
  };


  var retryLater = function(wait) {
    wait = wait || 30 * 1000;
    setTimeout(checkLastPost, wait);
  };

  // try first after 30 seconds the user is on the page
  retryLater(30 * 1000);


})();
