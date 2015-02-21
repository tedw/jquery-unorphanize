//------------------------------------------------------------------------
// jQuery Unorphanize Plugin
//
// Forked from https://github.com/simeydotme/jquery-unorphanize
// Plugin boilerplate from https://github.com/jquery-boilerplate/jquery-boilerplate
//------------------------------------------------------------------------

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;
(function($, window, document, undefined) {

  "use strict";

  // undefined is used here as the undefined global variable in ECMAScript 3 is
  // mutable (ie. it can be changed by someone else). undefined isn't really being
  // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
  // can no longer be modified.

  // window and document are passed through as local variable rather than global
  // as this (slightly) quickens the resolution process and can be more efficiently
  // minified (especially when both are regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = "unorphanize",
    defaults = {
      words: 2,
      wrapEl: "",
      className: "",
      append: ""
    };

  // The actual plugin constructor

  function Plugin(element, options) {
    this.element = element;
    // jQuery has an extend method which merges the contents of two or
    // more objects, storing the result in the first object. The first object
    // is generally empty as we don't want to alter the default options for
    // future instances of the plugin
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  // Avoid Plugin.prototype conflicts
  $.extend(Plugin.prototype, {
    init: function() {
      // Place initialization logic here
      // You already have access to the DOM element and
      // the options via the instance, e.g. this.element
      // and this.settings
      // you can add more functions like the one below and
      // call them like so: this.yourOtherFunction(this.element, this.settings).
      var self = this;

      var $el = $(this.element);

      // Save html of element
      this.text = $.trim( $el.html() );

      // Find any STARTING html tags
      this.startTags = this.text.match(/<(\/?[A-Z][A-Z0-9]*)\b[^>]*>/gi);
      this.startTagsCount = ( this.startTags !== null ? this.startTags.length : 0 );

      // Replace STARTING tags with placeholder (e.g. __0__)
      this.startPlaceholders = [];
      for ( var i = 0; i < this.startTagsCount; i++ ) {
        // Push placeholder to array so we can replace it later
        this.startPlaceholders.push( "__" + i + "__" );
        // Replace tag with placeholder text
        this.text = this.text.replace( self.startTags[i], self.startPlaceholders[i] );
      }

      // Find any ENDING html tags
      this.endTags = this.text.match(/<\/[A-Z][A-Z0-9]*>/gi);
      this.endTagsCount = ( this.endTags !== null ? this.endTags.length : 0 );

      // Replace ENDING tags with different placeholder (e.g. ~~0~~)
      this.endPlaceholders = [];
      for ( var i = 0; i < this.endTagsCount; i++ ) {
        // Push placeholder to array so we can replace it later
        this.endPlaceholders.push( "~~" + i + "~~" );
        // Replace tag with placeholder text
        this.text = this.text.replace( self.endTags[i], self.endPlaceholders[i] );
      }

      // Create array of words from string
      this.wordArray = this.text.split(/\s+/);

      // Filter out tag placeholders
      function isWord( item ) {
        return !( item.match(/__[0-9]+__$/gi) || item.match(/~~[0-9]+~~$/gi) );
      }

      // Remove single tag placeholders from word array (they don't count as words)
      this.cleanWordArray = this.wordArray.filter( isWord );

      // Make sure word count is valid
      if ( typeof this.settings.words !== "number" || this.settings.words < 2 || this.settings.words >= this.cleanWordArray.length ) {
        this.settings.words = this._defaults.words;
      }

      // Find word where plugin should start
      this.lastWord = this.cleanWordArray.length - this.settings.words;

      // Find word position in original array
      this.lastWordIndex = this.wordArray.indexOf( self.cleanWordArray[ self.lastWord ] );

      // Split the original word array into two parts
      this.firstPart = self.wordArray.slice( 0, self.lastWordIndex ).join(' ');
      this.lastPart = self.wordArray.slice( self.lastWordIndex ).join(' ');

      // Validate settings variables
      if ( typeof this.settings.wrapEl !== "string" ) {
        this.settings.wrapEl = this._defaults.wrapEl;
      }
      if ( typeof this.settings.className !== "string" ) {
        this.settings.className = this._defaults.className;
      }
      if ( typeof this.settings.append !== "string" ) {
        this.settings.append = this._defaults.append;
      }

      // Add wrapper element
      if ( !!this.settings.wrapEl ) {
        this.text = this.firstPart + ' <' + this.settings.wrapEl + ' class="' + this.settings.className + '">' + this.lastPart + this.settings.append + '</' + this.settings.wrapEl + '>';
      }
      // Add &nbsp; entities
      else {
        this.lastPart = this.lastPart.split(' ').join('&nbsp;');
        this.text = this.firstPart + ' ' + this.lastPart;
      }

      // Replace the STARTING tag placeholders with the original tag code
      for( var i = 0; i < this.startTagsCount; i++ ) {
        var replaceRegex = new RegExp( this.startPlaceholders[i] );
        this.text = this.text.replace( replaceRegex , this.startTags[i] );
      }
      // Replace the ENDING tag placeholders with the original tag code
      for( var i = 0; i < this.endTagsCount; i++ ) {
        var replaceRegex = new RegExp( this.endPlaceholders[i] );
        this.text = this.text.replace( replaceRegex , this.endTags[i] );
      }

      // Update the element's html
      $el.html( this.text );
    }
  });

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);
