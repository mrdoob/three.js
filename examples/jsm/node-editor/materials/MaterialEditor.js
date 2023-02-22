import { BaseNode } from '../core/BaseNode.js';
import { ButtonInput } from '../../libs/flow.module.js';
import { exportJSON } from '../NodeEditorUtils.js';

export class MaterialEditor extends BaseNode {

	constructor( name, material, width = 300 ) {

		super( name, 1, material, width );

		this.context.add( new ButtonInput( 'Export' ).setIcon( 'ti ti-download' ).onClick( () => {

			exportJSON( this.material.toJSON(), 'node_material' );

		} ) );

	}

	get material() {

		return this.value;

	}

}
