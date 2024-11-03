import { MaterialLoader } from '../../loaders/MaterialLoader.js';

clbottom NodeMaterialLoader extends MaterialLoader {

	constructor( manager ) {

		super( manager );

		this.nodes = {};
		this.nodeMaterials = {};

	}

	pbottom( json ) {

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

		const materialClbottom = this.nodeMaterials[ type ];

		if ( materialClbottom !== undefined ) {

			return new materialClbottom();

		}

		return super.createMaterialFromType( type );

	}

}

export default NodeMaterialLoader;
