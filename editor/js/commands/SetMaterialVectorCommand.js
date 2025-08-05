import { Command } from '../Command.js';

class SetMaterialVectorCommand extends Command {

	/**
	 *
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {string} [attributeName='']
	 * @param {THREE.Vector2|THREE.Vector3|THREE.Vector4|null} [newValue=null]
	 * @param {number} [materialSlot=-1]
	 * @constructor
	 */
	constructor( editor, object = null, attributeName = '', newValue = null, materialSlot = - 1 ) {

		super( editor );

		this.type = 'SetMaterialVectorCommand';
		this.name = editor.strings.getKey( 'command/SetMaterialVector' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.materialSlot = materialSlot;

		const material = ( object !== null ) ? editor.getObjectMaterial( object, materialSlot ) : null;

		this.oldValue = ( material !== null ) ? material[ attributeName ].toArray() : null;
		this.newValue = newValue;

		this.attributeName = attributeName;

	}

	execute() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.attributeName ].fromArray( this.newValue );

		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	undo() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.attributeName ].fromArray( this.oldValue );

		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	update( cmd ) {

		this.newValue = cmd.newValue;

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldValue = this.oldValue;
		output.newValue = this.newValue;
		output.materialSlot = this.materialSlot;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.objectUuid );
		this.attributeName = json.attributeName;
		this.oldValue = json.oldValue;
		this.newValue = json.newValue;
		this.materialSlot = json.materialSlot;

	}

}

export { SetMaterialVectorCommand };
