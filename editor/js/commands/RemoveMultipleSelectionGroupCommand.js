import { Command } from '../Command.js';
import { RemoveObjectCommand } from './RemoveObjectCommand.js';

class RemoveMultipleSelectionGroupCommand extends Command {

	constructor( editor ) {

		super( editor );

		this.type = 'RemoveMultipleSelectionGroupCommand';

	}

	execute() {

		const group = this.editor.scene.getObjectByProperty( 'type', 'MultipleSelectionGroup' );
		const pivotGroup = this.editor.scene.getObjectByProperty( 'name', 'Pivot Group' );

		if ( pivotGroup ) {

			this.editor.execute( new RemoveObjectCommand( this.editor, pivotGroup ) );

		}

		if ( group ) {

			this.editor.execute( new RemoveObjectCommand( this.editor, group ) );

		}

	}

}

export { RemoveMultipleSelectionGroupCommand };
