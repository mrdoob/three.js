/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

/**
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */

var SetMaterialColorCommand = function ( object, attributeName, newValue, slot ) {

	Command.call( this );

	this.type = 'SetMaterialColorCommand';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.attributeName = attributeName;
	this.slot = slot;

	var material = this.editor.getObjectMaterial( this.object, this.slot );

	this.oldValue = ( material !== undefined ) ? material[ this.attributeName ].getHex() : undefined;
	this.newValue = newValue;
	
};

SetMaterialColorCommand.prototype = {

	execute: function () {
		var material = this.editor.getObjectMaterial( this.object, this.slot )
		material[ this.attributeName ].setHex( this.newValue );
		this.editor.signals.materialChanged.dispatch( material );

	},

	undo: function () {
		var material = this.editor.getObjectMaterial( this.object, this.slot )

		material[ this.attributeName ].setHex( this.oldValue );
		this.editor.signals.materialChanged.dispatch( material );

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
