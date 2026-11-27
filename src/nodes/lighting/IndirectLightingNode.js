import LightingNode from './LightingNode.js';
import { roughness, clearcoatRoughness, retroreflectivity } from '../core/PropertyNode.js';
import { cameraWorldMatrix } from '../accessors/Camera.js';
import { normalView, clearcoatNormalView, normalWorld } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { bentNormalView } from '../accessors/AccessorsUtils.js';
import { vec3, pow4 } from '../tsl/TSLBase.js';

/**
 * A provider of indirect specular light. It returns the radiance arriving around a direction,
 * filtered to the roughness of a specular lobe. It is asked once for each specular lobe of
 * a material, and what it returns goes through the BRDF of that lobe.
 *
 * The query holds the direction to look in, in world space, the roughness of the lobe and
 * the name of the lobe: `'base'`, `'clearcoat'` or `'retroreflective'`.
 *
 * @typedef {function({direction: Node<vec3>, roughness: Node<float>, lobe: string}, NodeBuilder): Node<vec3>} IndirectSpecularProvider
 */

/**
 * A provider of indirect diffuse light. It returns the irradiance arriving on a surface,
 * which goes through the diffuse BRDF of the material. The provider holds its own occlusion:
 * what it returns is not darkened by the ambient occlusion of the material afterwards.
 *
 * The query holds the normal of the surface, in world space.
 *
 * @typedef {function({normal: Node<vec3>}, NodeBuilder): Node<vec3>} IndirectDiffuseProvider
 */

/**
 * The default provider of indirect specular light: the environment and what the ambient
 * lights of the scene reflect. It is what a material uses if no other provider is set with
 * {@link builtinIndirectContext}, and what another provider calls for that light.
 *
 * @tsl
 * @function
 * @param {Object} query - The query.
 * @param {Node<vec3>} query.direction - The direction to look in, in world space.
 * @param {Node<float>} query.roughness - The roughness of the specular lobe.
 * @param {string} query.lobe - The name of the specular lobe.
 * @param {NodeBuilder} builder - The current node builder.
 * @return {Node<vec3>} The radiance.
 */
export const defaultIndirectSpecular = ( query, builder ) => {

	const { context } = builder;
	const { environmentNode } = context.indirectLightingNode;

	// the ambient lights have reflected into the target of each lobe

	const lights = query.lobe === 'clearcoat' ? context.lightingModel.clearcoatRadiance : context.radiance;

	return environmentNode !== null ? lights.add( environmentNode.getIndirectSpecular( query ) ) : lights;

};

/**
 * The default provider of indirect diffuse light: the environment, the light map and the
 * ambient lights of the scene, darkened by the ambient occlusion of the material. It is what
 * a material uses if no other provider is set with {@link builtinIndirectContext}, and what
 * another provider calls for that light.
 *
 * @tsl
 * @function
 * @param {Object} query - The query.
 * @param {Node<vec3>} query.normal - The normal of the surface, in world space.
 * @param {NodeBuilder} builder - The current node builder.
 * @return {Node<vec3>} The irradiance.
 */
export const defaultIndirectDiffuse = ( query, builder ) => {

	const { context } = builder;
	const { environmentNode } = context.indirectLightingNode;
	const { lightingModel } = context;

	// the light map and the ambient lights have added to the irradiance

	const irradiance = environmentNode !== null ? context.irradiance.add( environmentNode.getIndirectDiffuse( query ) ) : context.irradiance;

	const occlusion = ( lightingModel && lightingModel.getIndirectDiffuseOcclusion ) ? lightingModel.getIndirectDiffuseOcclusion( builder ) : context.ambientOcclusion;

	return irradiance.mul( occlusion );

};

/**
 * Supplies the indirect light of a material: the radiance of each of its specular lobes,
 * which is its indirect specular light, and the irradiance of its surface, which is its
 * indirect diffuse light.
 *
 * Each of the two comes from a provider. The default providers answer from the environment,
 * the light map and the ambient lights. A pass replaces them with {@link builtinIndirectContext}.
 *
 * @augments LightingNode
 */
class IndirectLightingNode extends LightingNode {

	static get type() {

		return 'IndirectLightingNode';

	}

	/**
	 * Constructs a new indirect lighting node.
	 *
	 * @param {?IndirectSpecularProvider} [specular=defaultIndirectSpecular] - The provider of indirect specular light, `null` for a material without specular lobes.
	 * @param {IndirectDiffuseProvider} [diffuse=defaultIndirectDiffuse] - The provider of indirect diffuse light.
	 * @param {?EnvironmentNode} [environmentNode=null] - The environment the default providers answer from.
	 */
	constructor( specular = defaultIndirectSpecular, diffuse = defaultIndirectDiffuse, environmentNode = null ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isIndirectLightingNode = true;

		this.specular = specular;
		this.diffuse = diffuse;
		this.environmentNode = environmentNode;

	}

	setup( builder ) {

		const { context, material } = builder;
		const { environmentNode } = this;

		if ( environmentNode !== null ) environmentNode.build( builder );

		// the default providers read the environment from here

		context.indirectLightingNode = this;

		// indirect diffuse, the provider holds its own occlusion

		const irradiance = vec3( this.diffuse( { normal: normalWorld }, builder ) ).toVar();

		context.irradiance.assign( vec3( 0 ) );
		context.occlusionAwareIrradiance.addAssign( irradiance );

		if ( this.specular === null ) return;

		// indirect specular, one query per lobe

		const useAnisotropy = material.useAnisotropy === true || material.anisotropy > 0;
		const baseNormalView = useAnisotropy ? bentNormalView : normalView;

		const ask = ( direction, roughnessNode, lobe ) => vec3( this.specular( { direction, roughness: roughnessNode, lobe }, builder ) );

		let radiance = ask( reflect( baseNormalView, roughness ), roughness, 'base' );

		if ( material.useRetroreflection === true || material.retroreflectivity > 0 ) {

			// the retroreflective lobe returns light toward its source, so it looks along the view direction

			const retro = ask( toWorld( positionViewDirection, baseNormalView, roughness ), roughness, 'retroreflective' );

			radiance = retroreflectivity.clamp().mix( radiance, retro );

		}

		context.radiance.assign( radiance );

		const clearcoatRadiance = context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			clearcoatRadiance.assign( ask( reflect( clearcoatNormalView, clearcoatRoughness ), clearcoatRoughness, 'clearcoat' ) );

		}

	}

}

export default IndirectLightingNode;

// Mixing the direction with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
const toWorld = ( directionView, normalViewNode, roughnessNode ) => pow4( roughnessNode ).mix( directionView, normalViewNode ).normalize().transformDirection( cameraWorldMatrix );

const reflect = ( normalViewNode, roughnessNode ) => toWorld( positionViewDirection.negate().reflect( normalViewNode ), normalViewNode, roughnessNode );
