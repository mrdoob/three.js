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

	constructor( editor, object, attributeName, newMinValue, newMaxValue, materialSlot ) {

		super( editor );

		this.type = 'SetMaterialRangeCommand';
		this.name = `Set Material.${attributeName}`;
		this.updatable = true;

		this.object = object;
		this.materialSlot = materialSlot;

		this.material = this.editor.getObjectMaterial( object, materialSlot );

		this.oldRange = ( this.material !== undefined && this.material[ attributeName ] !== undefined ) ? [ ...this.material[ attributeName ] ] : undefined;
		this.newRange = [ newMinValue, newMaxValue ];

		this.attributeName = attributeName;

	}

	execute() {

		this.material[ this.attributeName ] = [ ...this.newRange ];
		this.material.needsUpdate = true;

		this.editor.signals.objectChanged.dispatch( this.object );
		this.editor.signals.materialChanged.dispatch( this.object, this.materialSlot );

	}

	undo() {

		this.material[ this.attributeName ] = [ ...this.oldRange ];
		this.material.needsUpdate = true;

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

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.attributeName = json.attributeName;
		this.oldRange = [ ...json.oldRange ];
		this.newRange = [ ...json.newRange ];
		this.object = this.editor.objectByUuid( json.objectUuid );

	}

}

export { SetMaterialRangeCommand };
