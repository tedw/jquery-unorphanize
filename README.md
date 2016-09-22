#jQuery Unorphanize

--------------------
![gzip file size](https://badge-size.herokuapp.com/tedw/jquery-unorphanize/master/unorphanize.jquery.min.js?compression=gzip)

A jQuery helper for preventing [orphans](http://en.wikipedia.org/wiki/Widows_and_orphans).

##Basic Use
```js 
$(".selector").unorphanize();
```
Unorphanize will replace the last space with `&nbsp;` without disturbing any inner HTML.

##Advanced Useage
```js
$(".selector").unorphanize({
  words: 3,
  wrapEl: "span",
  className: "u-nowrap"
});
```
Unorphanize will wrap the last 3 words in a `<span>` with class `u-nowrap` without disturbing the inner HTML.

Using a wrapper element is typically better than `&nbsp;` because you can use CSS to prevent orphans only on wider screens. This prevents long words from extending beyond the parent container on mobile devices.

```css
@media all and (min-width: 320px) {
  .u-nowrap {
    white-space: nowrap !important;
  }
}
```

##Why is this plugin necessary?
If your element only contains plain text, you could do something simpler like this:
```js
var $el = $('.selector');
var words = $el.text().split(' ');
var lastWord = words.pop();
$el.html(words.join(' ') + '&nbsp;' + lastWord);
```
However, if the target element contains any HTML elements, they will be removed. Unorphanize preserves any inner HTML elements so you can safely use on user-generated content.
