import Node from '../core/Node.js';
import { Fn, If, nodeObject, float, vec3, vec4 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';
import { normalWorld } from '../accessors/Normal.js';
import { cameraPosition } from '../accessors/Camera.js';
import { roughness } from '../core/PropertyNode.js';
import { materialEnvIntensity } from '../accessors/MaterialProperties.js';

/**
 * Resolves ordered, alternative estimates of indirect lighting. Providers receive
 * a query object and return a vec4: unweighted linear lighting in RGB and validity
 * coverage in A. Coverage is independent of brightness, intensity and occlusion:
 * a valid black sample must still consume coverage. Missing data returns vec4( 0 ).
 *
 * Each provider replaces its fraction of the remaining result. Providers must
 * estimate the same transport contribution; additional bounces must be composed
 * inside a provider, not added as fallback providers. Unresolved coverage stays black.
 *
 * @augments Node
 */
class IndirectLightingNode extends Node {

	constructor( providers ) {

		super( 'vec4' );

		this.providers = Object.freeze( providers.slice() );

	}

	/**
	 * Evaluates this chain for a query. The result's RGB is coverage-weighted and
	 * its A is the resolved coverage. Use asProvider() when nesting chains.
	 *
	 * @param {Object} query - The world-space lighting query.
	 * @return {Node<vec4>} The resolved lighting and coverage.
	 */
	resolve( query ) {

		return Fn( () => {

			const value = vec3( 0 ).toVar();
			const remaining = float( 1 ).toVar();

			for ( const provider of this.providers ) {

				If( remaining.greaterThan( 0 ), () => {

					const sample = vec4( provider( query ) ).toVar();
					const weight = remaining.mul( sample.a.clamp() ).toConst();
					value.addAssign( sample.rgb.mul( weight ) );
					remaining.subAssign( weight );

				} );

			}

			return vec4( value, remaining.oneMinus() );

		} )();

	}

	/**
	 * Adapts this chain to a provider without applying coverage twice.
	 *
	 * @return {Function} A provider returning unweighted lighting and coverage.
	 */
	asProvider() {

		return query => Fn( () => {

			const result = this.sample( query ).toConst();
			return vec4( result.rgb.div( result.a.max( 1e-6 ) ), result.a );

		} )();

	}

	setup() {

		return this.sample();

	}

}

/**
 * An indirect specular chain. Queries additionally contain viewDirection,
 * direction and roughness. RGB is filtered incoming radiance, before Fresnel.
 * Direction is the lobe sampling direction and can differ from reflect(-V, N),
 * e.g. for anisotropy, clearcoat or retroreflection.
 *
 * @augments IndirectLightingNode
 */
class IndirectSpecularNode extends IndirectLightingNode {

	static get type() {

		return 'IndirectSpecularNode';

	}

	constructor( providers = [] ) {

		super( providers );
		this.isIndirectSpecularNode = true;

	}

	sample( { position = positionWorld, normal = normalWorld, viewDirection = cameraPosition.sub( position ).normalize(), direction = viewDirection.negate().reflect( normal ), roughness: roughnessNode = roughness, sampleIndex = float( 0 ) } = {} ) {

		return this.resolve( { position, normal, viewDirection, direction, roughness: roughnessNode, sampleIndex } );

	}

}

export { IndirectSpecularNode };

export const indirectSpecular = providers => nodeObject( new IndirectSpecularNode( providers ) );

/**
 * Specular adapter for a filtered environment node.
 *
 * @param {Node} environment - The filtered environment.
 * @param {Node<float>|number} [intensity=materialEnvIntensity] - Lighting intensity.
 * @return {Function} A radiance provider.
 */
export const environmentSpecular = ( environment, intensity = materialEnvIntensity ) => ( { direction, roughness: level } ) => vec4( environment.context( { getUV: () => direction, getTextureLevel: () => level } ).rgb.mul( intensity ), 1 );
