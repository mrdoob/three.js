import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { JoinNode, UniformNode, float } from 'three/nodes';

const NULL_VALUE = new UniformNode( 0 );

export class JoinEditor extends BaseNodeEditor {

	constructor() {

		const node = new JoinNode();

		super( 'Join', node, 175 );

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

				nodes.push( float( values[ i ] || NULL_VALUE ) );

			}

			node.nodes = nodes;

			this.invalidate();

		};

		const xElement = new LabelElement( 'x | r' ).setInput( 1 ).onConnect( update );
		const yElement = new LabelElement( 'y | g' ).setInput( 1 ).onConnect( update );
		const zElement = new LabelElement( 'z | b' ).setInput( 1 ).onConnect( update );
		const wElement = new LabelElement( 'w | a' ).setInput( 1 ).onConnect( update );

		this.add( xElement )
			.add( yElement )
			.add( zElement )
			.add( wElement );

		update();

	}

}
