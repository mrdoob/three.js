/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

/**
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */

var SetMaterialValueCommand = function ( object, attributeName, newValue, slot ) {

	Command.call( this );

	this.type = 'SetMaterialValueCommand';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;
	this.slot = slot;

	this.object = object;

	var material = this.editor.getObjectMaterial( this.object, this.slot );
	
	this.oldValue = ( material !== undefined ) ? material[ attributeName ] : undefined;
	this.newValue = newValue;
	this.attributeName = attributeName;

};

SetMaterialValueCommand.prototype = {

	execute: function () {
		var material = this.editor.getObjectMaterial( this.object, this.slot );
		material[ this.attributeName ] = this.newValue;
		material.needsUpdate = true;
		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.materialChanged.dispatch( material );

	},

	undo: function () {
		var material = this.editor.getObjectMaterial( this.object, this.slot );

		material[ this.attributeName ] = this.oldValue;
		material.needsUpdate = true;
		this.editor.signals.objectChanged.dispatch( this.object );
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

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};
