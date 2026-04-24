import { Command } from '../Command.js';

import { ObjectLoader } from 'three';

class RemoveObjectCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @constructor
	 */
	constructor( editor, object = null ) {

		super( editor );

		this.type = 'RemoveObjectCommand';

		this.object = object;
		this.parent = ( object !== null ) ? object.parent : null;

		if ( this.parent !== null ) {

			this.index = this.parent.children.indexOf( this.object );

		}

		if ( object !== null ) {

			this.name = editor.strings.getKey( 'command/RemoveObject' ) + ': ' + object.name;


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
