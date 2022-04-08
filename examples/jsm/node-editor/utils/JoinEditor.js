import { LabelElement } from '../../libs/flow.module.js';
import { BaseNode } from '../core/BaseNode.js';
import { JoinNode, UniformNode } from 'three-nodes/Nodes.js';

const NULL_VALUE = new UniformNode( 0 );

export class JoinEditor extends BaseNode {

	constructor() {

		const node = new JoinNode();

		super( 'Join', 1, node, 175 );

		const update = () => {

			const values = [
				xElement.getLinkedObject(),
				yElement.getLinkedObject(),
				zElement.getLinkedObject(),
				wElement.getLinkedObject()
			];

			let length = 1;

			if ( values[ 3 ] !== null ) length = 4;
			else if ( values[ 2 ] !== null ) length = 3;
			else if ( values[ 1 ] !== null ) length = 2;

			const nodes = [];

			for ( let i = 0; i < length; i ++ ) {

				nodes.push( values[ i ] || NULL_VALUE );

			}

			node.nodes = nodes;

			this.invalidate();

		};

		const xElement = new LabelElement( 'X | R' ).setInput( 1 ).onConnect( update );
		const yElement = new LabelElement( 'Y | G' ).setInput( 1 ).onConnect( update );
		const zElement = new LabelElement( 'Z | B' ).setInput( 1 ).onConnect( update );
		const wElement = new LabelElement( 'W | A' ).setInput( 1 ).onConnect( update );

		this.add( xElement )
			.add( yElement )
			.add( zElement )
			.add( wElement );

		update();

	}

}
