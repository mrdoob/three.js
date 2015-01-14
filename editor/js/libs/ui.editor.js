/**
 * @author mrdoob / http://mrdoob.com/
 */

UI.ScriptEditor = function ( editor ) {

	UI.Panel.call( this );

	var scope = this;

	var name = new UI.Input().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		if ( scope.onChangeCallback !== undefined ) {

			scope.onChangeCallback();

		}

	} );
	this.add( name );

	var remove = new UI.Text( 'x' );
	remove.setPosition( 'absolute' );
	remove.setRight( '8px' );
	remove.setCursor( 'pointer' );
	remove.onClick( function () {

		if ( confirm( 'Are you sure?' ) ) {

			scope.parent.remove( scope );

			if ( scope.onChangeCallback !== undefined ) {

				scope.onChangeCallback();

			}

		}

	} );
	this.add( remove );

	this.add( new UI.Break() );

	var object = editor.selected.clone();
	var scene = editor.scene.clone();

	var timeout;

	var textarea = new UI.TextArea();
	textarea.setWidth( '100%' );
	textarea.setHeight( '150px' );
	textarea.setMarginTop( '8px' );
	textarea.onKeyUp( function () {

		clearTimeout( timeout );

		textarea.dom.classList.remove( 'success' );
		textarea.dom.classList.remove( 'fail' );

		timeout = setTimeout( function () {

			var source = textarea.getValue();

			try {

				( new Function( 'scene', 'keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove', 'update', source + '\nreturn { keydown: keydown, keyup: keyup, mousedown: mousedown, mouseup: mouseup, mousemove: mousemove, update: update };' ).bind( object ) )( scene );

				textarea.dom.classList.add( 'success' );
				textarea.dom.classList.remove( 'fail' );

			} catch ( error ) {

				console.error( error );

				textarea.dom.classList.remove( 'success' );
				textarea.dom.classList.add( 'fail' );

				return;

			}

			if ( scope.onChangeCallback !== undefined ) {

				scope.onChangeCallback();

			}

		}, 500 );

	} );
	this.add( textarea );

	this.name = name;
	this.textarea = textarea;

};

UI.ScriptEditor.prototype = Object.create( UI.Panel.prototype );
UI.ScriptEditor.prototype.constructor = UI.ScriptEditor;

UI.ScriptEditor.prototype.getValue = function () {

	return {
		name: this.name.getValue(),
		source: this.textarea.getValue()
	};

};

UI.ScriptEditor.prototype.setValue = function ( value ) {

	this.name.setValue( value.name );
	this.textarea.setValue( value.source );

	return this;

};

UI.ScriptEditor.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};
