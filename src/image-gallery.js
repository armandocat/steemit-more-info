
(function () {

  window.SteemMoreInfo.Utils.addSettings({
    title: 'Post\'s image gallery',
    settings: [{
      title: '',
      key: 'PostImageGallery',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'Open an image gallery by clickin on an image in a post'
    }]
  });

  var isPostImageGalleryEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('PostImageGallery');
    return value === 'enabled';
  };

  
  var addImageGallery = function() {
    if(!isPostImageGalleryEnabled()){
      return;
    }

    var post = $('.PostFull__body');

    if(post.length && !post.hasClass('smi-img-gallery')) {

      var mk = post.find('.MarkdownViewer');
      if(!mk.length || !mk.children().length){

        // not loaded yet, try later
        setTimeout(function() {
          addImageGallery();
        }, 100);

        return;
      }

      console.log('POST: ', post);
      post.addClass('smi-img-gallery');

      post.find('img').each(function(){
        var img = $(this);
        var link = img.attr('src');
        if(!link || img.closest('a').length){
          return;
        }
        var a = $('<a class="smi-post-img" data-fancybox="smi-post-images">');
        a.attr('href', link);
        img.replaceWith(a);
        a.append(img);
      });

      var fb = post.find('a.smi-post-img').fancybox({
        loop: true,

        beforeClose: function(instance, current, event){
          if(event && event.stopPropagation){
            event.stopPropagation();
          }
        }

      });

    }
  
  };



  $('body').attrchange(function(attrName) {
    if(attrName === 'class'){
      if($('body').hasClass('with-post-overlay')) {

        addImageGallery();

      }
    }
  });

  window.SteemMoreInfo.Events.addEventListener(window, 'changestate', function() {
    setTimeout(function() {

      addImageGallery();

    }, 100);
  });

  addImageGallery();


})();
