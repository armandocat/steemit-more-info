
(function(){

  var defaultBarBackgroundColor = '#1a5099';
  var defaultBarBorderColor = '#133c73';
  var resteemBarBackgroundColor = '#008000';
  var resteemBarBorderColor = '#006100';
  var selectedBarBackgroundColor = 'red';
  var selectedBarBorderColor = 'red';

  var getShowHistogram = function() {
    return window.localStorage && window.localStorage.SteemMoreInfoPostsHistogram || 'show';
  };

  var setShowHistogram = function(v) {
    if(window.localStorage){
      window.localStorage.SteemMoreInfoPostsHistogram = v;
    }
  };


  var showOrHideHistogram = function(container, show) {
    container.find('.smi-posts-histogram-title').css('visibility', show ? 'visible' : 'hidden');
    container.find('.chartWrapper')[show ? 'show' : 'hide']();
    container.find('.smi-spinner')[show ? 'show' : 'hide']();
    container.find('.smi-show-posts-histogram').css('visibility', !show ? 'visible' : 'hidden');
  };


  var createHistogram = function(name) {

    var showHistogram = getShowHistogram();

    var container = $('<div class="smi-posts-histogram-container">\
      <div class="smi-posts-settings-bar">\
        <a class="smi-show-posts-histogram" href="#">Show posts histogram</a>\
        <div class="smi-posts-show-settings">\
          <label>On load: </label>\
          <select class="smi-posts-show-select">\
            <option value="show"' + (showHistogram === 'show' ? ' selected' : '') + '>Show</option>\
            <option value="hidden"' + (showHistogram !== 'show' ? ' selected' : '') + '>Hidden</option>\
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
      showOrHideHistogram(container, v === 'show');
    });
    container.find('.smi-show-posts-histogram').on('click', function(e) {
      e.preventDefault();
      showOrHideHistogram(container, true);      
    });
    showOrHideHistogram(container, showHistogram === 'show');


    steem.api.getBlog(name, 0, 500, function(err, data){
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
      postsList.append(createPost(name, post));
    });

    // prevent page scroll if mouse is no top of the list
    postsList.bind('mousewheel DOMMouseScroll', function (e) {
      var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
          bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
          topOverflow = this.scrollTop <= 0;

      if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
          e.preventDefault();
      }
    });

    container.append(postsContainer);

    $('html, body').animate({
        scrollTop: $('.smi-posts-histogram-container').offset().top - 100
    }, 400);
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
  };


  var createPost = function(name, post) {
    var title = post.title;
    var author = post.author;
    var category = post.category;
    var descr = window.SteemMoreInfo.Sanitize.postBodyShort(post.body);
    var permlink = post.permlink;
    var url = `/@${author}/${permlink}`;
    if (category){
      url = `/${category}${url}`;
    }

    var imgUrl;
    try{
      var json_metadata = JSON.parse(post.json_metadata);
      if(json_metadata && json_metadata.image){
        imgUrl = json_metadata.image[0] || null;
      }
    }catch(err){      
    }

    var date = moment(post.created + 'Z');
    var dateString = date.format('DD/MM/YYYY hh:mm A');
    var dateString2 = date.fromNow();

    var votes = post.net_votes;
    var comments = post.children;

    absRshare = parseFloat(post.abs_rshares)
    var rshare = post.total_vote_weight < 0 ? -absRshare : absRshare;
    var dollars;
    var dollarsAuthor;
    var dollarsCurators;

    var last_payout = post.last_payout;
    var cashout_time, payoutDateString, payoutDateString2;
    if(last_payout === '1970-01-01T00:00:00'){
      var cashout_time = post.cashout_time;
      cashout_time = moment(cashout_time + 'Z');
      payoutDateString = cashout_time.format('DD/MM/YYYY hh:mm A');
      payoutDateString2 = cashout_time.fromNow();

      var dollars = window.SteemMoreInfo.Utils.getVotingDollarsPerShares(rshare);
      if(typeof dollars === 'undefined'){
        dollars = '?.??';
      }else{
        dollars = '' + dollars.toFixed(2);
      }
    }else{
      dollarsAuthor = parseFloat(post.total_payout_value.replace(' SBD', ''));
      dollarsCurators = parseFloat(post.curator_payout_value.replace(' SBD', ''));
      dollars = dollarsAuthor + dollarsCurators;
      dollars = '' + dollars.toFixed(2);
      dollarsCurators = '' + dollarsCurators.toFixed(2);
      dollarsAuthor = '' + dollarsAuthor.toFixed(2);
    }

    var dsplit = dollars.split('.');
    var dollarsInteger = dsplit[0];
    var dollarsDecimal = dsplit[1];

    var isRepost = name !== author;

    var vcard = '<span class="vcard">\
      <a href="' + url + '">\
        <span title="' + dateString + '" class="updated"><span>' + dateString2 + '</span></span>\
      </a>\
      by\
      <span class="author" itemprop="author" itemscope="" itemtype="http://schema.org/Person">\
        <strong>\
          <a href="/@' + author + '">' + author + '</a>\
        </strong>' +
        // don't know the reputation :(
        // '<span class="Reputation" title="Reputation">' + reputation + '</span>' +
      '</span>\
      in\
      <strong>\
        <a href="/trending/' + category + '">' + category + '</a>\
      </strong>\
    </span>';

    var el = $('<li>\
      <article class="PostSummary hentry with-image " itemscope="" itemtype="http://schema.org/blogPost">' +
        (isRepost ? '<div class="PostSummary__reblogged_by">\
          <span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg>\
          </span>\
          Resteemed\
        </div>' : '') +
        '<div class="PostSummary__header show-for-small-only">\
          <h3 class="entry-title">\
            <a href="' + url + '">' + title + '</a>\
          </h3>\
        </div>\
        <div class="PostSummary__time_author_category_small show-for-small-only">\
          ' + vcard + '\
        </div>\
        <span class="PostSummary__image" style="' + (imgUrl ? 'background-image: url(\'https://steemitimages.com/256x512/' + encodeURI(imgUrl) + '\');' : '') + '"></span>\
        <div class="PostSummary__content">\
          <div class="PostSummary__header show-for-medium">\
            <h3 class="entry-title">\
              <a href="' + url + '">' + title + '</a>\
            </h3>\
          </div>\
          <div class="PostSummary__body entry-content">\
            <a href="' + url + '">' + descr + '</a>\
          </div>\
          <div class="PostSummary__footer">\
            <span class="Voting">\
              <span class="Voting__inner">' +
                // can't vote.. so can't put a voting button here :( 
                // '<span class="Voting__button Voting__button-up Voting__button--upvoted">\
                //   <a href="#" title="Remove Vote">\
                //     <span class="Icon chevron-up-circle" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                //       <svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg>\
                //     </span>\
                //   </a>\
                // </span>' + 
                '<div class="DropdownMenu">\
                  <a href="#">\
                    <span>\
                      <span class="FormattedAsset ">\
                        <span class="prefix">$</span><span class="integer">' + dollarsInteger + '</span><span class="decimal">.' + dollarsDecimal + '</span>\
                      </span>\
                      <span class="Icon dropdown-arrow" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"><g><polygon points="128,90 256,218 384,90"></polygon></g></svg>\
                      </span>\
                    </span>\
                  </a>' +
                  (cashout_time ?
                    '<ul class="VerticalMenu menu vertical VerticalMenu">\
                      <li>\
                        <span>\
                          Potential Payout $' + dollars + '\
                        </span>\
                      </li>\
                      <li>\
                        <span>\
                          <span title="' + payoutDateString + '">\
                            <span>' + payoutDateString2 + '</span>\
                          </span>\
                        </span>\
                      </li>\
                    </ul>'
                  :
                    '<ul class="VerticalMenu menu vertical VerticalMenu">\
                      <li>\
                        <span>\
                          Past Payouts $' + dollars + '\
                        </span>\
                      </li>\
                      <li>\
                        <span>\
                          - Author: $' + dollarsAuthor + '\
                        </span>\
                      </li>\
                      <li>\
                        <span>\
                          - Curators: $' + dollarsCurators + '\
                        </span>\
                      </li>\
                    </ul>'
                  ) +
                '</div>\
              </span>\
            </span>\
            <span class="VotesAndComments">\
              <span class="VotesAndComments__votes" title="' + votes + (votes === 1 ? ' vote' : ' votes') + '">\
                <span class="Icon chevron-up-circle Icon_1x" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                  <svg enable-background="new 0 0 33 33" version="1.1" viewBox="0 0 33 33" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Chevron_Up_Circle"><circle cx="16" cy="16" r="15" stroke="#121313" fill="none"></circle><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#121313"></path></g></svg>\
                </span>\
                &nbsp;' + votes + '\
              </span>\
              <span class="VotesAndComments__comments">\
                <a title="' + comments + (comments === 1 ? ' response' : ' responses') + '. Click to respond." href="' + url + '#comments">\
                  <span class="Icon chatboxes" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><path d="M294.1,365.5c-2.6-1.8-7.2-4.5-17.5-4.5H160.5c-34.7,0-64.5-26.1-64.5-59.2V201h-1.8C67.9,201,48,221.5,48,246.5v128.9 c0,25,21.4,40.6,47.7,40.6H112v48l53.1-45c1.9-1.4,5.3-3,13.2-3h89.8c23,0,47.4-11.4,51.9-32L294.1,365.5z"></path><path d="M401,48H183.7C149,48,128,74.8,128,107.8v69.7V276c0,33.1,28,60,62.7,60h101.1c10.4,0,15,2.3,17.5,4.2L384,400v-64h17 c34.8,0,63-26.9,63-59.9V107.8C464,74.8,435.8,48,401,48z"></path></g></svg>\
                  </span>\
                  &nbsp;' + comments + '\
                </a>\
              </span>\
            </span>\
            <span class="PostSummary__time_author_category">' +
              (isRepost ? '<span class="Reblog__button Reblog__button-active">\
                <a href="#" title="Resteem">\
                  <span class="Icon reblog" style="display: inline-block; width: 1.12rem; height: 1.12rem;">\
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><path d="M448,192l-128,96v-64H128v128h248c4.4,0,8,3.6,8,8v48c0,4.4-3.6,8-8,8H72c-4.4,0-8-3.6-8-8V168c0-4.4,3.6-8,8-8h248V96 L448,192z"></path></svg>\
                  </span>\
                </a>\
              </span>' : '') + 
              '<span class="show-for-medium">\
                ' + vcard + '\
              </span>\
            </span>\
          </div>\
        </div>\
      </article>\
    </li>');

    var openPost = function(url) {
      var PostList = window.SteemMoreInfo.Utils.findReact($('#posts_list')[0]);
      PostList.onPostClick(author + '/' + permlink, url);
    };
  
    el.find('a').on('click', function(e){
      if(e.ctrlKey || e.metaKey) {
        return;
      }
      e.preventDefault();
      var t = $(e.currentTarget);
      var href = t.attr('href');
      if(href === '#'){
        return;
      }
      openPost(href);
    });
    el.find('.PostSummary__image').on('click', function(e){
      e.preventDefault();
      openPost(url);
    });

    return el;
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
    if(!postsList.length){
      if($('.UserProfile__tab_content .callout').length){
        //no posts for this user..
        return true;
      }
      return false;
    }
    if(postsList.hasClass('smi-posts-histogram-added')){
      console.log('posts list has already histogram');
      return true;
    }
    postsList.prepend(createHistogram(name));
    postsList.addClass('smi-posts-histogram-added');    
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
