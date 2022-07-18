import { Command } from '../Command.js';
import { SetPositionCommand } from './SetPositionCommand.js';
import { RemoveMultipleSelectionGroupCommand } from './RemoveMultipleSelectionGroupCommand.js';

class SubmitMultipleSelectionCommand extends Command {

	constructor( editor, multipleSelection ) {

		super( editor );

		this.type = 'SubmitMultipleSelectionCommand';
		this.multipleSelection = multipleSelection;

	}

	execute() {

		for ( const selectedMesh of this.multipleSelection.selectedMeshes ) {

			this.editor.execute( new SetPositionCommand( this.editor, selectedMesh._original_mesh, selectedMesh.matrixWorld.getPosition() ) );

		}

		this.editor.execute( new RemoveMultipleSelectionGroupCommand( this.editor ) );
		this.multipleSelection.disable();
		this.multipleSelection._displayOriginalMeshes();
		this.editor.signals.hideMultipleSelectionControls.dispatch();
		this.editor.signals.disableMultipleSelection.dispatch();

	}

}

export { SubmitMultipleSelectionCommand };
