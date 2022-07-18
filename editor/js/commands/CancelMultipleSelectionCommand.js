import { Command } from '../Command.js';
import { RemoveMultipleSelectionGroupCommand } from './RemoveMultipleSelectionGroupCommand.js';

class CancelMultipleSelectionCommand extends Command {

	constructor( editor, multipleSelection ) {

		super( editor );

		this.type = 'CancelMultipleSelectionCommand';
		this.multipleSelection = multipleSelection;

	}

	execute() {

		this.editor.execute( new RemoveMultipleSelectionGroupCommand( this.editor ) );
		this.multipleSelection.disable();
		this.multipleSelection._displayOriginalMeshes();
		this.editor.signals.hideMultipleSelectionControls.dispatch();
		this.editor.signals.disableMultipleSelection.dispatch();

	}

}

export { CancelMultipleSelectionCommand };
