/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newScale THREE.Vector3
 * @param optionalOldScale THREE.Vector3
 * @constructor
 */

var SetScaleCommand = function ( editor, object, newScale, optionalOldScale ) {

	Command.call( this, editor );

	this.type = 'SetScaleCommand';
	this.name = 'Set Scale';
	this.updatable = true;

	this.object = object;

	if ( object !== undefined && newScale !== undefined ) {

		this.oldScale = object.scale.clone();
		this.newScale = newScale.clone();

	}

	if ( optionalOldScale !== undefined ) {

		this.oldScale = optionalOldScale.clone();

	}

};

SetScaleCommand.prototype = {

	execute: function () {

		this.object.scale.copy( this.newScale );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object.scale.copy( this.oldScale );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	update: function ( command ) {

		this.newScale.copy( command.newScale );

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.oldScale = this.oldScale.toArray();
		output.newScale = this.newScale.toArray();

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldScale = new THREE.Vector3().fromArray( json.oldScale );
		this.newScale = new THREE.Vector3().fromArray( json.newScale );

	}

};
