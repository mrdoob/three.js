/**
 * Created by Daniel on 20.07.15.
 */

CmdAddScript = function ( object, script ) {

	Cmd.call( this );

	this.type = 'CmdAddScript';
	this.name = 'Add Script';

	this.object = object;
	this.objectUuid = ( object !== undefined ) ? object.uuid : undefined;

	this.script = script;

};

CmdAddScript.prototype = {

	init: function () {

		if ( this.object === undefined ) {

			this.object = this.editor.objectByUuid( this.objectUuid );

		}

	},

	execute: function () {

		this.init();

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

			this.editor.scripts[ this.object.uuid ] = [];

		}

		this.editor.scripts[ this.object.uuid ].push( this.script );

		this.editor.signals.scriptAdded.dispatch( this.script );

	},

	undo: function () {

		this.init();

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

		var index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

		if ( index !== - 1 ) {

			this.editor.scripts[ this.object.uuid ].splice( index, 1 );

		}

		this.editor.signals.scriptRemoved.dispatch( this.script );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.script = this.script;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.script = json.script;

	}

};
