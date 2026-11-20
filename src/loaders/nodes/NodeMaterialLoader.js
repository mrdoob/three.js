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
		 * Represents a dictionary of deserialized node instances, keyed by UUID.
		 * They are assigned to the node properties of the parsed material.
		 *
		 * @type {Object<string,Node>}
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
	 * @return {Material} The parsed material.
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
	 * Defines the dictionary of deserialized node instances.
	 *
	 * @param {Object<string,Node>} value - The node instances defined as `<uuid,node>`.
	 * @return {NodeMaterialLoader} A reference to this loader.
	 */
	setNodes( value ) {

		this.nodes = value;
		return this;

	}

	/**
	 * Defines the dictionary of node material types.
	 *
	 * @param {Object<string,NodeMaterial.constructor>} value - The node material library defined as `<classname,class>`.
	 * @return {NodeMaterialLoader} A reference to this loader.
	 */
	setNodeMaterials( value ) {

		this.nodeMaterials = value;
		return this;

	}

	/**
	 * Creates a node material from the given type.
	 *
	 * @param {string} type - The node material type.
	 * @return {Material} The created material instance.
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
