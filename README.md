# jQuery Editor

A lightweight jQuery plugin for in-place editing of the DOM.
Works on divs and spans.

## Demo
http://jsbin.com/hofuma/2/

## Features
* Open
* Store
* Cancel
* Revert
* Save
* Save all
* Works with jQuery **1.9.0+**

## Installation

Quickest way is to [grab it via Bower](http://bower.io)

`bower install jquery.editor --save`

Or from npm

`npm install jquery.editor --save`

Failing that, simply clone this repo or [grab the file itself](https://raw.githubusercontent.com/joelochlann/jquery-editor/master/src/jquery.editor.js).

## Usage
### JS

jQuery Editor can be used as a normal script or with an AMD compatible loader like [RequireJS](http://requirejs.org)

#### Standard way

```html
<script src="http://code.jquery.com/jquery-latest.js"></script>
<script src="jquery.editor.js"></script>
<script>
    $('.tabs').editor({
	    // options
    });
</script>
```

#### AMD
jQuery Editor will work with RequireJS without any need for shims. Just ensure that `jquery` is set as a path.

```js
require.config({
	paths: {
		jquery: 'http://code.jquery.com/jquery-latest',
	}
});

require(['jquery', 'jquery.editor'], function($) {
	$('.tabs').editor();
});
```


### HTML
A simple example of markup.

```html
<div>
    <h1>Edit me</h2>
</div>
```
jQuery Editor has no expectations as to the structure of markup. It can edit any block-level *or inline element* *(is this true???)

**Note** Blah


## Options
* **delay** - _(number)_ DOESN'T EXIST _default_ `0`
* **editedClass** - _(string)_ Class to apply to elements which have been edited _default_ `jqEdited`
* **onblur** - _(function)_ - Called when an edited element loses focus. _default_ `null`
* **onkeydown** - _(function)_ - Called when a keydown event is fired inside an editor box
* **onkeyup** - _(function)_ - Called when a keyup event is fired inside an editor box

## Events
jQuery Editor fires various events that you can listen to. They are fired off the element that `editor` is instantiated  on.

```js
var $titles = $('h1').editor();

$titles.on('editor.edited', function() {
    // Do something
});

$titles.on('editor.reverted', function() {
    // Do something
});
```
### Event parameters

Every event handler receives the jQuery event object and also an object containing some useful properties:

* **currentTab** - _(jQuery object)_ The currently visible tab
* **currentTabIndex** - _(number)_ The index of the currently visible tab
* **currentNavItem** - _(jQuery object)_ The current selected nav item

```js
var $tabs = $('.tabs').herotabs();

$tabs.on('herotabs.show', function(event, tab) {
    tab.currentTab.addClass('currently-visible-tab');
    $('body').text('The current tab index is ' + tab.currentTabIndex);
    tab.currentNavItem.text('I am the current nav element');
});
```

### jquery.edited
Fired when editor is closed and the changed contents of the edited cell is saved

### jquery.reverted
Fired when an element is reverted to its pre-edited value

## Methods
You can get at the Herotabs instance by accessing it from the elements `.data` method

```js
var instance = $('.tabs').herotabs().data('herotabs');
instance.nextTab();
```

### open
Shows a tab. Accepts a zero based index or a jQuery element

```js
instance.showTab(2) // Index
instance.showTab($('.js-herotabs-tab').eq(1)) // jQuery element
```

### store
Store
```js
store()
```

### cancel
Cancel
```js
cancel()
```

### revert
Revert
```js
revert()
```

### save
Save
```js
save()
```

### saveAll
Save all

```js
saveAll()
```

### Chaining
All methods return the instance so you can chain as many calls as you wish
```js
instance.showTab(2).nextTab().nextTab();
```

### Accessing the constructor
If for any reason you need to override or add your own methods then you can access the Herotabs prototype before initialising it.

```js
var Editor = $.fn.editor.Editor;
Editor.prototype.newMethod = function() {
    // Something new!
};

var instance = $('h1').editor().data('data');
instance.newMethod();
```
## Example

```js
var $titles = $('h1');

$titles.editor({
    editedClass: 'editedByPlugin',
    onblur: function(event) {
      // By default we save on blur, but maybe
      // we want to avoid accidental edits
    	this.editor('revert', event.data);
    }
});

$titles.on('editor.editor', function() {
    window.alert('Edited!');
});
```

## Contributing
If you find a bug or need a feature added, please open an issue first.

### Running the tests

    npm install
    npm test
