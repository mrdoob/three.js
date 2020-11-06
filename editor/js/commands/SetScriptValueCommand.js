import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param script javascript object
 * @param attributeName string
 * @param newValue string, object
 * @constructor
 */
function SetScriptValueCommand( editor, object, script, attributeName, newValue ) {

	Command.call( this, editor );

	this.type = 'SetScriptValueCommand';
	this.name = 'Set Script.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.script = script;

	this.attributeName = attributeName;
	this.oldValue = ( script !== undefined ) ? script[ this.attributeName ] : undefined;
	this.newValue = newValue;

}

SetScriptValueCommand.prototype = {

	execute: function () {

		this.script[ this.attributeName ] = this.newValue;

		this.editor.signals.scriptChanged.dispatch();

	},

	undo: function () {

		this.script[ this.attributeName ] = this.oldValue;

		this.editor.signals.scriptChanged.dispatch();

	},

	update: function ( cmd ) {

		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.attributeName = json.attributeName;
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.script = this.editor.scripts[ json.objectUuid ][ json.index ];

	}

};

export { SetScriptValueCommand };
