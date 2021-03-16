import { Command } from '../Command.js';
import { Vector3 } from '../../../build/three.module.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param newScale THREE.Vector3
 * @param optionalOldScale THREE.Vector3
 * @constructor
 */
class SetScaleCommand extends Command {

	constructor( editor, object, newScale, optionalOldScale ) {

		super( editor );

		this.type = 'SetScaleCommand';
		this.name = 'Set Scale';
		this.updatable = true;

		this.object = object;

		if ( object !== undefined && newScale !== undefined ) {

			this.oldScale = object.scale.clone();
			this.newScale = newScale.clone();

		}

		if ( optionalOldScale !== undefined ) {

			this.oldScale = optionalOldScale.clone();

		}

	}

	execute() {

		this.object.scale.copy( this.newScale );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	undo() {

		this.object.scale.copy( this.oldScale );
		this.object.updateMatrixWorld( true );
		this.editor.signals.objectChanged.dispatch( this.object );

	}

	update( command ) {

		this.newScale.copy( command.newScale );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.oldScale = this.oldScale.toArray();
		output.newScale = this.newScale.toArray();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldScale = new Vector3().fromArray( json.oldScale );
		this.newScale = new Vector3().fromArray( json.newScale );

	}

}

export { SetScaleCommand };
