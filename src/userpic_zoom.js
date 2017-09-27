
(function(){
  
  var userpic;

  var checkSize = function(zoom) {
    if(!zoom.parent().length){
      return;
    }
    var pLeft = zoom.parent().offset().left;
    var left = pLeft + 30;
    var width = zoom.width();
    var wWidth = $(window).width();
    var cssLeft = 'auto';
    if(width >= wWidth - 60){
      cssLeft = '0px';
    }else if(left + width >= wWidth) {
      left = wWidth - width - 30;
    }
    zoom.css('left', cssLeft);
    zoom.css('margin-left', (left-pLeft) + 'px');
  };


  $('body')
    .on('mouseenter', '.Userpic', function() {
      var $this = $(this);
      var backgroundImage = $this.css('background-image');
      if(!backgroundImage || backgroundImage.startsWith('url("/assets/') || backgroundImage.startsWith('url("https://steemit.com/assets/')){
        return;
      }
      if($this.closest('.Header__userpic').length){
        return;
      }
      userpic = $this;
      setTimeout(function() {
        if(userpic === $this && !userpic.find('.smi-userpic-zoom').length){

          var bigImg = backgroundImage.replace(/^url\("https:\/\/steemitimages\.com\/[0-9]*x[0-9]*\/(.*)"\)$/, function(a, b){
            return 'https://steemitimages.com/512x512/' + b;
          });
          console.log('ìAAAAA', backgroundImage, bigImg);

          var zoom = $('<div class="smi-userpic-zoom">\
            <img class="smi-userpic-zoom-img" src="' + bigImg + '"></img>\
          </div>');

          var loading = $(window.SteemMoreInfo.Utils.getLoadingHtml({
            center: true
          }));

          zoom.append(loading);          

          userpic.append(zoom);

          zoom.find('img').one('load', function() {
            loading.remove();
            zoom.removeClass('smi-userpic-zoom-loading');
            checkSize(zoom);
          }).each(function() {
            if(this.complete){
              loading.remove();
              zoom.removeClass('smi-userpic-zoom-loading');
              checkSize(zoom);
            }else{
              zoom.addClass('smi-userpic-zoom-loading');
              checkSize(zoom);
            }
          });

        }
      }, 500);
    })
    .on('mouseleave', '.Userpic', function() {
      var $this = $(this);
      if(userpic && $this.is(userpic)){
        userpic.find('.smi-userpic-zoom').remove();
        userpic = null;
      }
    });

})();
