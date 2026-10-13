import { Fn, Loop, PI, abs, cos, cross, float, normalize, select, sin, sqrt, vec3 } from 'three/tsl';
import { createConeTracer } from './VXGIConeTracer.js';

/**
 * Creates a world-space diffuse irradiance sampler for a prepared {@link VXGIVolume}.
 * Call `volume.update( renderer, scene )` before baking. The sampler uses eight
 * cosine-weighted cones and the volume's radiance, including cached bounces.
 * It can be passed directly to {@link LightMapper}, without a screen-space pass.
 *
 * @param {VXGIVolume} volume - The prepared voxel volume.
 * @return {function(Node<vec3>, Node<vec3>): Node<vec3>} The irradiance sampler.
 */
function vxgiIrradiance( volume ) {

	const trace = createConeTracer( volume, {
		radianceNode: volume.radianceNode,
		directionalNode: volume.directionalRadiance ? volume.directionalNode : null
	} );

	return ( position, normal ) => Fn( () => {

		const up = select( abs( normal.y ).lessThan( 0.99 ), vec3( 0, 1, 0 ), vec3( 1, 0, 0 ) );
		const tangent = normalize( cross( normal, up ) ).toConst();
		const bitangent = cross( normal, tangent ).toConst();
		const origin = position.add( normal.mul( volume.voxelSizeNode.mul( 1.5 ) ) ).toConst();
		const irradiance = vec3( 0 ).toVar();

		Loop( 8, ( { i } ) => {

			const u = float( i ).add( 0.5 ).div( 8 ).toConst();
			const phi = float( i ).mul( 0.618034 ).fract().mul( PI.mul( 2 ) ).toConst();
			const radius = sqrt( u ).toConst();
			const direction = normalize( tangent.mul( cos( phi ).mul( radius ) ).add( bitangent.mul( sin( phi ).mul( radius ) ) ).add( normal.mul( sqrt( u.oneMinus() ) ) ) );
			const cone = trace( origin, direction, float( Math.tan( Math.PI / 9 ) ), volume.traceDistanceNode );
			irradiance.addAssign( cone.color );

		} );

		return irradiance.mul( PI.div( 8 ) );

	} )();

}

export { vxgiIrradiance };
