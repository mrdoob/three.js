import NodeLoader from './NodeLoader.js';
import NodeMaterialLoader from './NodeMaterialLoader.js';

import { ObjectLoader } from '../../loaders/ObjectLoader.js';

/**
 * A special type of object loader for loading 3D objects using
 * node materials.
 *
 * @augments ObjectLoader
 */
class NodeObjectLoader extends ObjectLoader {

	/**
	 * Constructs a new node object loader.
	 *
	 * @param {LoadingManager?} manager - A reference to a loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Represents a dictionary of node types.
		 *
		 * @type {Object<String,Node.constructor>}
		 */
		this.nodes = {};

		/**
		 * Represents a dictionary of node material types.
		 *
		 * @type {Object<String,NodeMaterial.constructor>}
		 */
		this.nodeMaterials = {};

		/**
		 * A reference to hold the `nodes` JSON property.
		 *
		 * @private
		 * @type {Object?}
		 */
		this._nodesJSON = null;

	}

	/**
	 * Defines the dictionary of node types.
	 *
	 * @param {Object<String,Node.constructor>} value - The node library defined as `<classname,class>`.
	 * @return {NodeLoader} A reference to this loader.
	 */
	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	/**
	 * Defines the dictionary of node material types.
	 *
	 * @param {Object<String,NodeMaterial.constructor>} value - The node material library defined as `<classname,class>`.
	 * @return {NodeLoader} A reference to this loader.
	 */
	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	/**
	 * Parses the node objects from the given JSON.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {Function} onLoad - The onLoad callback function.
	 * @return {Object3D}. The parsed 3D object.
	 */
	parse( json, onLoad ) {

		this._nodesJSON = json.nodes;

		const data = super.parse( json, onLoad );

		this._nodesJSON = null; // dispose

		return data;

	}

	/**
	 * Parses the node objects from the given JSON and textures.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {Object<String,Texture>} textures - The texture library.
	 * @return {Object<String,Node>}. The parsed nodes.
	 */
	parseNodes( json, textures ) {

		if ( json !== undefined ) {

			const loader = new NodeLoader();
			loader.setNodes( this.nodes );
			loader.setTextures( textures );

			return loader.parseNodes( json );

		}

		return {};

	}

	/**
	 * Parses the node objects from the given JSON and textures.
	 *
	 * @param {Object} json - The JSON definition
	 * @param {Object<String,Texture>} textures - The texture library.
	 * @return {Object<String,NodeMaterial>}. The parsed materials.
	 */
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
