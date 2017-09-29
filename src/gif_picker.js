
(function () {
  

  window.SteemMoreInfo.Utils.addSettings({
    title: 'GIF picker',
    settings: [{
      title: '',
      key: 'GifPicker',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'Tool to easily add GIF from <a href="https://giphy.com/" target="_blank">giphy.com</a> to posts and comments <img src="https://i.imgsafe.org/e6/e67c07abe2.png">'
    }]
  });

  var isGifPickerEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('GifPicker');
    return value === 'enabled';
  };




  var addGifToTextArea = function(textarea, gif) {
    var t = textarea[0];
    var text = '![](' + gif + ')';
    if (document.selection) {
      // IE
      t.focus();
      var sel = document.selection.createRange();
      sel.text = text;
    } else if (t.selectionStart || t.selectionStart === 0) {
      // Others
      var startPos = t.selectionStart;
      var endPos = t.selectionEnd;
      t.value = t.value.substring(0, startPos) +
        text +
        t.value.substring(endPos, t.value.length);
      t.selectionStart = startPos + text.length;
      t.selectionEnd = startPos + text.length;
    } else {
      t.value += text;      
    }

    var event = new Event('input', { bubbles: true });
    t.dispatchEvent(event);

    textarea.focus();
  };



  var SMI_GIPHY_API_KEY = 'KyibK7KTJAHvimb3XGqNXSNrhnHdwKv9';

  var giphy = {
    key: "?api_key=" + SMI_GIPHY_API_KEY,
    baseUrl: "https://api.giphy.com/v1/gifs",
    search: "/search",
    trending: "/trending",
    random: "/random"
  };


  var createGifPicker = function(textarea) {
    var pickerContainer = $('<div class="smi-gif-picker-container">\
      <div class="smi-gif-picker-container2">\
        <button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button>\
        <form class="row">\
          <div class="small-8 medium-9 large-10 columns">\
            <label>\
              <p>Search: <a class="button trending">Trending</a></p>\
              <input class="query" type="text" placeholder="Find a Giphy" name="q">\
            </label>\
          </div>\
          <div class="small-4 medium-3 large-2 columns">\
            <label>\
              <p>Rating:</p>\
              <select class="rating" name="rating">\
                <option value="" selected>all</option>\
                <option value="y">y</option>\
                <option value="g">g</option>\
                <option value="pg">pg</option>\
                <option value="pg-13">pg-13</option>\
                <option value="r">r</option>\
              </select>\
            </label>\
          </div>\
        </form>\
        <section class="res-container">\
          <p class="title"></p>\
          <div class="res-container-wrapper">\
            <section class="results justified-gallery"></section>\
          </div>\
        </section>\
      </div>\
    </div>');


    function ajaxQuery(ajax){
      window.SMI_AJAX({
        url: ajax.url,
        type: ajax.method,
        error: function(err){
          console.log(err);
        },
        success: function(data) {
          populateResults(data.data);
        }
      });
    };

    function populateResults(data){
      var resultsEl = pickerContainer.find('.results');
      resultsEl.empty();

      for(var i in data){
        var img = data[i].images.downsized_still;
        var gif = data[i].images.downsized;
        var alt =  data[i].rating.toUpperCase() + ' - ' + data[i].slug.replace('-'+data[i].id,'').replace(/\-/g, ' ');

        // resultsEl.append('<a class="still"><img src="'+img.url+'" alt="'+ alt +'" data-state="still" data-still="'+ img.url +'" data-gif="'+ gif.url +'"></a>');
        resultsEl.append('<a class=""><img src="'+gif.url+'" alt="'+ alt +'"></a>');
        
      }
      resultsEl.justifiedGallery({
        rowHeight : 150,
        lastRow : 'nojustify',
        margins : 13,
        randomize: true,
        cssAnimation: true
      });
      // toggleGif();

      pickerContainer.find('.results a').click(function(e){
        e.preventDefault();
        e.stopPropagation();
        
        var that = $(this).children('img');
        var gif = that.attr('src');

        addGifToTextArea(textarea, gif);
        closeGifPicker(textarea);
      });
    };

    // function toggleGif(){
    //   pickerContainer.find('.results a').click(function(e){
    //     e.preventDefault();
    //     e.stopPropagation();
        
    //     var that = $(this).children('img');
    //     var state = that.attr('data-state');
    //     $(this).toggleClass('still');
        
    //     if ( state == 'still'){
    //         that.attr('src', that.data('gif'));
    //         that.attr('data-state', 'animate');
    //     }else{
    //         that.attr('src', that.data('still'));
    //         that.attr('data-state', 'still');
    //     }
    //   });
    // };


    var timeout;

    pickerContainer.find('.query').keyup(function(e){
      e.preventDefault();
      if(timeout){
        clearTimeout(timeout);
        timeout = null;
      }
      
      timeout = setTimeout(function(){
        var params;
        if(pickerContainer.find('.rating').val() === ''){
          params = pickerContainer.find('form input').serialize();
        }else{
          params = pickerContainer.find('form').serialize();
        }
        
        var ajax = {
          url: giphy.baseUrl + giphy.search + giphy.key + '&' + params,
          method: "GET"
        };        
        pickerContainer.find('.title').html('Results for: <span>'+pickerContainer.find('.query').val()+'</span>');
        ajaxQuery(ajax);
      }, 500);
    });

    pickerContainer.find('.trending').click(function(e){
      e.preventDefault();

      if(timeout){
        clearTimeout(timeout);
        timeout = null;
      }
      
      var selection = "trending";

      var ajax = {
        url: giphy.baseUrl + giphy[selection] + giphy.key,
        method: "GET"
      }

      pickerContainer.find('.title').text(selection);
      ajaxQuery(ajax);
    });

    pickerContainer.find('form').submit(function(e){
      e.preventDefault();
    });

    pickerContainer.find('.close-button').on('click', function() {
      closeGifPicker(textarea);
    });


    return pickerContainer;
  };



  var setupGifPickerIfNeeded = function(textarea) {
    if(!isGifPickerEnabled()){
      return;
    }

    if(textarea.hasClass('smi-gif-picker-textarea')){
      return;
    }
    textarea.addClass('smi-gif-picker-textarea');
    var pickerButtonContainer = $('<div class="smi-gif-picker-button-container">\
      <button class="button">GIF</button>\
    </div>');
    textarea.after(pickerButtonContainer);

    var button = pickerButtonContainer.find('button');
    button.on('click', function() {
      toggleGifPicker(textarea);
    });

    var pickerContainer = createGifPicker(textarea);
    textarea.after(pickerContainer);
  };


  var toggleGifPicker = function(textarea) {
    if(textarea.parent().hasClass('smi-gif-picker-opened')){
      closeGifPicker(textarea);
    }else{
      openGifPicker(textarea);
    }
  };

  var openGifPicker = function(textarea) {
    $('.ReplyEditor__body textarea').each(function() {
      var other = $(this);
      if(!other.is(textarea)){
        closeGifPicker(other);
      }
    });
    textarea.parent().addClass('smi-gif-picker-opened');

    var container = textarea.closest('body, #post_overlay');
    var pickerContainer = textarea.parent().find('.smi-gif-picker-container2');
    var s = textarea.offset().top + textarea.height() - container.offset().top + container.scrollTop() + pickerContainer.height() - $(window).height() + 60;

    if(container.is('body')){
      container = $('html, body');
    }
    container.animate({
        scrollTop: s
    }, 400);
  };

  var closeGifPicker = function(textarea) {
    textarea.parent().removeClass('smi-gif-picker-opened');
  };



  $('body').on('click', function(e) {
    var t = $(e.target);
    if(t.closest('.smi-gif-picker-container2').length){
      return;
    }
    if(t.closest('.smi-gif-picker-button-container').length){
      return;
    }
    closeGifPicker($('.ReplyEditor__body textarea')); // close all gif picker
  });



  //TODO: temp

  setInterval(function(){
    $('.ReplyEditor__body textarea').each(function() {
      var textarea = $(this);
      setupGifPickerIfNeeded(textarea);
    });
  },100);
  

})();
