
(function(){

  window.SteemMoreInfo.Utils.addSettings({
    title: 'Post editor preview sync',
    settings: [{
      title: '',
      key: 'PostEditorAdvanced',
      defaultValue: 'enabled',
      options: [{
        title: 'Disabled',
        value: 'disabled'
      }, {
        title: 'Enabled',
        value: 'enabled'
      }],
      description: 'When you create a post, the preview and the editor are side by side and scroll togheter to show you the markup code and the preview of the same area (works only for screen wider than 900px)'
    }]
  });

  var advancedEditorEnabled = function() {
    var value = window.SteemMoreInfo.Utils.getSettingsValue('PostEditorAdvanced');
    return value;
  };




  var remarkable = new Remarkable({
      html: true, // remarkable renders first then sanitize runs...
      breaks: true,
      linkify: false, // linkify is done locally
      typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
      quotes: '“”‘’'
  });

  for(var ruleName in remarkable.renderer.rules) {
    (function(ruleName){
      var originalRule = remarkable.renderer.rules[ruleName];
      remarkable.renderer.rules[ruleName] = function(tokens, idx) {
        var r = originalRule.apply(this, arguments);
        var m = r.match(/^\<([A-Za-z0-9]+)([^A-Za-z0-9][^\>]*)?\>([^]*)$/);
        if(m && tokens[idx].lines && tokens[idx].level === 0){
          var line = tokens[idx].lines[0];
          r = '<' + m[1] + ' data-with-line="true" data-line="' + line + '" ' + (m[2] || '') + '>' + (m[3] || '');
        }
        return r;
      };
    })(ruleName);
  }



  // HtmlReady
  // var HtmlReady = window.HtmlReady;
  var HtmlReady = function(t) {
    return {
      html: t
    };
  };

  // sanitize
  var sanitize = sanitizeHtml;


  // FROM: https://raw.githubusercontent.com/steemit/condenser/master/src/app/utils/SanitizeConfig.js

  const iframeWhitelist = [
      {
          re: /^(https?:)?\/\/player.vimeo.com\/video\/.*/i,
          fn: function(src) {
              // <iframe src="https://player.vimeo.com/video/179213493" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
              if(!src) return null
              const m = src.match(/https:\/\/player\.vimeo\.com\/video\/([0-9]+)/)
              if(!m || m.length !== 2) return null
              return 'https://player.vimeo.com/video/' + m[1]
          }
      },
      { re: /^(https?:)?\/\/www.youtube.com\/embed\/.*/i,
        fn: function (src) {
          return src.replace(/\?.+$/, ''); // strip query string (yt: autoplay=1,controls=0,showinfo=0, etc)
        }
      },
      {
          re: /^https:\/\/w.soundcloud.com\/player\/.*/i,
          fn: function (src) {
              if(!src) return null
              // <iframe width="100%" height="450" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/257659076&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"></iframe>
              const m = src.match(/url=(.+?)&/)
              if(!m || m.length !== 2) return null
              return 'https://w.soundcloud.com/player/?url=' + m[1] +
                  '&auto_play=false&hide_related=false&show_comments=true' +
                  '&show_user=true&show_reposts=false&visual=true'
          }
      }
  ];
  const noImageText = '(Image not shown due to low ratings)'
  const allowedTags = `
      div, iframe, del,
      a, p, b, i, q, br, ul, li, ol, img, h1, h2, h3, h4, h5, h6, hr,
      blockquote, pre, code, em, strong, center, table, thead, tbody, tr, th, td,
      strike, sup, sub
  `.trim().split(/,\s*/)

  // Medium insert plugin uses: div, figure, figcaption, iframe
  const sanitizeConfig = function({large = true, highQualityPost = true, noImage = false, sanitizeErrors = []}){
    return ({
      allowedTags,
          // figure, figcaption,

      // SEE https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
      allowedAttributes: {
          // "src" MUST pass a whitelist (below)
          iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen',
              'webkitallowfullscreen', 'mozallowfullscreen'],

          // class attribute is strictly whitelisted (below)
          div: ['class'],

          // style is subject to attack, filtering more below
          td: ['style'],
          img: ['src', 'alt'],
          a: ['href', 'rel'],


          '*': [ 'data-with-line', 'data-line' ]
      },
      transformTags: {
          iframe: function (tagName, attribs) {
              const srcAtty = attribs.src;
              for(const item of iframeWhitelist)
                  if(item.re.test(srcAtty)) {
                      const src = typeof item.fn === 'function' ? item.fn(srcAtty, item.re) : srcAtty
                      if(!src) break
                      return {
                          tagName: 'iframe',
                          attribs: {
                              frameborder: '0',
                              allowfullscreen: 'allowfullscreen',
                              webkitallowfullscreen: 'webkitallowfullscreen', // deprecated but required for vimeo : https://vimeo.com/forums/help/topic:278181
                              mozallowfullscreen: 'mozallowfullscreen',       // deprecated but required for vimeo
                              src,
                              width:  large ? '640' : '480',
                              height: large ? '360' : '270',
                          },
                      }
                  }
              console.log('Blocked, did not match iframe "src" white list urls:', tagName, attribs)
              sanitizeErrors.push('Invalid iframe URL: ' + srcAtty)
              return {tagName: 'div', text: `(Unsupported ${srcAtty})`}
          },
          img: function (tagName, attribs) {
              if(noImage) return {tagName: 'div', text: noImageText}
              //See https://github.com/punkave/sanitize-html/issues/117
              let {src, alt} = attribs
              if(!/^(https?:)?\/\//i.test(src)) {
                  console.log('Blocked, image tag src does not appear to be a url', tagName, attribs)
                  sanitizeErrors.push('An image in this post did not save properly.')
                  return {tagName: 'img', attribs: {src: 'brokenimg.jpg'}}
              }

              // replace http:// with // to force https when needed
              src = src.replace(/^http:\/\//i, '//')
              let atts = {src}
              if(alt && alt !== '') atts.alt = alt
              return {tagName, attribs: atts}
          },
          div: function(tagName, attribs) {
              const attys = {}
              const classWhitelist = ['pull-right', 'pull-left', 'text-justify', 'text-rtl', 'text-center', 'text-right', 'videoWrapper']
              const validClass = classWhitelist.find(function(e) { return attribs.class == e })
              if(validClass)
                  attys.class = validClass
              return {
                  tagName,
                  attribs: attys
              }
          },
          td: function(tagName, attribs) {
              const attys = {}
              if(attribs.style === 'text-align:right')
                  attys.style = 'text-align:right'
              return {
                  tagName,
                  attribs: attys
              }
          },
          a: function(tagName, attribs) {
              let {href} = attribs
              if(!href) href = '#'
              href = href.trim()
              const attys = {href}
              // If it's not a (relative or absolute) steemit URL...
              if (!href.match(/^(\/(?!\/)|https:\/\/steemit.com)/)) {
                  // attys.target = '_blank' // pending iframe impl https://mathiasbynens.github.io/rel-noopener/
                  attys.rel = highQualityPost ? 'noopener' : 'nofollow noopener'
              }
              return {
                  tagName,
                  attribs: attys
              }
          },
        }
    });
  }




  var renderSectionsWithLines = function() {
    const {noImage, hideImages} = this.props;
    const {allowNoImage} = this.state
    let {text} = this.props
    if (!text) text = '' // text can be empty, still view the link meta data
    const {large, /*formId, canEdit, jsonMetadata,*/ highQualityPost} = this.props

    let html = false;
    // See also ReplyEditor isHtmlTest
    const m = text.match(/^<html>([\S\s]*)<\/html>$/);
    if (m && m.length === 2) {
        html = true;
        text = m[1];
    } else {
        // See also ReplyEditor isHtmlTest
        html = /^<p>[\S\s]*<\/p>/.test(text)
    }

    // Strip out HTML comments. "JS-DOS" bug.
    text = text.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)')

    let renderedText = html ? text : remarkable.render(text)

    // Embed videos, link mentions and hashtags, etc...
    if(renderedText) renderedText = HtmlReady(renderedText, {hideImages}).html

    // Complete removal of javascript and other dangerous tags..
    // The must remain as close as possible to dangerouslySetInnerHTML
    let cleanText = renderedText
    if (this.props.allowDangerousHTML === true) {
        console.log('WARN\tMarkdownViewer rendering unsanitized content')
    } else {
        cleanText = sanitize(renderedText, sanitizeConfig({large, highQualityPost, noImage: noImage && allowNoImage}))
    }

    if(/<\s*script/ig.test(cleanText)) {
        // Not meant to be complete checking, just a secondary trap and red flag (code can change)
        console.error('Refusing to render script tag in post text', cleanText)
        return;
    }

    const noImageActive = cleanText.indexOf(noImageText) !== -1

    // In addition to inserting the youtube compoennt, this allows react to compare separately preventing excessive re-rendering.
    let idx = 0
    const sections = []

    // HtmlReady inserts ~~~ embed:${id} type ~~~
    for(let section of cleanText.split('~~~ embed:')) {
        const match = section.match(/^([A-Za-z0-9\_\-]+) (youtube|vimeo) ~~~/)
        if(match && match.length >= 3) {
            const id = match[1]
            const type = match[2]
            const w = large ? 640 : 480,
                  h = large ? 360 : 270
            if(type === 'youtube') {
                sections.push(
                  `<div\
                      width=${w}\
                      height=${h}\
                      youTubeId=${id}\
                      frameBorder="0"\
                      allowFullScreen="true" >\
                  </div>`
                )
            } else if(type === 'vimeo') {
                const url = `https://player.vimeo.com/video/${id}`
                sections.push(
                  `<div className="videoWrapper">\
                    <iframe\
                        key=${idx++}\
                        src=${url}\
                        width=${w}\
                        height=${h}\
                        frameBorder="0"\
                        webkitallowfullscreen\
                        mozallowfullscreen\
                        allowFullScreen />\
                  </div>`
                )
            } else {
                console.error('MarkdownViewer unknown embed type', type);
            }
            section = section.substring(`${id} ${type} ~~~`.length)
            if(section === '') continue
        }
        sections.push(`<div key=${idx++}>` + section + `</div>`);
    }

    return sections;
  };



  var replaceRenderFunction = function(markdownViewer) {
    var originalRender = markdownViewer.render;
    markdownViewer.originalRender = originalRender;
    markdownViewer.render = function(){
      var sections;
      try{
        sections = renderSectionsWithLines.apply(this, arguments);
      }catch(err){
        console.log(err);
      }
      var result = originalRender.apply(this, arguments);
      if(!sections){
        return result;
      }
      var sectionsEls = result.props.children[0];
      for(var i = 0; i < sectionsEls.length && i < sections.length; i++){
        sectionsEls[i].props.dangerouslySetInnerHTML.__html = sections[i];
      }
      return result;
    };

  };


  var scrollMap;


  var makeMarkdownEditorBeautiful = function(submitPost) {
    if(advancedEditorEnabled() === 'disabled'){
      return;
    }

    var markdownViewerEl = submitPost.find('.MarkdownViewer');
    var markdownViewerReact = markdownViewerEl.length && window.SteemMoreInfo.Utils.findReact(markdownViewerEl[0]);
    var textarea = submitPost.find('.ReplyEditor__body textarea');
    if(!markdownViewerReact || !textarea.length){
      return;
    }

    if(markdownViewerReact.originalRender){
      return;
    }

    replaceRenderFunction(markdownViewerReact);
    submitPost.addClass('smi-advanced-editor');

    scrollMap = null;
    
    // default value
    var textareaLineHeight = 1.15;


    // Build offsets for each line (lines can be wrapped)
    // That's a bit dirty to process each line everytime, but ok for demo.
    // Optimizations are required only for big texts.
    var buildScrollMap = function() {
      var i, offset, nonEmptyList, pos, a, b, lineHeightMap, linesCount,
          acc, sourceLikeDiv,
          _scrollMap;

      sourceLikeDiv = $('<div />').css({
        position: 'absolute',
        visibility: 'hidden',
        height: 'auto',
        width: textarea[0].clientWidth,
        'font-size': textarea.css('font-size'),
        'font-family': textarea.css('font-family'),
        'line-height': textarea.css('line-height'),
        'white-space': textarea.css('white-space')
      }).appendTo('body');

      offset = markdownViewerEl.scrollTop() - markdownViewerEl.offset().top;
      _scrollMap = [];
      nonEmptyList = [];
      lineHeightMap = [];

      acc = 0;
      textarea.val().split('\n').forEach(function(str) {
        var h, lh;

        lineHeightMap.push(acc);

        if (str.length === 0) {
          acc++;
          return;
        }

        sourceLikeDiv.text(str);
        h = parseFloat(sourceLikeDiv.css('height'));
        lh = parseFloat(sourceLikeDiv.css('line-height'));
        acc += Math.round(h / lh);
      });
      sourceLikeDiv.remove();
      lineHeightMap.push(acc);
      linesCount = acc;

      for (i = 0; i < linesCount; i++) { _scrollMap.push(-1); }

      nonEmptyList.push(0);
      _scrollMap[0] = 0;

      markdownViewerEl.find('[data-with-line="true"]').each(function(n, el) {
        var $el = $(el), t = $el.data('line');
        if (t === '') { return; }
        t = lineHeightMap[t];
        if (t !== 0) { nonEmptyList.push(t); }
        _scrollMap[t] = Math.round($el.offset().top + offset);
      });

      nonEmptyList.push(linesCount);
      _scrollMap[linesCount] = markdownViewerEl[0].scrollHeight;

      pos = 0;
      for (i = 1; i < linesCount; i++) {
        if (_scrollMap[i] !== -1) {
          pos++;
          continue;
        }

        a = nonEmptyList[pos];
        b = nonEmptyList[pos + 1];
        _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a));
      }

      return _scrollMap;
    }


    var syncingSide = null;
    var syncingSideId = 0;

    var syncScroll = function(e) {
      if(syncingSide && syncingSide !== 'left'){
        return;
      }
      syncingSide = 'left';
      var ssid = ++syncingSideId;

      // console.log('Syncing side ' + syncingSide);

      var lineHeight = parseFloat(textarea.css('line-height')) || textareaLineHeight,
          lineNo, posTo;

      lineNo = Math.floor(textarea.scrollTop() / lineHeight);
      if (!scrollMap) { scrollMap = buildScrollMap(); }
      posTo = scrollMap[lineNo];
      markdownViewerEl.stop(true).animate({
        scrollTop: posTo
      }, 100, 'linear', function(){
        setTimeout(function() {
          syncScrollReversedDebounced.cancel();
          // console.log('STOP Syncing side ' + syncingSide);
          if(ssid === syncingSideId){
            syncingSide = null;
          }
        }, 100);
      });
    }

    var syncScrollReversed = function(e) {
      if(syncingSide && syncingSide !== 'right'){
        return;
      }
      syncingSide = 'right';
      var ssid = ++syncingSideId;

      // console.log('Syncing side ' + syncingSide);

      var lineHeight = parseFloat(textarea.css('line-height')) || textareaLineHeight,
          lineNo, posTo;

      if (!scrollMap) { scrollMap = buildScrollMap(); }

      var lineNo = 0;
      var scroll = markdownViewerEl.scrollTop();
      _.each(scrollMap, function(top, line) {
        if(top > scroll){
          return false;
        }else{
          lineNo = line;
        }
      });

      posTo = lineNo * lineHeight;
      textarea.stop(true).animate({
        scrollTop: posTo
      }, 100, 'linear', function(){
        setTimeout(function() {
          syncScrollDebounced.cancel();
          // console.log('STOP Syncing side ' + syncingSide);
          if(ssid === syncingSideId){
            syncingSide = null;
          }
        }, 100);
      });
    }

    var syncScrollDebounced = _.debounce(syncScroll, 50, { maxWait: 50 });
    var syncScrollReversedDebounced = _.debounce(syncScrollReversed, 50, { maxWait: 50 });
    
    textarea.on('scroll', syncScrollDebounced);
    markdownViewerEl.on('scroll', syncScrollReversedDebounced);

    textarea.on('input', function(){
      scrollMap = null;
    });

    markdownViewerReact.forceUpdate();

  };


  $(window).on('resize', function() {
    scrollMap = null;
  });


  var submitPostPageRegexp = /^\/submit\.html/;

  var checkSubmitPostPage = function() {
    var isSubmitPage = submitPostPageRegexp.test(window.location.pathname || '');
    if(isSubmitPage) {
      var sp = $('.SubmitPost');
      if(sp.length){
        makeMarkdownEditorBeautiful(sp);
      }
    }
  };

  $(window).on('changestate', function(e) {
    setTimeout(function() {
      checkSubmitPostPage();
    }, 100);
  });

  checkSubmitPostPage();

})();
