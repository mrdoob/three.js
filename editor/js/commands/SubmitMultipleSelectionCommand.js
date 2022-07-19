import { Vector3, Quaternion, Euler } from 'three';
import { Command } from '../Command.js';
import { SetPositionCommand } from './SetPositionCommand.js';
import { SetScaleCommand } from './SetScaleCommand.js';
import { SetRotationCommand } from './SetRotationCommand.js';
import { RemoveMultipleSelectionGroupCommand } from './RemoveMultipleSelectionGroupCommand.js';

class SubmitMultipleSelectionCommand extends Command {

	constructor( editor, multipleSelection ) {

		super( editor );

		this.type = 'SubmitMultipleSelectionCommand';
		this.multipleSelection = multipleSelection;

	}

	_getPositionValue( mesh ) {

		const vector = new Vector3();
		mesh.getWorldPosition( vector );

		return vector;

	}

	_getRotationValue( mesh ) {

		const quaternion = new Quaternion();
		mesh.getWorldQuaternion( quaternion );
		const rotation = new Euler();
		rotation.setFromQuaternion( quaternion );

		return rotation;

	}

	_getScaleValue( mesh ) {

		const vector = new Vector3();
		mesh.getWorldScale( vector );

		return vector;

	}

	execute() {

		for ( const selectedMesh of this.multipleSelection.selectedMeshes ) {

			this.editor.execute( new SetPositionCommand( this.editor, selectedMesh._original_mesh, this._getPositionValue( selectedMesh ) ) );
			this.editor.execute( new SetScaleCommand( this.editor, selectedMesh._original_mesh, this._getScaleValue( selectedMesh ) ) );
			this.editor.execute( new SetRotationCommand( this.editor, selectedMesh._original_mesh, this._getRotationValue( selectedMesh ) ) );

		}

		this.editor.execute( new RemoveMultipleSelectionGroupCommand( this.editor ) );
		this.multipleSelection.disable();
		this.multipleSelection._displayOriginalMeshes();
		this.editor.signals.hideMultipleSelectionControls.dispatch();
		this.editor.signals.disableMultipleSelection.dispatch();

	}

}

export { SubmitMultipleSelectionCommand };
