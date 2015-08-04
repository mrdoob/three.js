/**
 * @author mrdoob / http://mrdoob.com/
 */

var History = function ( editor ) {

	this.array = [];
	this.arrayLength = -1;

	this.current = -1;
	this.isRecording = true;

	//

	var scope = this;
	var signals = editor.signals;

	signals.objectAdded.add( function ( object ) {

		if ( scope.isRecording === false ) return;

		scope.add(
			function () {
				editor.removeObject( object );
				editor.select( null );
			},
			function () {
				editor.addObject( object );
				editor.select( object );
			}
		);

	} );

};

History.prototype = {

	add: function ( undo, redo ) {

		this.current ++;

		this.array[ this.current ] = { undo: undo, redo: redo };
		this.arrayLength = this.current;

	},

	undo: function () {

		if ( this.current < 0 ) return;

		this.isRecording = false;

		this.array[ this.current -- ].undo();

		this.isRecording = true;

	},

	redo: function () {

		if ( this.current === this.arrayLength ) return;

		this.isRecording = false;

		this.array[ ++ this.current ].redo();

		this.isRecording = true;

	},

	clear: function () {

		this.array = [];
		this.arrayLength = -1;

		this.current = -1;

	}

};
