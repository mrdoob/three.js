import { MaterialLoader } from '../../loaders/MaterialLoader.js';

/**
 * A special type of material loader for loading node materials.
 *
 * @augments MaterialLoader
 */
class NodeMaterialLoader extends MaterialLoader {

	/**
	 * Constructs a new node material loader.
	 *
	 * @param {LoadingManager} [manager] - A reference to a loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Represents a dictionary of node types.
		 *
		 * @type {Object<string,Node.constructor>}
		 */
		this.nodes = {};

		/**
		 * Represents a dictionary of node material types.
		 *
		 * @type {Object<string,NodeMaterial.constructor>}
		 */
		this.nodeMaterials = {};

	}

	/**
	 * Parses the node material from the given JSON.
	 *
	 * @param {Object} json - The JSON definition
	 * @return {NodeMaterial}. The parsed material.
	 */
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

	/**
	 * Defines the dictionary of node types.
	 *
	 * @param {Object<string,Node.constructor>} value - The node library defined as `<classname,class>`.
	 * @return {NodeLoader} A reference to this loader.
	 */
	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	/**
	 * Defines the dictionary of node material types.
	 *
	 * @param {Object<string,NodeMaterial.constructor>} value - The node material library defined as `<classname,class>`.
	 * @return {NodeLoader} A reference to this loader.
	 */
	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	/**
	 * Creates a node material from the given type.
	 *
	 * @param {string} type - The node material type.
	 * @return {Node} The created node material instance.
	 */
	createMaterialFromType( type ) {

		const materialClass = this.nodeMaterials[ type ];

		if ( materialClass !== undefined ) {

			return new materialClass();

		}

		return super.createMaterialFromType( type );

	}

}

export default NodeMaterialLoader;
