import { Command } from '../Command.js';

class MoveObjectCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {THREE.Object3D|null} [newParent=null]
	 * @param {THREE.Object3D|null} [newBefore=null]
	 * @constructor
	 */
	constructor( editor, object = null, newParent = null, newBefore = null ) {

		super( editor );

		this.type = 'MoveObjectCommand';
		this.name = editor.strings.getKey( 'command/MoveObject' );

		this.object = object;
		this.oldParent = ( object !== null ) ? object.parent : null;
		this.oldIndex = ( this.oldParent !== null ) ? this.oldParent.children.indexOf( this.object ) : null;
		this.newParent = newParent;

		if ( newBefore !== null ) {

			this.newIndex = ( newParent !== null ) ? newParent.children.indexOf( newBefore ) : null;

		} else {

			this.newIndex = ( newParent !== null ) ? newParent.children.length : null;

		}

		if ( this.oldParent === this.newParent && this.newIndex > this.oldIndex ) {

			this.newIndex --;

		}

		this.newBefore = newBefore;

	}

	execute() {

		this.oldParent.remove( this.object );

		const children = this.newParent.children;
		children.splice( this.newIndex, 0, this.object );
		this.object.parent = this.newParent;

		this.object.dispatchEvent( { type: 'added' } );
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	undo() {

		this.newParent.remove( this.object );

		const children = this.oldParent.children;
		children.splice( this.oldIndex, 0, this.object );
		this.object.parent = this.oldParent;

		this.object.dispatchEvent( { type: 'added' } );
		this.editor.signals.sceneGraphChanged.dispatch();

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.newParentUuid = this.newParent.uuid;
		output.oldParentUuid = this.oldParent.uuid;
		output.newIndex = this.newIndex;
		output.oldIndex = this.oldIndex;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.oldParent = this.editor.objectByUuid( json.oldParentUuid );
		if ( this.oldParent === undefined ) {

			this.oldParent = this.editor.scene;

		}

		this.newParent = this.editor.objectByUuid( json.newParentUuid );

		if ( this.newParent === undefined ) {

			this.newParent = this.editor.scene;

		}

		this.newIndex = json.newIndex;
		this.oldIndex = json.oldIndex;

	}

}

export { MoveObjectCommand };
