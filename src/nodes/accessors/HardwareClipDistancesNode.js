import Node from '../core/Node.js';
import { nodeObject } from '../tsl/TSLCore.js';
import ArrayElementNode from '../utils/ArrayElementNode.js';


class HardwareClipDistancesElementNode extends ArrayElementNode {

	constructor( node, indexNode ) {

		super( node, indexNode );

		this.isHardwareClipDistancesElementNode = true;

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;
		snippet = super.generate( builder );

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		// TODO: Possibly activate clip distance index on index access rather than from clipping context

		return snippet;

	}

}

class HardwareClipDistancesNode extends Node {

	constructor() {

		super( 'float' );

		this.isHardwareClipDistancesNode = true;

	}

	generate( builder ) {

		const clippingContext = builder.clippingContext;
		const { localClippingCount, globalClippingCount } = clippingContext;

		const numClippingPlanes = globalClippingCount + localClippingCount;

		const propertyName = builder.getClipDistances( numClippingPlanes || 1 );

		return propertyName;

	}

	element( indexNode ) {

		return nodeObject( new HardwareClipDistancesElementNode( this, nodeObject( indexNode ) ) );

	}

}

export const clipDistances = () => nodeObject( new HardwareClipDistancesNode() );
