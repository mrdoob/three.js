/**
 * @author dforrer / https://github.com/dforrer
 */

/**
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue number, string, boolean or object
 * @constructor
 */

CmdSetMaterialValue = function ( object, attributeName, newValue ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterialValue';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.oldValue = ( object !== undefined ) ? object.material[ attributeName ] : undefined;
	this.newValue = newValue;
	this.attributeName = attributeName;

};

CmdSetMaterialValue.prototype = {

	execute: function () {

		this.object.material[ this.attributeName ] = this.newValue;
		this.object.material.needsUpdate = true;
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	undo: function () {

		this.object.material[ this.attributeName ] = this.oldValue;
		this.object.material.needsUpdate = true;
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};
