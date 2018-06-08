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

var SetMaterialValueCommand = function ( object, attributeName, newValue, materialSlot ) {

	Command.call( this );

	this.type = 'SetMaterialValueCommand';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.material = this.editor.getObjectMaterial( object, materialSlot );

	this.oldValue = ( this.material !== undefined ) ? this.material[ attributeName ] : undefined;
	this.newValue = newValue;

	this.attributeName = attributeName;

};

SetMaterialValueCommand.prototype = {

	execute: function () {

		this.material[ this.attributeName ] = this.newValue;
		this.material.needsUpdate = true;

		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.materialChanged.dispatch( this.material );

	},

	undo: function () {

		this.material[ this.attributeName ] = this.oldValue;
		this.material.needsUpdate = true;

		this.editor.signals.objectChanged.dispatch( this.object );
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

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};
