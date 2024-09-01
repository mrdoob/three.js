import NodeLoader from './NodeLoader.js';
import NodeMaterialLoader from './NodeMaterialLoader.js';

import { ObjectLoader } from '../../loaders/ObjectLoader.js';

class NodeObjectLoader extends ObjectLoader {

	constructor( manager ) {

		super( manager );

		this.nodes = {};
		this.nodeMaterials = {};

		this._nodesJSON = null;

	}

	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	parse( json, onLoad ) {

		this._nodesJSON = json.nodes;

		const data = super.parse( json, onLoad );

		this._nodesJSON = null; // dispose

		return data;

	}

	parseNodes( json, textures ) {

		if ( json !== undefined ) {

			const loader = new NodeLoader();
			loader.setNodes( this.nodes );
			loader.setTextures( textures );

			return loader.parseNodes( json );

		}

		return {};

	}

	parseMaterials( json, textures ) {

		const materials = {};

		if ( json !== undefined ) {

			const nodes = this.parseNodes( this._nodesJSON, textures );

			const loader = new NodeMaterialLoader();
			loader.setTextures( textures );
			loader.setNodes( nodes );
			loader.setNodeMaterials( this.nodeMaterials );

			for ( let i = 0, l = json.length; i < l; i ++ ) {

				const data = json[ i ];

				materials[ data.uuid ] = loader.parse( data );

			}

		}

		return materials;

	}

}

export default NodeObjectLoader;
