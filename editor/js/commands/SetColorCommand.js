import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */
function SetColorCommand( editor, object, attributeName, newValue ) {

	Command.call( this, editor );

	this.type = 'SetColorCommand';
	this.name = 'Set ' + attributeName;
	this.updatable = true;

	this.object = object;
	this.attributeName = attributeName;
	this.oldValue = ( object !== undefined ) ? this.object[ this.attributeName ].getHex() : undefined;
	this.newValue = newValue;

}

SetColorCommand.prototype = {

	execute: function () {

		this.object[ this.attributeName ].setHex( this.newValue );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object[ this.attributeName ].setHex( this.oldValue );
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

};

export { SetColorCommand };
