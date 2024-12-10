import { Command } from '../Command.js';

class SetScriptValueCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} object
	 * @param {String} script
	 * @param {String} attributeName
	 * @param {String} newValue
	 * @constructor
	 */
	constructor( editor, object = null, script = '', attributeName = '', newValue = null ) {

		super( editor );

		this.type = 'SetScriptValueCommand';
		this.name = editor.strings.getKey( 'command/SetScriptValue' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.script = script;

		this.attributeName = attributeName;
		this.oldValue = ( script !== '' ) ? script[ this.attributeName ] : null;
		this.newValue = newValue;

	}

	execute() {

		this.script[ this.attributeName ] = this.newValue;

		this.editor.signals.scriptChanged.dispatch( this.script );

	}

	undo() {

		this.script[ this.attributeName ] = this.oldValue;

		this.editor.signals.scriptChanged.dispatch( this.script );

	}

	update( cmd ) {

		this.newValue = cmd.newValue;

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.index = this.editor.scripts[ this.object.uuid ].indexOf( this.script );
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.attributeName = json.attributeName;
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.script = this.editor.scripts[ json.objectUuid ][ json.index ];

	}

}

export { SetScriptValueCommand };
