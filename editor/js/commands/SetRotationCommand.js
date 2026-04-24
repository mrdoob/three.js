import { Command } from '../Command.js';
import { Euler } from 'three';

class SetRotationCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} object
	 * @param {THREE.Euler|null} newRotation
	 * @param {THREE.Euler|null} optionalOldRotation
	 * @constructor
	 */
	constructor( editor, object = null, newRotation = null, optionalOldRotation = null ) {

		super( editor );

		this.type = 'SetRotationCommand';
		this.name = editor.strings.getKey( 'command/SetRotation' );
		this.updatable = true;

		this.object = object;

		if ( object !== null && newRotation !== null ) {

			this.oldRotation = object.rotation.clone();
			this.newRotation = newRotation.clone();

		}

		if ( optionalOldRotation !== null ) {

			this.oldRotation = optionalOldRotation.clone();

		}

	}

	execute() {

		this.object.rotation.copy( this.newRotation );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

		this.object.rotation.copy( this.oldRotation );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	update( command ) {

		this.newRotation.copy( command.newRotation );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.oldRotation = this.oldRotation.toArray();
		output.newRotation = this.newRotation.toArray();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldRotation = new Euler().fromArray( json.oldRotation );
		this.newRotation = new Euler().fromArray( json.newRotation );

	}

}

export { SetRotationCommand };
