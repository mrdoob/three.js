import { MaterialLoader } from 'three';

class NodeMaterialLoader extends MaterialLoader {

	constructor( manager ) {

		super( manager );

		this.nodes = {};

	}

	parse( json ) {

		const material = super.parse( json );

		const nodes = this.nodes;
		const inputNodes = json.inputNodes;

		for ( const property in inputNodes ) {

			const uuid = inputNodes[ property ];

			material[ property ] = nodes[ uuid ];

		}

		return material;

	}

	setNodes( value ) {

		this.nodes = value;

		return this;

	}

}

export default NodeMaterialLoader;
