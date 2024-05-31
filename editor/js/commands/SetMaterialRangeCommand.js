import { Command } from '../Command.js';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @param attributeName string
 * @param newMinValue number
 * @param newMaxValue number
 * @constructor
 */
class SetMaterialRangeCommand extends Command {

	constructor( editor, object = null, attributeName = '', newMinValue = - Infinity, newMaxValue = Infinity, materialSlot = - 1 ) {

		super( editor );

		this.type = 'SetMaterialRangeCommand';
		this.name = editor.strings.getKey( 'command/SetMaterialRange' ) + ': ' + attributeName;
		this.updatable = true;

		this.object = object;
		this.materialSlot = materialSlot;

		const material = ( object !== null ) ? editor.getObjectMaterial( object, materialSlot ) : null;

		this.oldRange = ( material !== null && material[ attributeName ] !== undefined ) ? [ ...this.material[ attributeName ] ] : null;
		this.newRange = [ newMinValue, newMaxValue ];

		this.attributeName = attributeName;

	}

	execute() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.attributeName ] = [ ...this.newRange ];
		material.needsUpdate = true;

		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	undo() {

		const material = this.editor.getObjectMaterial( this.object, this.materialSlot );

		material[ this.attributeName ] = [ ...this.oldRange ];
		material.needsUpdate = true;

		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	update( cmd ) {

		this.newRange = [ ...cmd.newRange ];

	}

	toJSON() {

		const output = super.toJSON( this );

		output.objectUuid = this.object.uuid;
		output.attributeName = this.attributeName;
		output.oldRange = [ ...this.oldRange ];
		output.newRange = [ ...this.newRange ];
		output.materialSlot = this.materialSlot;

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.attributeName = json.attributeName;
		this.oldRange = [ ...json.oldRange ];
		this.newRange = [ ...json.newRange ];
		this.object = this.editor.objectByUuid( json.objectUuid );
		this.materialSlot = json.materialSlot;

	}

}

export { SetMaterialRangeCommand };
