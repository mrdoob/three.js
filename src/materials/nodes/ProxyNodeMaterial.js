import { Material } from '../Material.js';

/**
 * A material instance that reuses the shader of a node material with its own properties.
 * All instances created from the same node material share a single shader build, so
 * configure the node material before creating instances. Instance values are read in
 * the shared node graph with `materialReference( name, type )`. Node properties such as
 * `colorNode` are read-only and always read from the node material.
 *
 * ```js
 * const nodeMaterial = new MeshBasicNodeMaterial();
 * nodeMaterial.colorNode = materialReference( 'myColor', 'color' );
 *
 * const material = new ProxyNodeMaterial( nodeMaterial );
 * material.myColor = new Color( 1, 0, 0 );
 * ```
 *
 * @augments Material
 */
class ProxyNodeMaterial extends Material {

	/**
	 * Constructs a new proxy node material.
	 *
	 * @param {NodeMaterial} nodeMaterial - The node material defining the shared shader.
	 * @throws {TypeError} When the given material is not a node material.
	 */
	constructor( nodeMaterial ) {

		super();

		if ( nodeMaterial?.isNodeMaterial !== true ) {

			throw new TypeError( 'THREE.ProxyNodeMaterial: The parameter must be a NodeMaterial.' );

		}

		copyProperties( this, nodeMaterial );

		// Instance values often live in `userData`, so each instance starts with its own copy.

		this.userData = cloneUserData( nodeMaterial.userData );

		this.type = 'ProxyNodeMaterial';

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isProxyNodeMaterial = true;

		/**
		 * The node material defining the shared shader.
		 *
		 * @type {NodeMaterial}
		 */
		this.nodeMaterial = nodeMaterial;

	}

	/**
	 * Returns a cache key that identifies the shared shader, without traversing
	 * the node graph for each instance.
	 *
	 * @return {string} The custom program cache key.
	 */
	customProgramCacheKey() {

		return this.nodeMaterial.uuid + ',' + this.nodeMaterial.version;

	}

	/**
	 * Returns the uniform nodes of the node material, see {@link NodeMaterial#getUniformNodes}.
	 *
	 * @return {Array<UniformNode>} The uniform nodes.
	 */
	getUniformNodes() {

		return this.nodeMaterial.getUniformNodes();

	}

	/**
	 * Builds the shader of the node material while keeping this instance
	 * as `builder.material`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	build( builder ) {

		this.nodeMaterial.build( builder );

	}

	/**
	 * The version of the node material. Setting `needsUpdate` on the node material
	 * updates all its instances, while setting it on an instance has no effect.
	 *
	 * @type {number}
	 */
	get version() {

		return this.nodeMaterial.version;

	}

	set version( value ) {}

	/**
	 * Copies the values of the given proxy node material to this instance.
	 * Object values such as colors are shared with the source, except in `userData`.
	 * Unlike {@link Material#copy}, `userData` is not copied via JSON: its first level
	 * values are cloned when possible, so types such as colors are preserved. Textures
	 * remain shared.
	 *
	 * @param {ProxyNodeMaterial} source - The material to copy.
	 * @return {ProxyNodeMaterial} A reference to this instance.
	 */
	copy( source ) {

		copyProperties( this, source );

		this.userData = cloneUserData( source.userData );

		return this;

	}

	/**
	 * Returns a new proxy node material that shares the same node material.
	 *
	 * @return {ProxyNodeMaterial} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.nodeMaterial ).copy( this );

	}

}

// Read-only accessors shared by all instances, so node properties always reflect the node material.
// They must be enumerable since the renderer detects node materials by iterating their properties.

const _nodeDescriptors = {};

function getNodeDescriptor( property ) {

	return _nodeDescriptors[ property ] ??= {
		enumerable: true,
		get() {

			return this.nodeMaterial[ property ];

		}
	};

}

// Copies the first level of user data, cloning values such as colors and sharing textures.

function cloneUserData( userData ) {

	const result = {};

	for ( const key in userData ) {

		const value = userData[ key ];

		result[ key ] = value?.clone !== undefined && value.isTexture !== true ? value.clone() : value;

	}

	return result;

}

// Copies configuration while preserving the target's identity and events.

function copyProperties( target, source ) {

	for ( const property of Object.keys( source ) ) {

		if ( property === 'uuid' || property === 'version' || property === '_listeners' ) continue;

		if ( property.endsWith( 'Node' ) ) {

			if ( Object.hasOwn( target, property ) === false ) Object.defineProperty( target, property, getNodeDescriptor( property ) );

		} else {

			target[ property ] = source[ property ];

		}

	}

}

export default ProxyNodeMaterial;
