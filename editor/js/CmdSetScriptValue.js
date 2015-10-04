/**
 * Created by Daniel on 21.07.15.
 */

CmdSetScriptValue = function ( object, script, attributeName, newValue, cursorPosition ) {

	Cmd.call( this );

	this.type = 'CmdSetScriptValue';
	this.name = 'Set Script.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.script = script;

	this.attributeName = attributeName;
	this.oldValue = ( script !== undefined ) ? script[ this.attributeName ] : undefined;
	this.newValue = newValue;
	this.objectUuid = ( object !== undefined ) ? object.uuid : undefined;
	this.cursorPosition = cursorPosition; // Format {line: 2, ch: 3}

};

CmdSetScriptValue.prototype = {

	init: function () {

		if ( this.object === undefined ) {

			this.object = this.editor.objectByUuid( this.objectUuid );

		}
		if ( this.script === undefined ) {

			this.script = this.editor.scripts[ this.objectUuid ][ this.index ];

		}

	},

	execute: function () {

		this.init();

		this.index = this.editor.scripts[ this.objectUuid ].indexOf( this.script );
		this.script[ this.attributeName ] = this.newValue;

		this.editor.signals.scriptChanged.dispatch();
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script, this.cursorPosition );

	},

	undo: function () {

		this.init();

		this.script[ this.attributeName ] = this.oldValue;

		this.editor.signals.scriptChanged.dispatch();
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script, this.cursorPosition );

	},

	update: function ( cmd ) {

		this.cursorPosition = cmd.cursorPosition;
		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Cmd.prototype.toJSON.call( this );

		output.objectUuid = this.objectUuid;
		output.index = this.index;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;
		output.cursorPosition = this.cursorPosition;

		return output;

	},

	fromJSON: function ( json ) {

		Cmd.prototype.fromJSON.call( this, json );

		this.objectUuid = json.objectUuid;
		this.index = json.index;
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.cursorPosition = json.cursorPosition;

	}

};
