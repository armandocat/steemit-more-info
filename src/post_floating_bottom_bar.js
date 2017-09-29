
(function(){


  window.SteemMoreInfo.Utils.addSettings({
    title: 'Floating post\'s Voting Bar',
    settings: [{
      title: '',
      key: 'FloatingBar',
      defaultValue: 'large',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Large',
        value: 'large'
      }, {
        title: 'Small',
        value: 'small'
      }],
      description: 'While reading a post, this feature keeps the voting bar alwasy visible on the top of the page so that it is easier to upvote and look at more information about the post'
    }]
  });

  var floatingBarStyle = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('FloatingBar');
    return value;
  };



  var makePostBottomBarFloating = function() {

    var style = floatingBarStyle();
    if(style !== 'large' && style !== 'small'){
      return;
    }

    var tags = $('.TagList__horizontal');
    var postFooter = $('.PostFull__footer');
    var promoteButton = $('.Promote__button');

    if(tags.length && postFooter.length) {

      if(tags.closest('.smi-post-footer-wrapper-2').length){
        return;
      }

      $('#post_overlay').on('scroll', function() {  
        update();
      });

      var footer = $('<div class="smi-post-footer">\
        <div class="smi-post-footer-wrapper-1">\
          <div class="smi-post-footer-wrapper-2">\
          </div>\
        </div>\
      </div>');
      var footerWrapper = footer.find('.smi-post-footer-wrapper-2');

      tags.replaceWith(footer);
      footerWrapper.append(promoteButton);
      footerWrapper.append(tags);
      footerWrapper.append(postFooter);

      if(style === 'small'){
        footerWrapper.addClass('smi-post-footer-small');
      }

      update();

    }

  };

  var update = function() {
    var footer = $('.smi-post-footer');
    var footerWrapper = $('.smi-post-footer-wrapper-2');
    if(footer.length && footerWrapper.length) {
      var h = footerWrapper.height();
      var py = footer.position().top + h;
      var oy = footer.offset().top + h;
      var by = $(document).scrollTop() + $(window).height();
      var isOverlay = $('#post_overlay').length > 0;

      // console.log('H= ' + h);
      // console.log('py= ' + py);
      // console.log('oy= ' + oy);
      // console.log('by= ' + by);

      footer.css('height', h + 'px');

      if(oy > by) {
        if(!footer.hasClass('smi-post-floating-footer')){
          footer.addClass('smi-post-floating-footer');
          if(isOverlay) {
            footerWrapper.addClass('smi-post-floating-footer-on-body').addClass('row');
            $('body').prepend(footerWrapper);
          }
        }
        if(isOverlay) {
          var ol = footer.offset().left;
          footerWrapper.css('left', ol + 'px');
        }
      }else{
        if(footer.hasClass('smi-post-floating-footer')){
          footer.removeClass('smi-post-floating-footer');
          if(isOverlay) {            
            footerWrapper.removeClass('smi-post-floating-footer-on-body').removeClass('row');
            footer.find('.smi-post-footer-wrapper-1').prepend(footerWrapper);
          }
          if(isOverlay) {
            footerWrapper.css('left', 'auto');
          }
        }
      }
    }
  };

  $(window).on('resize', function() {
    update();
  });

  $(document).on('scroll', function() {
    update();
  });

  $('body').attrchange(function(attrName) {
    if(attrName === 'class'){
      if($('body').hasClass('with-post-overlay')) {

        makePostBottomBarFloating();

      }else{

        var footerWrapper = $('.smi-post-footer-wrapper-2');
        if(footerWrapper.length && footerWrapper.parent().is('body')){
          footerWrapper.remove();
        }

      }
    }
  });

  window.SteemMoreInfo.Events.addEventListener(window, 'changestate', function() {
    setTimeout(function() {
      makePostBottomBarFloating();
    }, 100);
  });


  makePostBottomBarFloating();


})();