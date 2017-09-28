
(function () {

  var createSettingsUI = function() {
    var list = $('<div class="smi-settings-groups-list"></div>');

    window.SteemMoreInfo.Settings.forEach(function(settings) {
      var group = $('<div class="smi-settings-group"></div>');

      group.append('<h5>' + settings.title + '</h5>');

      settings.settings.forEach(function(s) {
        var sEl = $('<div></div>');
        sEl.append('<div>' + (s.title || '') + '</div>');
        var value = window.SteemMoreInfo.Utils.getSettingsValue(s.key);
        if(s.options){
          var options = '<div class="smi-settings-options">';
          s.options.forEach(function(option) {
            options += '<label><input type="radio" name="' + s.key + '" value="' + option.value + '"' + (value === option.value ? ' checked="checked"' : '') + '>' + option.title + '</label>';
          });
          options += '</div>';
          sEl.append(options);
        }
        group.append(sEl);
        if(s.description){
          group.append('<p class="smi-settings-description">' + s.description + '</p>');
        }
        if(s.onChange) {
          group.find('input').data('onChangeFunction', s.onChange);
        }
      });

      list.append(group);
    });

    var container = $('<div class="smi-settings-container"></div>');
    container.append('<h4>Steemit More Info - Settings:</h4>');
    container.append(list);

    container.find('input').on('change', function() {
      var $this = $(this);
      var newValue = $this.val();
      var key = $this.attr('name');
      window.SteemMoreInfo.Utils.setSettingsValue(key, newValue);
      var callback = $this.data('onChangeFunction');
      if(callback){
        callback();
      }
    });

    return container;
  };




  var setupSettingsIfNeeded = function(settings) {
    if(settings.hasClass('smi-settings-added')){
      return;
    }
    var existingGroups = settings.children('div.row');
    var firstGroup = $(existingGroups[0]);
    settings.addClass('row');
    existingGroups.addClass('small-12 medium-6 large-4 columns').removeClass('row')
    existingGroups.children().each(function(){
      $(this).removeClass('small-12 medium-6 large-4 columns');
      firstGroup.append($(this));
    });
    existingGroups.each(function(index){
      if(index > 0){
        $(this).remove();
      }
    })
    settings.addClass('smi-settings-added');

    var smiGroup = $('<div class="small-12 medium-6 large-8 columns"></div>');
    smiGroup.append(createSettingsUI());
    settings.append(smiGroup);

  };


  //TODO: temp

  setInterval(function(){
    var settings = $('.Settings');
    if(settings.length){
      setupSettingsIfNeeded(settings);
    }
  },100);
  
  
})();
