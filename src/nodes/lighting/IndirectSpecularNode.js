import Node from '../core/Node.js';
import { Fn, If, nodeObject, float, vec3, vec4 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';
import { normalWorld } from '../accessors/Normal.js';
import { cameraPosition } from '../accessors/Camera.js';
import { roughness } from '../core/PropertyNode.js';
import { materialEnvIntensity } from '../accessors/MaterialProperties.js';

/**
 * Resolves an ordered chain of indirect specular providers. Each provider returns
 * unweighted radiance in RGB and coverage in A, and fills its share of the remaining coverage.
 *
 * @augments Node
 */
class IndirectSpecularNode extends Node {

	static get type() {

		return 'IndirectSpecularNode';

	}

	/**
	 * Constructs a new indirect specular node.
	 *
	 * @param {Array<Function>} [providers=[]] - The radiance providers, in priority order.
	 */
	constructor( providers = [] ) {

		super( 'vec4' );

		this.providers = Object.freeze( providers.slice() );

		this.isIndirectSpecularNode = true;

	}

	/**
	 * Evaluates the chain for a world-space query.
	 *
	 * @param {Object} [query] - The lighting query.
	 * @return {Node<vec4>} Coverage-weighted radiance in RGB and resolved coverage in A.
	 */
	sample( { position = positionWorld, normal = normalWorld, viewDirection = cameraPosition.sub( position ).normalize(), direction = viewDirection.negate().reflect( normal ), roughness: roughnessNode = roughness, sampleIndex = float( 0 ) } = {} ) {

		const query = { position, normal, viewDirection, direction, roughness: roughnessNode, sampleIndex };

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
	 * Adapts this chain to a provider so it can be nested in another chain.
	 *
	 * @return {Function} A provider returning unweighted radiance and coverage.
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

export default IndirectSpecularNode;

/**
 * TSL function for creating an indirect specular node.
 *
 * @tsl
 * @function
 * @param {Array<Function>} providers - The radiance providers, in priority order.
 * @returns {IndirectSpecularNode}
 */
export const indirectSpecular = providers => nodeObject( new IndirectSpecularNode( providers ) );

/**
 * Specular provider for a filtered environment node.
 *
 * @tsl
 * @function
 * @param {Node} environment - The filtered environment.
 * @param {Node<float>|number} [intensity=materialEnvIntensity] - Lighting intensity.
 * @returns {Function} A radiance provider.
 */
export const environmentSpecular = ( environment, intensity = materialEnvIntensity ) => ( { direction, roughness: level } ) => {

	// isolate query inputs from the environment's UV and mip context
	const queryContext = { getUV: null, getTextureLevel: null };
	return vec4( environment.context( {
		getUV: () => nodeObject( direction ).context( queryContext ),
		getTextureLevel: () => float( level ).context( queryContext )
	} ).rgb.mul( intensity ), 1 );

};
