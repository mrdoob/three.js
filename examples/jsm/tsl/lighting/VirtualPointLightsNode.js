import { IrradianceNode } from 'three/webgpu';
import { Fn, If, Loop, dot, float, max, normalWorld, positionWorld, uniform, uniformArray, vec3 } from 'three/tsl';

/**
 * Adds single-bounce VPL irradiance to standard node materials via `lights()`.
 * The visibility callback is optional and returns 0 for occluded segments, 1 otherwise.
 * Cost scales with the number of VPLs per shaded fragment. Distance clamping
 * reduces singularities at the expense of energy near the emitters.
 *
 * @augments IrradianceNode
 * @three_import import { VirtualPointLightsNode } from 'three/addons/tsl/lighting/VirtualPointLightsNode.js';
 */
class VirtualPointLightsNode extends IrradianceNode {

	static get type() {

		return 'VirtualPointLightsNode';

	}

	/**
	 * @param {VirtualPointLightGenerator} generator - The CPU sample data.
	 * @param {?Function} [visibility=null] - Segment visibility callback accepting two vec3 nodes.
	 */
	constructor( generator, visibility = null ) {

		super( null );

		this.generator = generator;
		/** @type {UniformNode<float>} Indirect-light multiplier; zero disables evaluation. */
		this.intensity = uniform( 1 );
		/** @type {UniformNode<bool>} Whether to evaluate the visibility callback. */
		this.shadows = uniform( true );
		/** @type {UniformNode<float>} Minimum attenuation distance in world units. */
		this.minDistance = uniform( Math.sqrt( 0.2 ) );
		/** @type {UniformNode<float>} Surface-normal offset for both segment endpoints. */
		this.bias = uniform( 0.01 );
		this.count = uniform( generator.count, 'int' );
		const positions = uniformArray( generator.positions, 'vec3' );
		const normals = uniformArray( generator.normals, 'vec3' );
		const flux = uniformArray( generator.flux, 'vec3' );

		this.node = Fn( () => {

			const x = positionWorld;
			const n = normalWorld.normalize();
			const sum = vec3( 0 ).toVar();

			If( this.intensity.greaterThan( 0 ), () => {

				Loop( this.count, ( { i } ) => {

					const y = positions.element( i );
					const ny = normals.element( i );
					const v = y.sub( x );
					const distanceSquared = max( dot( v, v ), 1e-8 );
					const w = v.div( distanceSquared.sqrt() );
					const cosine = max( dot( n, w ), 0 ).mul( max( dot( ny, w.negate() ), 0 ) );

					If( cosine.greaterThan( 0 ), () => {

						const visible = getVisibility( visibility, this.shadows, x.add( n.mul( this.bias ) ), y.add( ny.mul( this.bias ) ) );
						const attenuation = cosine.div( max( distanceSquared, this.minDistance.mul( this.minDistance ) ) );
						sum.addAssign( flux.element( i ).mul( attenuation.mul( visible ).div( Math.PI ) ) );

					} );

				} );

			} );

			return sum.mul( this.intensity );

		} )();

	}

	/** Updates the active count after regenerating samples. */
	update() {

		this.count.value = this.generator.count;

	}

}

function getVisibility( visibility, shadows, start, end ) {

	const value = float( 1 ).toVar();
	if ( visibility !== null ) {

		If( shadows, () => {

			value.assign( visibility( start, end ) );

		} );

	}

	return value;

}

export { VirtualPointLightsNode };
