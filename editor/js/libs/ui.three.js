/**
 * @author mrdoob / http://mrdoob.com/
 */

UI.Texture = function ( mapping ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'span' );

	var input = document.createElement( 'input' );
	input.type = 'file';
	input.addEventListener( 'change', function ( event ) {

		loadFile( event.target.files[ 0 ] );

	} );

	var canvas = document.createElement( 'canvas' );
	canvas.width = 32;
	canvas.height = 16;
	canvas.style.cursor = 'pointer';
	canvas.style.marginRight = '5px';
	canvas.style.border = '1px solid #888';
	canvas.addEventListener( 'click', function ( event ) {

		input.click();

	}, false );
	canvas.addEventListener( 'drop', function ( event ) {

		event.preventDefault();
		event.stopPropagation();
		loadFile( event.dataTransfer.files[ 0 ] );

	}, false );
	dom.appendChild( canvas );

	var name = document.createElement( 'input' );
	name.disabled = true;
	name.style.width = '64px';
	name.style.border = '1px solid #ccc';
	dom.appendChild( name );

	var loadFile = function ( file ) {

		if ( file.type.match( 'image.*' ) ) {

			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {

				var image = document.createElement( 'img' );
				image.addEventListener( 'load', function( event ) {

					var texture = new THREE.Texture( this, mapping );
					texture.sourceFile = file.name;
					texture.needsUpdate = true;

					scope.setValue( texture );

					if ( scope.onChangeCallback ) scope.onChangeCallback();

				}, false );

				image.src = event.target.result;

			}, false );

			reader.readAsDataURL( file );

		}

	}

	this.dom = dom;
	this.texture = null;
	this.onChangeCallback = null;

	return this;

};

UI.Texture.prototype = Object.create( UI.Element.prototype );
UI.Texture.prototype.constructor = UI.Texture;

UI.Texture.prototype.getValue = function () {

	return this.texture;

};

UI.Texture.prototype.setValue = function ( texture ) {

	var canvas = this.dom.children[ 0 ];
	var name = this.dom.children[ 1 ];
	var context = canvas.getContext( '2d' );

	if ( texture !== null ) {

		var image = texture.image;

		if ( image !== undefined && image.width > 0 ) {

			name.value = texture.sourceFile;

			var scale = canvas.width / image.width;
			context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

		} else {

			name.value = texture.sourceFile + ' (error)';
			context.clearRect( 0, 0, canvas.width, canvas.height );

		}

	} else {

		name.value = '';
		context.clearRect( 0, 0, canvas.width, canvas.height );

	}

	this.texture = texture;

};

UI.Texture.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};

// Outliner

UI.Outliner = function ( editor ) {

	UI.Element.call( this );

	var scope = this;

	var dom = document.createElement( 'div' );
	dom.className = 'Outliner';
	dom.tabIndex = 0;	// keyup event is ignored without setting tabIndex

	var scene = editor.scene;

	var sortable = Sortable.create( dom, {
		draggable: '.draggable',
		onUpdate: function ( event ) {

			var item = event.item;

			var object = scene.getObjectById( item.value );

			if ( item.nextSibling === null ) {

				editor.moveObject( object, editor.scene );

			} else {

				var nextObject = scene.getObjectById( item.nextSibling.value );
				editor.moveObject( object, nextObject.parent, nextObject );

			}

		}
	} );

	// Broadcast for object selection after arrow navigation
	var changeEvent = document.createEvent('HTMLEvents');
	changeEvent.initEvent( 'change', true, true );

	// Prevent native scroll behavior
	dom.addEventListener( 'keydown', function (event) {

		switch ( event.keyCode ) {
			case 38: // up
			case 40: // down
			event.preventDefault();
			event.stopPropagation();
			break;
		}

	}, false);

	// Keybindings to support arrow navigation
	dom.addEventListener( 'keyup', function (event) {

		switch ( event.keyCode ) {
			case 38: // up
			case 40: // down
			scope.selectedIndex += ( event.keyCode == 38 ) ? -1 : 1;

			if ( scope.selectedIndex >= 0 && scope.selectedIndex < scope.options.length ) {

				// Highlight selected dom elem and scroll parent if needed
				scope.setValue( scope.options[ scope.selectedIndex ].value );

				scope.dom.dispatchEvent( changeEvent );

			}

			break;
		}

	}, false);

	this.dom = dom;

	this.options = [];
	this.selectedIndex = -1;
	this.selectedValue = null;

	return this;

};

UI.Outliner.prototype = Object.create( UI.Element.prototype );
UI.Outliner.prototype.constructor = UI.Outliner;

UI.Outliner.prototype.setOptions = function ( options ) {

	var scope = this;

	var changeEvent = document.createEvent( 'HTMLEvents' );
	changeEvent.initEvent( 'change', true, true );

	while ( scope.dom.children.length > 0 ) {

		scope.dom.removeChild( scope.dom.firstChild );

	}

	scope.options = [];

	for ( var i = 0; i < options.length; i ++ ) {

		var option = options[ i ];

		var div = document.createElement( 'div' );
		div.className = 'option ' + ( option.static === true ? '': 'draggable' );
		div.innerHTML = option.html;
		div.value = option.value;
		scope.dom.appendChild( div );

		scope.options.push( div );

		div.addEventListener( 'click', function ( event ) {

			scope.setValue( this.value );
			scope.dom.dispatchEvent( changeEvent );

		}, false );

	}

	return scope;

};

UI.Outliner.prototype.getValue = function () {

	return this.selectedValue;

};

UI.Outliner.prototype.setValue = function ( value ) {

	for ( var i = 0; i < this.options.length; i ++ ) {

		var element = this.options[ i ];

		if ( element.value === value ) {

			element.classList.add( 'active' );

			// scroll into view

			var y = element.offsetTop - this.dom.offsetTop;
			var bottomY = y + element.offsetHeight;
			var minScroll = bottomY - this.dom.offsetHeight;

			if ( this.dom.scrollTop > y ) {

				this.dom.scrollTop = y

			} else if ( this.dom.scrollTop < minScroll ) {

				this.dom.scrollTop = minScroll;

			}

			this.selectedIndex = i;

		} else {

			element.classList.remove( 'active' );

		}

	}

	this.selectedValue = value;

	return this;

};
