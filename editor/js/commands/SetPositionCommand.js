import { Command } from '../Command.js';
import { Vector3 } from '../../../build/three.module.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newPosition THREE.Vector3
 * @param optionalOldPosition THREE.Vector3
 * @constructor
 */
class SetPositionCommand extends Command {

	constructor( editor, object, newPosition, optionalOldPosition ) {

		super( editor );

		this.type = 'SetPositionCommand';
		this.name = 'Set Position';
		this.updatable = true;

		this.object = object;

		if ( object !== undefined && newPosition !== undefined ) {

			this.oldPosition = object.position.clone();
			this.newPosition = newPosition.clone();

		}

		if ( optionalOldPosition !== undefined ) {

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
