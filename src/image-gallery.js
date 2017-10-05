
(function () {

  
  var addImageGallery = function(post) {

    if(post.length && !post.hasClass('smi-img-gallery')) {
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

      post.find('a.smi-post-img').fancybox({
        loop: true
      });

    }
  
  };


//TODO: TEMP
  setInterval(function(){

    var post = $('.PostFull__body');
    addImageGallery(post);

  },100);



})();
