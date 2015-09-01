/**
 * Created by Daniel on 21.07.15.
 */

CmdToggleBoolean = function ( object, attributeName ) {

	Cmd.call( this );

	this.type = 'CmdToggleBoolean';

	this.object = object;
	this.attributeName = attributeName;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

};

CmdToggleBoolean.prototype = {

	execute: function () {

		this.object[ this.attributeName ] = !this.object[ this.attributeName ];
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	undo: function () {

		this.object[ this.attributeName ] = !this.object[ this.attributeName ];
		this.editor.signals.objectChanged.dispatch( this.object );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.attributeName = this.attributeName;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;

	}

};
