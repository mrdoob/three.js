import { Command } from '../Command.js';

import { ObjectLoader } from '../../../build/three.module.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class RemoveObjectCommand extends Command {

	constructor( editor, object ) {

		super( editor );

		this.type = 'RemoveObjectCommand';
		this.name = 'Remove Object';

		this.object = object;
		this.parent = ( object !== undefined ) ? object.parent : undefined;
		if ( this.parent !== undefined ) {

			this.index = this.parent.children.indexOf( this.object );

		}

	}

	execute() {

		this.editor.removeObject( this.object );
		this.editor.deselect();

	}

	undo() {

		this.editor.addObject( this.object, this.parent, this.index );
		this.editor.select( this.object );

	}

	toJSON() {

		const output = super.toJSON( this );

		output.object = this.object.toJSON();
		output.index = this.index;
		output.parentUuid = this.parent.uuid;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.parent = this.editor.objectByUuid( json.parentUuid );
		if ( this.parent === undefined ) {

			this.parent = this.editor.scene;

		}

		this.index = json.index;

		this.object = this.editor.objectByUuid( json.object.object.uuid );

		if ( this.object === undefined ) {

			const loader = new ObjectLoader();
			this.object = loader.parse( json.object );

		}

	}

}

export { RemoveObjectCommand };
