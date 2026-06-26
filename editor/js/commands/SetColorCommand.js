import { Command } from '../Command.js';

class SetColorCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {string} attributeName
	 * @param {?number} [newValue=null] Integer representing a hex color value
	 * @constructor
	 */
	constructor( editor, object = null, attributeName = '', newValue = null ) {

		super( editor );

		this.type = 'SetColorCommand';
		this.name = editor.strings.getKey( 'command/SetColor' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.attributeName = attributeName;
		this.oldValue = ( object !== null ) ? this.object[ this.attributeName ].getHex() : null;
		this.newValue = newValue;

	}

	execute() {

		this.object[ this.attributeName ].setHex( this.newValue );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

		this.object[ this.attributeName ].setHex( this.oldValue );
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

export { SetColorCommand };
