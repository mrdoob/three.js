/**
 * @author mrdoob / http://mrdoob.com/
 */

UI.ScriptEditor = function () {

	UI.Panel.call( this );

	var scope = this;

	var timeout;

	var textarea = new UI.TextArea();
	textarea.setWidth( '240px' );
	textarea.setHeight( '100px' );
	textarea.onKeyUp( function () {

		clearTimeout( timeout );

		timeout = setTimeout( function () {

			var object = editor.selected;
			var source = scope.getValue();

			try {

				var script = new Function( 'scene', 'time', source ).bind( object.clone() );
				script( new THREE.Scene(), 0 );

				textarea.dom.classList.add( 'success' );
				textarea.dom.classList.remove( 'fail' );

			} catch ( error ) {

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

	this.textarea = textarea;

};

UI.ScriptEditor.prototype = Object.create( UI.Panel.prototype );
UI.ScriptEditor.prototype.constructor = UI.ScriptEditor;

UI.ScriptEditor.prototype.getValue = function () {

	return this.textarea.getValue();

};

UI.ScriptEditor.prototype.setValue = function ( value ) {

	this.textarea.setValue( value );

	return this;

};

UI.ScriptEditor.prototype.onChange = function ( callback ) {

	this.onChangeCallback = callback;

	return this;

};
