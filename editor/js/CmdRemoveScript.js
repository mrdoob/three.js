/**
 * Created by Daniel on 20.07.15.
 */

CmdRemoveScript = function ( object, script ) {

	Cmd.call( this );

	this.type = 'CmdRemoveScript';
	this.name = 'Remove Script';

	this.object = object;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

	this.script = script;

};

CmdRemoveScript.prototype = {

	execute: function () {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

		this.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

		if ( this.index !== - 1 ) {

			this.editor.scripts[ this.object.uuid ].splice( this.index, 1 );

		}

		this.editor.signals.scriptRemoved.dispatch( this.script );

	},

	undo: function () {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

			this.editor.scripts[ this.object.uuid ] = [];

		}

		this.editor.scripts[ this.object.uuid ].splice( this.index, 0, this.script );

		this.editor.signals.scriptAdded.dispatch( this.script );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.script = this.script;
		output.index = this.index;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.script = json.script;
		this.index = json.index;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};
