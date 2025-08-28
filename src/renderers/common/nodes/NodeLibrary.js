/**
 * The purpose of a node library is to assign node implementations
 * to existing library features. In `WebGPURenderer` lights, materials
 * which are not based on `NodeMaterial` as well as tone mapping techniques
 * are implemented with node-based modules.
 *
 * @private
 */
class NodeLibrary {

	/**
	 * Constructs a new node library.
	 */
	constructor() {

		/**
		 * A weak map that maps lights to light nodes.
		 *
		 * @type {WeakMap<Light.constructor,AnalyticLightNode.constructor>}
		 */
		this.lightNodes = new WeakMap();

		/**
		 * A map that maps materials to node materials.
		 *
		 * @type {Map<string,NodeMaterial.constructor>}
		 */
		this.materialNodes = new Map();

		/**
		 * A map that maps tone mapping techniques (constants)
		 * to tone mapping node functions.
		 *
		 * @type {Map<number,Function>}
		 */
		this.toneMappingNodes = new Map();

	}

	/**
	 * Returns a matching node material instance for the given material object.
	 *
	 * This method also assigns/copies the properties of the given material object
	 * to the node material. This is done to make sure the current material
	 * configuration carries over to the node version.
	 *
	 * @param {Material} material - A material.
	 * @return {NodeMaterial} The corresponding node material.
	 */
	fromMaterial( material ) {

		if ( material.isNodeMaterial ) return material;

		let nodeMaterial = null;

		const nodeMaterialClass = this.getMaterialNodeClass( material.type );

		if ( nodeMaterialClass !== null ) {

			nodeMaterial = new nodeMaterialClass();

			for ( const key in material ) {

				nodeMaterial[ key ] = material[ key ];

			}

		}

		return nodeMaterial;

	}

	/**
	 * Adds a tone mapping node function for a tone mapping technique (constant).
	 *
	 * @param {Function} toneMappingNode - The tone mapping node function.
	 * @param {number} toneMapping - The tone mapping.
	 */
	addToneMapping( toneMappingNode, toneMapping ) {

		this.addType( toneMappingNode, toneMapping, this.toneMappingNodes );

	}

	/**
	 * Returns a tone mapping node function for a tone mapping technique (constant).
	 *
	 * @param {number} toneMapping - The tone mapping.
	 * @return {?Function} The tone mapping node function. Returns `null` if no node function is found.
	 */
	getToneMappingFunction( toneMapping ) {

		return this.toneMappingNodes.get( toneMapping ) || null;

	}

	/**
	 * Returns a node material class definition for a material type.
	 *
	 * @param {string} materialType - The material type.
	 * @return {?NodeMaterial.constructor} The node material class definition. Returns `null` if no node material is found.
	 */
	getMaterialNodeClass( materialType ) {

		return this.materialNodes.get( materialType ) || null;

	}

	/**
	 * Adds a node material class definition for a given material type.
	 *
	 * @param {NodeMaterial.constructor} materialNodeClass - The node material class definition.
	 * @param {string} materialClassType - The material type.
	 */
	addMaterial( materialNodeClass, materialClassType ) {

		this.addType( materialNodeClass, materialClassType, this.materialNodes );

	}

	/**
	 * Returns a light node class definition for a light class definition.
	 *
	 * @param {Light.constructor} light - The light class definition.
	 * @return {?AnalyticLightNode.constructor} The light node class definition. Returns `null` if no light node is found.
	 */
	getLightNodeClass( light ) {

		return this.lightNodes.get( light ) || null;

	}

	/**
	 * Adds a light node class definition for a given light class definition.
	 *
	 * @param {AnalyticLightNode.constructor} lightNodeClass - The light node class definition.
	 * @param {Light.constructor} lightClass - The light class definition.
	 */
	addLight( lightNodeClass, lightClass ) {

		this.addClass( lightNodeClass, lightClass, this.lightNodes );

	}

	/**
	 * Adds a node class definition for the given type to the provided type library.
	 *
	 * @param {Node.constructor} nodeClass - The node class definition.
	 * @param {number|string} type - The object type.
	 * @param {Map<number|string,Node.constructor>} library - The type library.
	 */
	addType( nodeClass, type, library ) {

		if ( library.has( type ) ) {

			console.warn( `Redefinition of node ${ type }` );
			return;

		}

		if ( typeof nodeClass !== 'function' ) throw new Error( `Node class ${ nodeClass.name } is not a class.` );
		if ( typeof type === 'function' || typeof type === 'object' ) throw new Error( `Base class ${ type } is not a class.` );

		library.set( type, nodeClass );

	}

	/**
	 * Adds a node class definition for the given class definition to the provided type library.
	 *
	 * @param {Node.constructor} nodeClass - The node class definition.
	 * @param {Node.constructor} baseClass - The class definition.
	 * @param {WeakMap<Node.constructor, Node.constructor>} library - The type library.
	 */
	addClass( nodeClass, baseClass, library ) {

		if ( library.has( baseClass ) ) {

			console.warn( `Redefinition of node ${ baseClass.name }` );
			return;

		}

		if ( typeof nodeClass !== 'function' ) throw new Error( `Node class ${ nodeClass.name } is not a class.` );
		if ( typeof baseClass !== 'function' ) throw new Error( `Base class ${ baseClass.name } is not a class.` );

		library.set( baseClass, nodeClass );

	}

}

export default NodeLibrary;
