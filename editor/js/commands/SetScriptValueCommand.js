/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

/**
 * @param object THREE.Object3D
 * @param script javascript object
 * @param attributeName string
 * @param newValue string, object
 * @param cursorPosition javascript object with format {line: 2, ch: 3}
 * @param scrollInfo javascript object with values {left, top, width, height, clientWidth, clientHeight}
 * @constructor
 */

var SetScriptValueCommand = function ( object, script, attributeName, newValue, cursorPosition, scrollInfo ) {

	Command.call( this );

	this.type = 'SetScriptValueCommand';
	this.name = 'Set Script.' + attributeName;
	this.updatable = true;

	this.object = object;
	this.script = script;

	this.attributeName = attributeName;
	this.oldValue = ( script !== undefined ) ? script[ this.attributeName ] : undefined;
	this.newValue = newValue;
	this.cursorPosition = cursorPosition;
	this.scrollInfo = scrollInfo;

};

SetScriptValueCommand.prototype = {

	execute: function () {

		this.script[ this.attributeName ] = this.newValue;

		this.editor.signals.scriptChanged.dispatch();
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script, this.cursorPosition, this.scrollInfo );

	},

	undo: function () {

		this.script[ this.attributeName ] = this.oldValue;

		this.editor.signals.scriptChanged.dispatch();
		this.editor.signals.refreshScriptEditor.dispatch( this.object, this.script, this.cursorPosition, this.scrollInfo );

	},

	update: function ( cmd ) {

		this.cursorPosition = cmd.cursorPosition;
		this.scrollInfo = cmd.scrollInfo;
		this.newValue = cmd.newValue;

	},

	toJSON: function () {

		var output = Command.prototype.toJSON.call( this );

		output.objectUuid = this.object.uuid;
		output.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;
		output.cursorPosition = this.cursorPosition;
		output.scrollInfo = this.scrollInfo;

		return output;

	},

	fromJSON: function ( json ) {

		Command.prototype.fromJSON.call( this, json );

		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.attributeName = json.attributeName;
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.script = this.editor.scripts[ json.objectUuid ][ json.index ];
		this.cursorPosition = json.cursorPosition;
		this.scrollInfo = json.scrollInfo;

	}

};
