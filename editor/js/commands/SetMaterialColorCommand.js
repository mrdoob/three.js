import { Command } from '../Command.js';

class SetMaterialColorCommand extends Command {

	/**
	 * @param {Editor} editor
	 * @param {THREE.Object3D|null} [object=null]
	 * @param {String} attributeName
	 * @param {Number|null} [newValue=null] Integer representing a hex color value
	 * @param {Number} [materialSlot=-1]
	 * @constructor
	 */
	constructor( editor, object = null, attributeName = '', newValue = null, materialSlot = - 1 ) {

		super( editor );

		this.type = 'SetMaterialColorCommand';
		this.name = editor.strings.getKey( 'command/SetMaterialColor' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.materialSlot = materialSlot;

		const material = ( object !== null ) ? editor.getObjectMaterial( object, materialSlot ) : null;

		this.oldValue = ( material !== null ) ? material[ attributeName ].getHex() : null;
		this.newValue = newValue;

		this.attributeName = attributeName;

	}

	execute() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.attributeName ].setHex( this.newValue );

		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	undo() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.attributeName ].setHex( this.oldValue );

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

export { SetMaterialColorCommand };
