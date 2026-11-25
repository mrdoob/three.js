import LightingNode from './LightingNode.js';
import { isolate } from '../core/IsolateNode.js';
import { float } from '../tsl/TSLBase.js';
import { pmremTexture } from '../pmrem/PMREMNode.js';
import { materialEnvIntensity } from '../accessors/MaterialProperties.js';
import { NodeUpdateType } from '../core/constants.js';

const _rendererCache = new WeakMap();

/**
 * Represents a physical model for Image-based lighting (IBL). The environment
 * is defined by an equirectangular or cube texture.
 * `EnvironmentNode` is intended for PBR materials like {@link MeshStandardNodeMaterial}.
 *
 * It answers queries for indirect specular and indirect diffuse light, which the default
 * providers of {@link IndirectLightingNode} ask.
 *
 * @augments LightingNode
 */
class EnvironmentNode extends LightingNode {

	static get type() {

		return 'EnvironmentNode';

	}

	/**
	 * Constructs a new environment node.
	 *
	 * @param {Node} [envNode=null] - A node representing the environment.
	 */
	constructor( envNode = null ) {

		super();

		/**
		 * A node representing the environment.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.envNode = envNode;

		/**
		 * The PMREM node of a texture or material reference environment. Its texture is
		 * resolved before rendering since materials with different environments can share a shader.
		 *
		 * @private
		 * @type {?PMREMNode}
		 * @default null
		 */
		this._pmremNode = null;

		/**
		 * The node the queries are evaluated on, which is the PMREM node if there is one.
		 *
		 * @private
		 * @type {?Node}
		 * @default null
		 */
		this._resolvedNode = null;

	}

	/**
	 * Resolves the environment. A texture is converted to PMREM here. The node contributes
	 * no light by itself: the default providers of {@link IndirectLightingNode} query it.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	setup( builder ) {

		let envNode = this.envNode;

		if ( envNode.isTextureNode || envNode.isMaterialReferenceNode ) {

			const cache = this._getPMREMNodeCache( builder.renderer );

			let pmremNode = cache.get( envNode );

			if ( pmremNode === undefined ) {

				pmremNode = pmremTexture( this._getEnvTexture( builder ) );

				cache.set( envNode, pmremNode );

			}

			this._pmremNode = pmremNode;
			this.updateBeforeType = envNode.isMaterialReferenceNode ? NodeUpdateType.OBJECT : NodeUpdateType.RENDER;

			envNode = pmremNode;

		}

		this._resolvedNode = envNode;

	}

	/**
	 * Returns the indirect specular light of the environment: the radiance arriving around
	 * the given direction, filtered to the given roughness.
	 *
	 * @param {Object} query - The query.
	 * @param {Node<vec3>} query.direction - The direction to look in, in world space.
	 * @param {Node<float>} query.roughness - The roughness of the specular lobe.
	 * @return {Node<vec3>} The radiance.
	 */
	getIndirectSpecular( { direction, roughness } ) {

		// an environment is any node that samples textures without coordinates or a level, so the query reaches it through the context

		return isolate( this._resolvedNode.context( { getUV: () => direction, getTextureLevel: () => roughness } ).mul( materialEnvIntensity ) );

	}

	/**
	 * Returns the indirect diffuse light of the environment: the irradiance arriving on a
	 * surface with the given normal.
	 *
	 * @param {Object} query - The query.
	 * @param {Node<vec3>} query.normal - The normal of the surface, in world space.
	 * @return {Node<vec3>} The irradiance.
	 */
	getIndirectDiffuse( { normal } ) {

		return isolate( this._resolvedNode.context( { getUV: () => normal, getTextureLevel: () => float( 1.0 ) } ).mul( Math.PI ).mul( materialEnvIntensity ) );

	}

	updateBefore( frame ) {

		const texture = this._getEnvTexture( frame );

		// the texture can be removed without a rebuild of the material

		if ( texture && this._pmremNode.value !== texture ) {

			this._pmremNode.value = texture;
			this._pmremNode.updateBefore( frame );

		}

	}

	/**
	 * Returns the current texture of the environment node.
	 *
	 * @private
	 * @param {(NodeFrame|NodeBuilder)} state - The current state.
	 * @return {Texture} The environment texture.
	 */
	_getEnvTexture( state ) {

		const envNode = this.envNode;

		if ( envNode.isMaterialReferenceNode ) {

			envNode.updateReference( state );

			return envNode.getValueFromReference();

		}

		return envNode.value;

	}

	/**
	 * Returns the PMREM node cache of the current renderer.
	 *
	 * @private
	 * @param {Renderer} renderer - The current renderer.
	 * @return {WeakMap} The node cache.
	 */
	_getPMREMNodeCache( renderer ) {

		let pmremCache = _rendererCache.get( renderer );

		if ( pmremCache === undefined ) {

			pmremCache = new WeakMap();

			_rendererCache.set( renderer, pmremCache );

		}

		return pmremCache;

	}

}

export default EnvironmentNode;
