import { Command } from '../Command.js';
import { RemoveObjectCommand } from './RemoveObjectCommand.js';

class RemoveMultipleSelectionGroup extends Command {

	constructor( editor ) {

		super( editor );

		this.type = 'RemoveMultipleSelectionGroup';

	}

	execute() {

		const group = this.editor.scene.getObjectByName( 'Multiple Selection Group' );

		if ( group ) {

			this.editor.execute( new RemoveObjectCommand( this.editor, group ) );

		}

	}

}

export { RemoveMultipleSelectionGroup };
