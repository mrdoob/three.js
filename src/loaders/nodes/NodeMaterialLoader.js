import { MaterialLoader } from '../../loaders/MaterialLoader.js';

class NodeMaterialLoader extends MaterialLoader {

	constructor( manager ) {

		super( manager );

		this.nodes = {};
		this.nodeMaterials = {};

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

	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	createMaterialFromType( type ) {

		const materialClass = this.nodeMaterials[ type ];

		if ( materialClass !== undefined ) {

			return new materialClass();

		}

		return super.createMaterialFromType( type );

	}

}

export default NodeMaterialLoader;
