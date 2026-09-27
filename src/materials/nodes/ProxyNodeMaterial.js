import { Material } from '../Material.js';

/**
 * A material instance that reuses the shader of a node material with its own uniforms.
 * All instances created from the same node material share a single shader build, so
 * configure the node material before creating instances. Instance values are read in
 * the shared node graph with `uniform( type, name )`.
 *
 * ```js
 * const nodeMaterial = new MeshBasicNodeMaterial();
 * nodeMaterial.colorNode = uniform( 'vec3', 'color' );
 *
 * const material = new ProxyNodeMaterial( nodeMaterial );
 * material.uniforms.color = new Vector3( 1, 0, 0 );
 * ```
 *
 * @augments Material
 */
class ProxyNodeMaterial extends Material {

	/**
	 * Constructs a new proxy node material.
	 *
	 * @param {NodeMaterial} nodeMaterial - The node material defining the shared shader.
	 * @throws {Error} When the given material is not a node material.
	 */
	constructor( nodeMaterial ) {

		super();

		if ( nodeMaterial?.isNodeMaterial !== true ) {

			throw new Error( 'ProxyNodeMaterial: The parameter must be a NodeMaterial.' );

		}

		copyProperties( this, nodeMaterial );

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

		/**
		 * The uniform values of this instance, read by `uniform( type, name )`
		 * nodes. Missing values fall back to the default value of the uniform type.
		 *
		 * @type {Object<string, any>}
		 * @default {}
		 */
		this.uniforms = {};

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
	 * Builds the shader of the node material while keeping this instance
	 * as `builder.material`.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	build( builder ) {

		this.nodeMaterial.build( builder );

	}

	/**
	 * Returns a new proxy node material that shares the same node material.
	 *
	 * @return {ProxyNodeMaterial} A clone of this instance.
	 */
	clone() {

		return new this.constructor( this.nodeMaterial ).copy( this );

	}

	/**
	 * Copies the values of the given proxy node material to this instance.
	 * Uniform values are cloned, except textures which remain shared.
	 *
	 * @param {ProxyNodeMaterial} source - The material to copy.
	 * @return {ProxyNodeMaterial} A reference to this instance.
	 */
	copy( source ) {

		copyProperties( this, source );

		this.uniforms = {};

		for ( const name in source.uniforms ) {

			const value = source.uniforms[ name ];

			this.uniforms[ name ] = value?.clone !== undefined && value.isTexture !== true ? value.clone() : value;

		}

		return this;

	}

}

// Copies configuration while preserving the target's identity and events.

function copyProperties( target, source ) {

	for ( const property of Object.keys( source ) ) {

		if ( property === 'uuid' || property === 'version' || property === '_listeners' ) continue;

		target[ property ] = source[ property ];

	}

}

export default ProxyNodeMaterial;
