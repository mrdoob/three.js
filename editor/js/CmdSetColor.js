/**
 * Created by Daniel on 21.07.15.
 */

CmdSetColor = function ( object, attributeName, newValue ) {

	Cmd.call( this );

	this.type = 'CmdSetColor';
	this.updatable = true;

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;
	this.attributeName = attributeName;
	this.oldValue = object !== undefined ? this.object[ this.attributeName ].getHex() : undefined;
	this.newValue = newValue;

};

CmdSetColor.prototype = {

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

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.objectUuid = json.objectUuid;
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

};
