import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param script javascript object
 * @constructor
 */
function AddScriptCommand( editor, object, script ) {

	Command.call( this, editor );

	this.type = 'AddScriptCommand';
	this.name = 'Add Script';

	this.object = object;
	this.script = script;

}

AddScriptCommand.prototype = {

	execute: function () {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) {

			this.editor.scripts[ this.object.uuid ] = [];

		}

		this.editor.scripts[ this.object.uuid ].push( this.script );

		this.editor.signals.scriptAdded.dispatch( this.script );

	},

	undo: function () {

		if ( this.editor.scripts[ this.object.uuid ] === undefined ) return;

		var index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );

		if ( index !== - 1 ) {

			this.editor.scripts[ this.object.uuid ].splice( index, 1 );

		}

		this.editor.signals.scriptRemoved.dispatch( this.script );

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.script = this.script;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.script = json.script;
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

};

export { AddScriptCommand };
