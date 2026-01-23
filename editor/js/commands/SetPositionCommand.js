import { Command } from '../Command.js';
import { Vector3 } from 'three';

class SetPositionCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} object
	 * @param {THREE.Vector3|null} newPosition
	 * @param {THREE.Vector3|null} optionalOldPosition
	 * @constructor
	 */
	constructor( editor, object = null, newPosition = null, optionalOldPosition = null ) {

		super( editor );

		this.type = 'SetPositionCommand';
		this.name = editor.strings.getKey( 'command/SetPosition' );
		this.updatable = true;

		this.object = object;

		if ( object !== null && newPosition !== null ) {

			this.oldPosition = object.position.clone();
			this.newPosition = newPosition.clone();

		}

		if ( optionalOldPosition !== null ) {

			this.oldPosition = optionalOldPosition.clone();

		}

	}

	execute() {

		this.object.position.copy( this.newPosition );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

		this.object.position.copy( this.oldPosition );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	update( command ) {

		this.newPosition.copy( command.newPosition );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.oldPosition = this.oldPosition.toArray();
		output.newPosition = this.newPosition.toArray();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldPosition = new Vector3().fromArray( json.oldPosition );
		this.newPosition = new Vector3().fromArray( json.newPosition );

	}

}

export { SetPositionCommand };
