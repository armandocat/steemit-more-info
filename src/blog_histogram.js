
(function(){

  var defaultBarBackgroundColor = '#1a5099';
  var defaultBarBorderColor = '#133c73';
  var resteemBarBackgroundColor = '#008000';
  var resteemBarBorderColor = '#006100';
  var selectedBarBackgroundColor = 'red';
  var selectedBarBorderColor = 'red';

  //deprecated
  if(window.localStorage && window.localStorage.SteemMoreInfoPostsHistogram){
    window.SteemMoreInfo.Utils.setSettingsValue('PostsHistogram', window.localStorage.SteemMoreInfoPostsHistogram);
    delete window.localStorage.SteemMoreInfoPostsHistogram;
  }

  if(!$('html').hasClass('smi-mobile') || $('html').hasClass('smi-mobile-tablet')){
    
    window.SteemMoreInfo.Utils.addSettings({
      title: 'Blog posts histogram',
      settings: [{
        title: '',
        key: 'PostsHistogram',
        defaultValue: 'show',
        options: [{
          title: 'Disabled',
          value: 'disabled'
        }, {
          title: 'Alwasy show',
          value: 'show'
        }, {
          title: 'Show on click',
          value: 'hidden'
        }],
        description: 'Show an histogram of the account posts history on the blog page of an user'
      }]
    });

  }



  var getShowHistogram = function() {
    var v = window.SteemMoreInfo.Utils.getSettingsValue('PostsHistogram');
    if(v === 'disabled'){
      return v;
    }
    if($('html').hasClass('smi-mobile') && !$('html').hasClass('smi-mobile-tablet')){
      //always hide by default on mobile, because screen is to small!
      //users can still click the "show" button to show the histogram
      return 'hidden';
    }
    return v;
  };

  var setShowHistogram = function(v) {
    window.SteemMoreInfo.Utils.setSettingsValue('PostsHistogram',v);
  };




  var setupHistogram = function(name, container) {

    window.SteemMoreInfo.Utils.getBlog(name, 0, 500, function(err, data){
      if(err){
        return;
      }
      var min;
      var format = 'DD/MM/YY';
      var dataMap = {};
      data.forEach(function(d) {
        var post = d.comment;
        var posted = d.reblog_on;
        if(posted === '1970-01-01T00:00:00'){
          posted = post.created;
        }
        var date = new Date(posted + 'Z');
        min = min && min <= date ? min : date;
        var m = moment(date);
        var dataString = m.format(format);
        dataMap[dataString] = dataMap[dataString] || [];
        dataMap[dataString].push(post);
      });
      if(!min){        
        return;
      }


      var numberOfPosts = (data.length === 500 ? 'Last ' : '') + data.length + (data.length === 1 ? ' post' : ' posts') + ' by @' + name;
      numberOfPosts += '<span class="smi-posts-histogram-legend">\
        <span style="background-color: ' +  defaultBarBackgroundColor + '; border-color: ' + defaultBarBorderColor + ';"></span>Posts \
        <span style="background-color: ' +  resteemBarBackgroundColor + '; border-color: ' + resteemBarBorderColor + ';"></span>Resteem \
      </span>';
      container.find('.smi-posts-histogram-title').html(numberOfPosts);

      var labels = [];
      var datasets = [{
        // POSTS
        label: 'Posts',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      },{
        // RESTEEMS
        label: 'Resteem',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }];

      var d = moment(min);
      var today = moment().endOf('day');
      while(d <= today){
        var dataString = d.format(format);
        labels.push(dataString);
        datasets[0].backgroundColor.push(defaultBarBackgroundColor);
        datasets[0].borderColor.push(defaultBarBorderColor);
        datasets[1].backgroundColor.push(resteemBarBackgroundColor);
        datasets[1].borderColor.push(resteemBarBorderColor);
        var p = 0;
        var r = 0;
        _.each(dataMap[dataString], function(post){
          var author = post.author;
          var isRepost = name !== author;
          if(isRepost){
            r++;
          }else{
            p++;
          }
        });
        datasets[0].data.push(p);
        datasets[1].data.push(r);
        d.add(1, 'd');
      }
      
      var histogram = container.find('.smi-posts-histogram');
      var ctx = histogram[0].getContext("2d");
      var axis = container.find('.smi-posts-histogram-axis');
      container.append(ctx);

      var chartAreaWrapper = container.find('.chartAreaWrapper');
      var chartAreaWrapper2 = container.find('.chartAreaWrapper2');
      var width = labels.length * 20;
      chartAreaWrapper2.css('min-width', width + 'px');

      chartAreaWrapper.scrollLeft(chartAreaWrapper[0].scrollWidth - chartAreaWrapper[0].clientWidth);

      var loading = container.find('.smi-spinner');
      loading.remove();      

      var chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: datasets
          },
          options: {
              maintainAspectRatio: false,
              scales: {
                  xAxes: [{
                      stacked: true,
                  }],
                  yAxes: [{
                      stacked: true,
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              },
              tooltips: {
                  mode: 'index',
                  intersect: false
              },
              responsive: true,
              legend: {
                display: false
              },
              animation: {                  
                onComplete: function(animation) {
                  var sourceCanvas = chart.chart.canvas;
                  var copyWidth = chart.scales['y-axis-0'].width + chart.scales['y-axis-0'].left + 2;
                  var copyHeight = chart.scales['y-axis-0'].height + chart.scales['y-axis-0'].top + 5;
                  var targetCtx = axis[0].getContext("2d");
                  targetCtx.canvas.width = copyWidth;
                  targetCtx.canvas.height = copyHeight;
                  targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                }
              }
          }
      });
    
      ctx.canvas.onclick = function(evt) {
        var item = chart.getElementAtEvent(evt)[0];

        if (item) {
          var label = item._model.label;
          var date = moment(label, format);
          var index = item._index;
          openPostsListPerDate(name, date, dataMap[label], container);

          if(selectedBarBackgroundColor){
            chart.data.datasets.forEach(function(ds) {
              ds.backgroundColor[index] = selectedBarBackgroundColor;
            });
          }
          if(selectedBarBorderColor){
            chart.data.datasets.forEach(function(ds) {
              ds.borderColor[index] = selectedBarBorderColor;
            });
          }

          chart.update();
        }
      };

      histogram.data('chart', chart);

    });

  }; // end setupHistogram



  var showOrHideHistogram = function(name, container, show) {
    container.find('.smi-posts-histogram-title').css('visibility', show ? 'visible' : 'hidden');
    container.find('.chartWrapper')[show ? 'show' : 'hide']();
    container.find('.smi-spinner')[show ? 'show' : 'hide']();
    container.find('.smi-show-posts-histogram').css('visibility', !show ? 'visible' : 'hidden');

    if(show && !container.hasClass('smi-posts-histogram-setup-done')){
      setupHistogram(name, container);
      container.addClass('smi-posts-histogram-setup-done');
    }
  };


  var createHistogram = function(name) {

    var showHistogram = getShowHistogram();

    var container = $('<div class="smi-posts-histogram-container">\
      <div class="smi-posts-settings-bar">\
        <a class="smi-show-posts-histogram" href="#">Show posts histogram</a>\
        <div class="smi-posts-show-settings">\
          <label>On load: </label>\
          <select class="smi-posts-show-select">\
            <option value="show" ' + (showHistogram === 'show' ? ' selected' : '') + '>Show</option>\
            <option value="hidden" ' + (showHistogram === 'hidden' ? ' selected' : '') + '>Hidden</option>\
          </select>\
        </div>\
      </div>\
      <h6 class="smi-posts-histogram-title">Posts by @' + name + '</h6>\
      <div class="chartWrapper">\
        <div class="chartAreaWrapper">\
          <div class="chartAreaWrapper2">\
            <canvas class="smi-posts-histogram"></canvas>\
          </div>\
        </div>\
        <canvas class="smi-posts-histogram-axis" width="0"></canvas>\
      </div>\
    </div>');

    var loading = $(window.SteemMoreInfo.Utils.getLoadingHtml({
      center: true
    }));
    container.append(loading);

    var showSelect = container.find('.smi-posts-show-select');
    showSelect.on('change', function() {
      var v = showSelect.val();
      setShowHistogram(v);
      showOrHideHistogram(name, container, v === 'show');
    });
    container.find('.smi-show-posts-histogram').on('click', function(e) {
      e.preventDefault();
      showOrHideHistogram(name, container, true);      
    });
    showOrHideHistogram(name, container, showHistogram === 'show');


    return container;
  };


  var openPostsListPerDate = function(name, date, posts, container) {
    var postsContainer = container.find('.smi-posts-histogram-posts-container');
    closePostsList(postsContainer);
    var dateString = moment(date).format('dddd, MMMM Do YYYY'); // "Sunday, February 14th 2010"
    postsContainer = $('<div class="smi-posts-histogram-posts-container">\
      <div class="smi-posts-histogram-posts-container2">\
        <button class="close-button" type="button"><span aria-hidden="true" class="">×</span></button>\
        <h5>Posts by @' + name + ' on ' + dateString + '</h5>\
        <ul class="smi-posts-histogram-posts-list PostsList__summaries hfeed" itemscope="" itemtype="http://schema.org/blogPosts">\
        </ul>\
      </div>\
    </div>');

    postsContainer.find('.close-button').on('click', function(){
      closePostsList(postsContainer);
    });

    postsList = postsContainer.find('.smi-posts-histogram-posts-list');
    posts.forEach(function(post){
      postsList.append(window.SteemMoreInfo.Utils.createPostSummary(post, name));
    });

    // prevent page scroll if mouse is no top of the list
    if(!$('html').hasClass('smi-mobile')){
      postsList.bind('mousewheel DOMMouseScroll', function (e) {
        var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
            bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
            topOverflow = this.scrollTop <= 0;

        if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
            e.preventDefault();
        }
      });
    }

    container.append(postsContainer);
    $('html').addClass('smi-posts-histogram-posts-list-shown');

    if(!$('html').hasClass('smi-mobile')){
      $('html, body').animate({
          scrollTop: $('.smi-posts-histogram-container').offset().top - 100
      }, 400);
    }
  };

  var closePostsList = function(postsContainer) {
    var histogram = postsContainer.closest('.smi-posts-histogram-container').find('.smi-posts-histogram');
    if(histogram.length){
      var chart = histogram.data('chart');
      if(chart){

        chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map(function(){
          return defaultBarBackgroundColor;
        });
        chart.data.datasets[0].borderColor = chart.data.datasets[0].borderColor.map(function(){
          return defaultBarBorderColor;
        });

        chart.data.datasets[1].backgroundColor = chart.data.datasets[1].backgroundColor.map(function(){
          return resteemBarBackgroundColor;
        });
        chart.data.datasets[1].borderColor = chart.data.datasets[1].borderColor.map(function(){
          return resteemBarBorderColor;
        });

        chart.update();
      }
    }
    postsContainer.remove();
    $('html').removeClass('smi-posts-histogram-posts-list-shown');
  };


  $('body').on('click', function(e) {
    var t = $(e.target);
    $('.DropdownMenu').removeClass('show');
    var a = t.closest('a');
    if(a.length && a.parent().hasClass('DropdownMenu')){
      a.parent().addClass('show');
    }
    if(t.is('.smi-posts-histogram')) {
      return;
    }
    if(t.closest('.smi-posts-histogram-posts-container2').length){
      return;
    }
    if(t.closest('#post_overlay').length){
      return;
    }
    closePostsList($('.smi-posts-histogram-posts-container'));
  });


  var checkHistogram = function(postsList, name) {
    if(getShowHistogram() === 'disabled'){
      return true;
    }

    if(!postsList.length){
      if($('.UserProfile__tab_content .callout').length){
        //no posts for this user..
        return true;
      }
      return false;
    }
    if(postsList.hasClass('smi-posts-histogram-added')){
      if(postsList.data('histogram-account') !== name){
        console.log('posts list has already histogram but of different account');
        postsList.find('.smi-posts-histogram-container').remove();
      }else{
        console.log('posts list has already histogram');
        return true;
      }
    }
    postsList.prepend(createHistogram(name));
    postsList.addClass('smi-posts-histogram-added');
    postsList.data('histogram-account', name); 
    console.log('histogram added');
    return true;
  };

  var blogPageRegexp = /\/@([a-z0-9\-\.]*)$/;

  var checkForBlogPage = function() {
    var match = (window.location.pathname || '').match(blogPageRegexp);
    if(match) {
      var name = match[1];
      var postsList = $('#posts_list');
      var added = checkHistogram(postsList, name);
      if(!added){
        // histogram UI not added, try again later
        setTimeout(checkForBlogPage, 100);
      }
    }
  };

  $(window).on('changestate', function(e) {
    setTimeout(function() {
      checkForBlogPage();
    }, 100);
  });

  checkForBlogPage();

})();
