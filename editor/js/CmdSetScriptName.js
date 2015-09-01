/**
 * Created by Daniel on 21.07.15.
 */

CmdSetScriptName = function ( object, script, name ) {

	Cmd.call( this );

	this.type = 'CmdSetScriptName';

	this.object = object;
	this.script = script;
	this.oldName = script !== undefined ? script.name : undefined;
	this.newName = name;
	this.objectUuid = object !== undefined ? object.uuid : undefined;

};

CmdSetScriptName.prototype = {

	execute: function () {

		this.index = this.editor.scripts[ this.objectUuid ].indexOf( this.script );
		this.script.name = this.newName;

		this.editor.signals.scriptChanged.dispatch();
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script );

	},

	undo: function () {

		this.script.name = this.oldName;

		this.editor.signals.scriptChanged.dispatch();
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.index = this.index;
		output.oldName = this.oldName;
		output.newName = this.newName;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.index = json.index;
		this.oldName = json.oldName;
		this.newName = json.newName;
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.script = this.editor.scripts[ json.objectUuid ][ json.index ];

	}

};
