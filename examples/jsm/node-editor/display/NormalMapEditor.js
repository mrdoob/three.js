import { SelectInput, Element, LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { NormalMapNode, FloatNode } from 'three-nodes/Nodes.js';
import { TangentSpaceNormalMap, ObjectSpaceNormalMap } from 'three';

const nullValue = new FloatNode( 0 ).setConst( true );

export class NormalMapEditor extends BaseNode {

	constructor() {

		const node = new NormalMapNode( nullValue );

		super( 'Normal Map', 3, node, 175 );

		const source = new LabelElement( 'Source' ).setInput( 3 ).onConnect( () => {

			node.node = source.getLinkedObject() || nullValue;

			this.invalidate();

		} );

		const scale = new LabelElement( 'Scale' ).setInput( 3 ).onConnect( () => {

			node.scaleNode = scale.getLinkedObject();

			this.invalidate();

		} );

		const optionsField = new SelectInput( [
			{ name: 'Tangent Space', value: TangentSpaceNormalMap },
			{ name: 'Object Space', value: ObjectSpaceNormalMap }
		], TangentSpaceNormalMap ).onChange( () => {

			node.normalMapType = Number( optionsField.getValue() );

			this.invalidate();

		} );

		this.add( new Element().add( optionsField ) )
			.add( source )
			.add( scale );

	}

}
