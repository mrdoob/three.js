import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class AddObjectCommand extends Command {

	constructor( editor, object, parent ) {

		super( editor );

		this.type = 'AddObjectCommand';

		this.object = object;
		this.parent = parent;
		if ( object !== undefined ) {

			this.name = `Add Object: ${object.name}`;

		}

	}

	execute() {

		this.editor.addObject( this.object, this.parent );
		this.editor.select( this.object );

	}

	undo() {

		this.editor.removeObject( this.object );
		this.editor.deselect();

	}

	toJSON() {

		const output = super.toJSON( this );

		output.object = this.object.toJSON();

		if ( this.parent !== undefined ) {

			output.parent = this.parent.toJSON();

		}

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.object.object.uuid );
		this.parent = this.editor.objectByUuid( json.parent.object.uuid );

		if ( this.object === undefined ) {

			const loader = new ObjectLoader();
			this.object = loader.parse( json.object );

		}

		if ( this.parent === undefined && json.parent !== undefined ) {

			this.parent = loader.parse( json.parent );

		}

	}

}

export { AddObjectCommand };
