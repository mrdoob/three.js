import { LabelElement } from 'flow';
import { BaseNodeEditor } from '../BaseNodeEditor.js';
import { JoinNode, UniformNode, float } from 'three/nodes';
import { setInputAestheticsFromType } from '../DataTypeLib.js';

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

			this.title.setOutput( length );

		};

		const xElement = setInputAestheticsFromType( new LabelElement( 'x | r' ), 'Number' ).onConnect( update );
		const yElement = setInputAestheticsFromType( new LabelElement( 'y | g' ), 'Number' ).onConnect( update );
		const zElement = setInputAestheticsFromType( new LabelElement( 'z | b' ), 'Number' ).onConnect( update );
		const wElement = setInputAestheticsFromType( new LabelElement( 'w | a' ), 'Number' ).onConnect( update );

		this.add( xElement )
			.add( yElement )
			.add( zElement )
			.add( wElement );

		update();

	}

}
