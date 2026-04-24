import { Command } from '../Command.js';

class SetShadowValueCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} object
	 * @param {string} attributeName
	 * @param {number|string|boolean|Object|null} newValue
	 * @constructor
	 */
	constructor( editor, object = null, attributeName = '', newValue = null ) {

		super( editor );

		this.type = 'SetShadowValueCommand';
		this.name = editor.strings.getKey( 'command/SetShadowValue' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== null ) ? object.shadow[ attributeName ] : null;
		this.newValue = newValue;

	}

	execute() {

		this.object.shadow[ this.attributeName ] = this.newValue;
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

		this.object.shadow[ this.attributeName ] = this.oldValue;
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	update( cmd ) {

		this.newValue = cmd.newValue;

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;

	}

}

export { SetShadowValueCommand };
