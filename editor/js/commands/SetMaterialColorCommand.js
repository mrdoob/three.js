import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */
function SetMaterialColorCommand( editor, object, attributeName, newValue, materialSlot ) {

	Command.call( this, editor );

	this.type = 'SetMaterialColorCommand';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.material = this.editor.getObjectMaterial( object, materialSlot );

	this.oldValue = ( this.material !== undefined ) ? this.material[ attributeName ].getHex() : undefined;
	this.newValue = newValue;

	this.attributeName = attributeName;

}

SetMaterialColorCommand.prototype = {

	execute: function () {

		this.material[ this.attributeName ].setHex( this.newValue );

		this.editor.signals.materialChanged.dispatch( this.material );

	},

	undo: function () {

		this.material[ this.attributeName ].setHex( this.oldValue );

		this.editor.signals.materialChanged.dispatch( this.material );

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

export { SetMaterialColorCommand };
