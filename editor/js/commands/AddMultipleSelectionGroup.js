import { Group } from 'three';
import { Command } from '../Command.js';
import { AddObjectCommand } from './AddObjectCommand.js';

class AddMultipleSelectionGroup extends Command {

	constructor( editor, meshes ) {

		super( editor );

		this.type = 'AddMultipleSelectionGroup';
		this.meshes = meshes;

	}

	execute() {

		const group = new Group();
		group.name = 'Multiple Selection Group';
		this.meshes.forEach( mesh => group.add( mesh ) );

		this.editor.execute( new AddObjectCommand( this.editor, group ) );

	}

}

export { AddMultipleSelectionGroup };
