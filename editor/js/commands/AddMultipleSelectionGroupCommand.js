import { Command } from '../Command.js';
import { AddObjectCommand } from './AddObjectCommand.js';
import { MultipleSelectionGroup } from '../objects/MultipleSelectionGroup.js';

class AddMultipleSelectionGroupCommand extends Command {

	constructor( editor, meshes ) {

		super( editor );

		this.type = 'AddMultipleSelectionGroupCommand';
		this.meshes = meshes;

	}

	execute() {

		const group = new MultipleSelectionGroup();
		group.name = 'Multiple Selection Group';

		this.meshes.forEach( mesh => group.add( mesh ) );

		this.editor.execute( new AddObjectCommand( this.editor, group ) );

	}

}

export { AddMultipleSelectionGroupCommand };
