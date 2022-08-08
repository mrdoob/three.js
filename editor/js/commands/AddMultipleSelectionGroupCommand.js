import { Command } from '../Command.js';
import { AddObjectCommand } from './AddObjectCommand.js';
import { MultipleSelectionGroup } from '../objects/MultipleSelectionGroup.js';
import { Group, Sphere, Vector3 } from 'three';

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

		const positions = this.meshes.map( ( { matrixWorld } ) => {

			return new Vector3().setFromMatrixPosition( matrixWorld );

		} );
		const sphere = new Sphere().setFromPoints( positions );
		const pivotGroup = new Group();
		pivotGroup.name = 'Pivot Group';
		this.editor.execute( new AddObjectCommand( this.editor, pivotGroup ) );
		this.editor.execute( new AddObjectCommand( this.editor, group, pivotGroup ) );
		pivotGroup.position.set( sphere.center.x, sphere.center.y, sphere.center.z );
		group.position.set( - sphere.center.x, - sphere.center.y, - sphere.center.z );

	}

}

export { AddMultipleSelectionGroupCommand };
