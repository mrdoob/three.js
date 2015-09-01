/**
 * Created by Daniel on 21.07.15.
 */

CmdSetScriptSource = function ( object, script, source, oldSource, cursorPosition ) {

	Cmd.call( this );

	this.type = 'CmdSetScriptSource';

	this.object = object;
	this.script = script;
	this.oldSource = oldSource !== undefined ? oldSource : undefined;
	this.newSource = source;
	this.objectUuid = object !== undefined ? object.uuid : undefined;
	this.cursorPosition = cursorPosition; // Format {line: 2, ch: 3}

};

CmdSetScriptSource.prototype = {

	execute: function () {

		this.index = this.editor.scripts[ this.objectUuid ].indexOf( this.script );
		this.script.source = this.newSource;

		this.editor.signals.scriptChanged.dispatch( this.script );
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script, this.cursorPosition );

	},

	undo: function () {

		this.script.source = this.oldSource;

		this.editor.signals.scriptChanged.dispatch( this.script );
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script, this.cursorPosition );

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.index = this.index;
		output.oldSource = this.oldSource;
		output.newSource = this.newSource;
		output.cursorPosition = this.cursorPosition;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.index = json.index;
		this.oldSource = json.oldSource;
		this.newSource = json.newSource;
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.script = this.editor.scripts[ json.objectUuid ][ json.index ];
		this.cursorPosition = json.cursorPosition;

	}

};
