
(function(){
  
  var menuClass = 'smi-external-links-menu';

  var externalLinks = [{
    title: 'Steemd.com',
    href: function(username) { 
      return 'https://steemd.com/@' + username; 
    }
  }, {
    title: 'SteemDB.com',
    href: function(username) { 
      return 'https://steemdb.com/@' + username; 
    }
  }, {
    title: 'SteemTracked',
    href: function(username) { 
      return 'https://steemtracked.com/@' + username; 
    }
  }, {
    title: 'Steem Followers',
    href: function(username) { 
      return 'https://steem.makerwannabe.com/@' + username + '/followers/4';
    }
  }, {
    title: 'Potential Rewards',
    href: function(username) { 
      return 'http://steem.supply/@' + username;
    }
  }, {
    title: 'Mentions',
    href: function(username) { 
      return 'http://steemistry.com/steemit-mentions-tool/?mention=@' + username;
    }
  }, {
    title: 'Steem Whales',
    href: function(username) { 
      return 'http://steemwhales.com/' + username;
    }
  }, {
    title: 'SteemReports <small style="padding-left: 5px;">Top Voters</small>',
    href: function(username) { 
      return 'http://www.steemreports.com/top-voters/@' + username;
    }
  }];


  var createMenuLinks = function(username) {
    return externalLinks.map(function(link){
      return '<li>\
        <a href="' + link.href(username) + '" target="_blank" rel="noopener">' + link.title + '</a>\
      </li>';
    }).join('');
  };

  var createMenu = function(menuContainer, username) {
    var isMe = menuContainer.children().length >= 2;
    var menu = $('<li class="' + menuClass + (isMe ? '' : ' not-me') + '">\
      <a class="smi-open-menu" aria-haspopup="true">\
        Links\
        <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg>\
        </span>\
      </a>\
      <div class="dropdown-pane">\
        <span>@' + username + ':</span>\
        <ul class="VerticalMenu menu vertical">' +
          createMenuLinks(username) +
        '</ul>\
      </div>\
    </li>');
    return menu;
  };

  var addExternalLinksMenu = function() {
    var name = window.SteemMoreInfo.Utils.getPageAccountName();
    if(!name){
      return;
    }
    console.log('Adding external links menu: ' + name);

    window.SteemMoreInfo.Utils.getUserTopMenusForAccountName(name, function(menus){
      var menu = menus.eq(1); // second menu
      var el = menu.find('li.' + menuClass);
      if(el.length){
        el.remove();
      }
      el = createMenu(menu, name);
      el.find('a.smi-open-menu').on('click', function(e) {
        e.preventDefault();
        el.find('.dropdown-pane').addClass('is-open');
      });
      menu.prepend(el);
    });
  };

  window.SteemMoreInfo.Events.addEventListener(window, 'page-account-name', function() {
    addExternalLinksMenu();
  });

  addExternalLinksMenu();

  $('body').on('click', function(e) {
    var t = $(e.target);
    if(!t.closest('.' + menuClass).length){
      $('.' + menuClass + ' .dropdown-pane').removeClass('is-open');
    }
  });

})();
