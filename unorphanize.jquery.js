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

  // Array.prototype.filter polyfill for old browsers
  // Source: https://github.com/Financial-Times/polyfill-service/blob/master/polyfills/Array.prototype.filter/polyfill.js
  if ( !Array.prototype.filter ) {
    Array.prototype.filter = function filter(callback) {
      if (this === undefined || this === null) {
        throw new TypeError(this + 'is not an object');
      }

      if (!(callback instanceof Function)) {
        throw new TypeError(callback + ' is not a function');
      }

      var
      object = Object(this),
        scope = arguments[1],
        arraylike = object instanceof String ? object.split('') : object,
        length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0,
        index = -1,
        result = [],
        element;

      while (++index < length) {
        element = arraylike[index];

        if (index in arraylike && callback.call(scope, element, index, object)) {
          result.push(element);
        }
      }

      return result;
    };
  }


  // Array.prototype.indexOf polyfill
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
  if ( !Array.prototype.indexOf ) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {

      var k;

      // 1. Let O be the result of calling ToObject passing
      //    the this value as the argument.
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get
      //    internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If len is 0, return -1.
      if (len === 0) {
        return -1;
      }

      // 5. If argument fromIndex was passed let n be
      //    ToInteger(fromIndex); else let n be 0.
      var n = +fromIndex || 0;

      if (Math.abs(n) === Infinity) {
        n = 0;
      }

      // 6. If n >= len, return -1.
      if (n >= len) {
        return -1;
      }

      // 7. If n >= 0, then Let k be n.
      // 8. Else, n<0, Let k be len - abs(n).
      //    If k is less than 0, then let k be 0.
      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

      // 9. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the
        //    HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        //    i.  Let elementK be the result of calling the Get
        //        internal method of O with the argument ToString(k).
        //   ii.  Let same be the result of applying the
        //        Strict Equality Comparison Algorithm to
        //        searchElement and elementK.
        //  iii.  If same is true, return k.
        if (k in O && O[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }


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

      // Exit if no text
      if ( $.trim( $el.text() ).length === 0 ) {
        return false;
      }

      // Save html of element
      this.text = $.trim( $el.html() );

      // Find any STARTING html tags
      this.startTags = this.text.match(/<([A-Z][A-Z0-9]*)\b[^>]*>/gi);
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

      // Save the _word_ positions in the original array
      var wordId = 1;
      this.wordPositions = [];

      // Create new array without any placeholder tags, which would throw off word count
      this.cleanWordArray = this.wordArray.map( function(item, i) {
        // Check for a single HTML tag replacement (e.g. <br> tag --> __1__)
        if ( !!item.match(/__[0-9]+__\b/gi) || !!item.match(/~~[0-9]+~~\b/gi) ) {
          // Increment wordID to help us track the word positions between the two arrays
          wordId++;
          return false;
        }
        else {
          // Save word position
          self.wordPositions.push(i);
          return item;
        }
      });

      // Remove false values from array
      this.cleanWordArray = this.cleanWordArray.filter( function(value) { return value; } );

      // Make sure word count is valid
      if ( typeof this.settings.words !== "number" || this.settings.words < 1 ) {
        this.settings.words = this._defaults.words;
      }
      // If only 1 orphan is specified, default to wrapping word, not using &nbsp;
      else if ( this.settings.words === 1 ) {
        this.settings.wrapEl = ( this.settings.wrapEl.length ? this.settings.wrapEl : "span" );
        this.settings.className = ( this.settings.className.length ? this.settings.className : "u-nowrap" );
      }
      // Don't allow orphan count to exceed the number of words
      else if ( this.settings.words >= this.cleanWordArray.length ) {
        this.settings.words = this.cleanWordArray.length;
      }

      // Find word where plugin should start
      this.lastWordPos = this.cleanWordArray.length - this.settings.words;
      // console.log('this.lastWordPos', this.lastWordPos, this.cleanWordArray[this.lastWordPos]);

      // Find word position in original array
      this.lastWordIndex = this.wordPositions[ this.lastWordPos ];
      // console.log('this.lastWordIndex', this.lastWordIndex, this.wordArray[ this.lastWordPos ]);

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
