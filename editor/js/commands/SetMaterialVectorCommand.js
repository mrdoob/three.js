/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

var SetMaterialVectorCommand = function ( editor, object, attributeName, newValue, materialSlot ) {

	Command.call( this, editor );

	this.type = 'SetMaterialColorCommand';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.material = this.editor.getObjectMaterial( object, materialSlot );

	this.oldValue = ( this.material !== undefined ) ? this.material[ attributeName ].toArray() : undefined;
	this.newValue = newValue;

	this.attributeName = attributeName;

};

SetMaterialVectorCommand.prototype = {

	execute: function () {

		this.material[ this.attributeName ].fromArray( this.newValue );

		this.editor.signals.materialChanged.dispatch( this.material );

	},

	undo: function () {

		this.material[ this.attributeName ].fromArray( this.oldValue );

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
