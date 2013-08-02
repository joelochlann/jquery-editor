/**
 * jQuery Editor
 *
 */

(function($) {

	var $currentlyEdited = false,
		$editor = false,
		editedClass = false,


	/**
	 * Open an editor
	 */
	openEditor = function($el, opts) {
		var currentValue = $el.text();

		// Set up keyboard bindings
		$(window).bind('keydown', opts, handleKeydown);
		$(window).bind('keyup', opts, handleKeyup);

		// No var because these are in the closure scope
		$editor = $('<input></input>');
		$currentlyEdited = $el;
		editedClass = opts.editedClass;

		// If cell has not been edited before, store its current value as
		// its original value - i.e. its value before any edits have taken place
		if ($el.attr('data-originalValue') === undefined) {
			$el.attr('data-originalValue', currentValue);
		}

		// Always store the current value as the previous value
		// i.e. its value before this particular edit
		$el.attr('data-previousValue', currentValue);

		$el.text('');

		// Copy contents and attributes of the element we're editing
		$editor
			.val(currentValue)
			.css({
				'position'    : 'absolute',
				'width'       : $el.outerWidth(),
				'height'      : $el.outerHeight(),
				'top'         : $el.offset().top,
				'left'        : $el.offset().left,
				'font-family' : $el.css('font-family'),
				'font-size'   : $el.css('font-size'),
				'font-weight' : $el.css('font-weight'),
				'border'      : 0
			})
			.attr('id', 'jqEditor')
			.appendTo('body')
			.blur(opts, function(event) {
				// Call custom callback, setting 'this' to currently edited cell
				opts.onblur.call( $currentlyEdited, event );
			})
			.trigger('focus')

		;
	},



	/**
	 * Close an editor
	 */
	closeEditor = function($el) {
		$editor.remove();
		$editor = false;
		$currentlyEdited = false;

		// Unbind event handlers not bound to editor
		$(window).unbind('keydown', handleKeydown);
		$(window).unbind('keyup', handleKeyup);
	},



	/**
	 * Store current edit in DOM element
	 */
	storeCurrentEdit = function($el) {
		if ($editor) {
			$el
				.text( $editor.val() )
				.editor('close')
			;

			if ($el.attr('data-originalValue') !== $el.text()) {
				$el.addClass(editedClass);
			} else {
				$el.removeAttr('data-originalValue');
				$el.removeClass(editedClass);
			}
		} else {
			console.warn('No editor open for cell with id '+$el.attr('id'));
		}
	},



	/**
	 * Restore DOM element to its previous value, before this edit had taken place
	 */
	cancelCurrentEdit = function($el) {
		if ( $el.attr('data-previousValue') !== undefined ) {
			$el
				.text( $el.attr('data-previousValue') )
				.removeAttr('data-previousValue')
				.editor('close')
			;

			if ( $el.attr('data-originalValue') === $el.text() ) {
				// If we're back to the original value, mark as unedited
				$el
					.removeAttr('data-originalValue')
					.removeClass(editedClass)
					.trigger('editor.unedited')
				;
			}
		} else {
			console.warn('Trying to cancel an edit on a cell which is not being edited, id '+$el.attr('id'));
		}
	},



	/**
	 * Store currently edited value in DOM then post to server
	 */
	saveCurrentEdit = function($el, opts) {
		var data = opts.data;

		$el.editor('store');

		data[$el.attr('id')] = $el.text();

        $.post({
            url : opts.url,
            data : data
        })
        .done( function() {
            // Mark cell as unedited
            $el
                .removeClass(editedClass)
                .removeAttr('data-originalValue')
            	.trigger('editor.unedited');
            
            opts.success();
        })
        .fail( function() { opts.failure() } );
	},



	/**
	 * Store currently edited value in DOM then post all unsaved changed to server
	 *
	 * $container determines where we want to look for unsaved changes.
	 * So if for instance it's called on a table, we'll save all changes on descendent elements of that table.
	 */
	saveAllEdits = function($container, opts) {
		var data = opts.data;

		if ($editor) {
			$currentlyEdited.editor('store');
		}

		$container.find('.'+editedClass).each( function() {
			var id = $(this).attr('id'),
				value = $(this).text();

			data[id] = value;
		});
        
        $.post({
            url : opts.url,
            data : data
        })
        .done( function() {
            // Mark cells as unedited
            $container
                .find('.'+editedClass)
                .removeClass(editedClass)
                .removeAttr('data-originalValue');
            
            // Elsewhere we trigger this event on the element actually being
            // edited/unedited. Since at this point nothing is being edited,
            // we have to call it on the element which saveAllEdits was called on.
            $container.trigger('editor.unedited');
            opts.success();
        })
        .fail( function() { opts.failure() } );
	},


	/**
	 * Restore DOM element to original value, before any edits had taken place
	 */
	revertToOriginalValue = function($el) {
		if ( $el.attr('data-originalValue') !== undefined ) {
			$el
				.text( $el.attr('data-originalValue') )
				.removeAttr('data-originalValue')
				.removeClass(editedClass)
			;

			closeEditor($el);
		} else {
			console.warn('Trying to revert an unedited cell with id '+$el.attr('id'));
		}
	},



	/**
	 * Handle keydown events
	 *
	 * Tiny function, but has to be given a name so that it can be unbound later
	 */
	handleKeydown = function(event) {
		// Call custom callback, setting 'this' to currently edited cell
		event.data.onkeydown.call( $currentlyEdited, event );
	},



	/**
	 * Handle keyup events
	 *
	 * Tiny function, but has to be given a name so that it can be unbound later
	 */
	handleKeyup = function(event) {
		if ($currentlyEdited.attr('data-originalValue') !== $editor.val()) {
			$currentlyEdited
				.addClass(editedClass)
				.trigger('editor.edited')
			;
		} else {
			$currentlyEdited
				.removeClass(editedClass)
				.trigger('editor.unedited')
			;
		}

		// Call custom callback, setting 'this' to currently edited cell
		event.data.onkeyup.call( $currentlyEdited, event );
	};



	/**
	 * jQuery plugin
	 *
	 */
	$.fn.editor = function(action, opts) {

		// These options are common to all actions.
		// May be overriden by calling code, or by specific action.
		var opts = $.extend({


		}, opts);


		if (typeof action === 'string') {

			switch (action) {

				case 'open':
					opts = $.extend({
						// Event handlers for the editor input,
						// which can be overriden by calling code.
						// Within handlers:
						//	  this = the currently edited cell
						//    event.target = the editor input box
						//    event.data = opts
						//
						onblur : function(event) {
							this.editor('store', event.data);
						},
						onkeydown : function(event) {
							// Esc
							if (event.keyCode === 27) {
								this.editor('revert', event.data);
							}

							// Enter
							if (event.keyCode === 13) {
								this.editor('store', event.data);
							}
						},
						onkeyup : function(event) { },

						// This is the class applied to cells when
						// they are in an edited state.
						editedClass : 'jqEdited'
					}, opts);

					openEditor(this, opts);

					break;


				case 'store':
					// Store currently edited value in DOM then post to server
					storeCurrentEdit(this);
					break;


				case 'cancel':
					// Restore DOM element to its previous value, before this edit had taken place
					cancelCurrentEdit(this);
					break;


				case 'revert':
					// Restore DOM element to original value, before any edits had taken place
					revertToOriginalValue(this);
					break;


				case 'save':
				case 'saveAll':

					opts = $.extend({
						// URL to post to
						url : null,
						// Additional data to post when saving
						data : {},
						// Callback to call when save request returns successfully
						success : function() {},
						// Callback when save request fails
						failure : function() {}
					}, opts);
                    
                    

					if (typeof opts.url !== 'string') {
						console.error('Must supply URL parameter when saving');
						break;
					}

					if (action === 'save') {
						// Store currently edited value in DOM then post to server
						saveCurrentEdit(this, opts);
					} else if (action === 'saveAll') {
						// If an editor is open, close and store the changes, and then post
						// all unsaved change to server. This can be called on an ancestor
						// element and it will save all unsaved changes to its descendents.
						saveAllEdits(this, opts);
					}

					break;


				case 'close':
					// Close editor
					closeEditor(this, opts);
					break;


				default:
					console.warn('Unknown command "'+action+'" for jquery.editor')

			}

		} else {
			console.error('Must supply an command string for jquery.editor');
		}

		// For method chaining
		return this;

	}
}(jQuery));


