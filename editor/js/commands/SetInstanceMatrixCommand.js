import { Command } from '../Command.js';
import { Matrix4 } from 'three';

function setInstanceMatrix( editor, object, instanceId, matrix ) {

	object.setMatrixAt( instanceId, matrix );
	object.instanceMatrix.needsUpdate = true;
	object.computeBoundingBox();
	object.computeBoundingSphere();
	editor.signals.objectChanged.dispatch( object );

}

class SetInstanceMatrixCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.InstancedMesh|null} object
	 * @param {number|null} instanceId
	 * @param {THREE.Matrix4|null} newMatrix
	 * @param {THREE.Matrix4|null} oldMatrix
	 */
	constructor( editor, object = null, instanceId = null, newMatrix = null, oldMatrix = null ) {

		super( editor );

		this.type = 'SetInstanceMatrixCommand';
		this.name = editor.strings.getKey( 'command/SetInstanceMatrix' );
		this.updatable = true;
		this.object = object;
		this.instanceId = instanceId;
		this.newMatrix = newMatrix !== null ? newMatrix.clone() : new Matrix4();
		this.oldMatrix = oldMatrix !== null ? oldMatrix.clone() : new Matrix4();

		if ( oldMatrix === null && object !== null && instanceId !== null ) {

			object.getMatrixAt( instanceId, this.oldMatrix );

		}

	}

	execute() {

		setInstanceMatrix( this.editor, this.object, this.instanceId, this.newMatrix );

	}

	undo() {

		setInstanceMatrix( this.editor, this.object, this.instanceId, this.oldMatrix );

	}

	update( command ) {

		this.newMatrix.copy( command.newMatrix );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.instanceId = this.instanceId;
		output.oldMatrix = this.oldMatrix.toArray();
		output.newMatrix = this.newMatrix.toArray();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.instanceId = json.instanceId;
		this.oldMatrix.fromArray( json.oldMatrix );
		this.newMatrix.fromArray( json.newMatrix );

	}

}

export { SetInstanceMatrixCommand, setInstanceMatrix };
