/**
 * @author dforrer / https://github.com/dforrer
 */

/**
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newValue integer representing a hex color value
 * @constructor
 */

CmdSetMaterialColor = function ( object, attributeName, newValue ) {

	Cmd.call( this );

	this.type = 'CmdSetMaterialColor';
	this.name = 'Set Material.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.attributeName = attributeName;
	this.oldValue = ( object !== undefined ) ? this.object.material[ this.attributeName ].getHex() : undefined;
	this.newValue = newValue;

};

CmdSetMaterialColor.prototype = {

	execute: function () {

		this.object.material[ this.attributeName ].setHex( this.newValue );
		this.editor.signals.materialChanged.dispatch( this.object.material );

	},

	undo: function () {

		this.object.material[ this.attributeName ].setHex( this.oldValue );
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

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

};
